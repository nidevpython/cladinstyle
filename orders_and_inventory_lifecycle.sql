-- 1. Normalize existing orders casing to lowercase to avoid constraint errors
UPDATE public.orders SET payment_status = LOWER(payment_status);
UPDATE public.orders SET order_status = LOWER(order_status);

-- 2. Safely add check constraints to public.orders table
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_check 
  CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_order_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_order_status_check 
  CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'));

-- 3. Create the public.order_status_history table
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT order_status_history_status_check CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'))
);

-- Create index on order_id to optimize tracking selects
CREATE INDEX IF NOT EXISTS order_status_history_order_id_idx ON public.order_status_history(order_id);

-- Enable RLS on history table
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for order history owner or admin" ON public.order_status_history;
DROP POLICY IF EXISTS "Allow admins to manage all status history" ON public.order_status_history;

CREATE POLICY "Allow select for order history owner or admin"
ON public.order_status_history FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_status_history.order_id 
        AND (
            (auth.uid() IS NOT NULL AND orders.user_id = auth.uid()) OR
            (public.is_admin() = true) OR
            (orders.user_id IS NULL)
        )
    )
);

CREATE POLICY "Allow admins to manage all status history"
ON public.order_status_history FOR ALL
USING (public.is_admin() = true)
WITH CHECK (public.is_admin() = true);

-- 4. Automatic status history trigger definition
CREATE OR REPLACE FUNCTION public.handle_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert on new order creation
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.order_status_history (order_id, status, created_at)
    VALUES (NEW.id, NEW.order_status, NEW.created_at);
  -- Insert on update only if the status has actually changed
  ELSIF (TG_OP = 'UPDATE' AND OLD.order_status IS DISTINCT FROM NEW.order_status) THEN
    INSERT INTO public.order_status_history (order_id, status, created_at)
    VALUES (NEW.id, NEW.order_status, NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger binding
DROP TRIGGER IF EXISTS on_order_status_changed ON public.orders;
CREATE TRIGGER on_order_status_changed
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_order_status_change();

-- 5. Safe atomic confirmed/deduct RPC function
CREATE OR REPLACE FUNCTION public.confirm_order_and_deduct_inventory(p_order_id UUID)
RETURNS VOID AS $$
DECLARE
  v_order_status VARCHAR(100);
  v_inventory_adjusted BOOLEAN;
  v_item RECORD;
  v_size_id INT;
  v_current_stock INT;
  v_new_stock INT;
  v_total_stock INT;
  v_product_id INT;
BEGIN
  -- Lock the order row and fetch status/adjusted state to prevent race conditions
  SELECT order_status, inventory_adjusted
  INTO v_order_status, v_inventory_adjusted
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found.';
  END IF;

  -- If order status is confirmed/processing/shipped/out_for_delivery/delivered, do not deduct again
  IF LOWER(v_order_status) IN ('confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered') THEN
    RETURN;
  END IF;

  -- If already adjusted, do nothing but ensure the status matches confirmed
  IF v_inventory_adjusted THEN
    UPDATE public.orders
    SET order_status = 'confirmed'
    WHERE id = p_order_id;
    RETURN;
  END IF;

  -- Loop through order items and verify/deduct stock levels
  FOR v_item IN 
    SELECT oi.product_id, oi.product_name, oi.size, oi.quantity
    FROM public.order_items oi
    WHERE oi.order_id = p_order_id
  LOOP
    -- Look up the size record, locking it to prevent concurrent modifications
    SELECT id, stock
    INTO v_size_id, v_current_stock
    FROM public.product_sizes
    WHERE product_id = v_item.product_id AND size = v_item.size
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Size % for product % not configured.', v_item.size, v_item.product_name;
    END IF;

    IF v_current_stock < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for % - Size %. Available: %, Requested: %.', 
        TRIM(v_item.product_name), v_item.size, v_current_stock, v_item.quantity;
    END IF;

    -- Deduct stock
    v_new_stock := v_current_stock - v_item.quantity;
    UPDATE public.product_sizes
    SET stock = v_new_stock
    WHERE id = v_size_id;

    -- Record transaction history
    INSERT INTO public.inventory_history (order_id, product_id, size_id, quantity, transaction_type)
    VALUES (p_order_id, v_item.product_id, v_size_id, v_item.quantity, 'sale');
  END LOOP;

  -- Recalculate total_stock for each product affected in the order
  FOR v_product_id IN
    SELECT DISTINCT oi.product_id
    FROM public.order_items oi
    WHERE oi.order_id = p_order_id
  LOOP
    SELECT COALESCE(SUM(stock), 0)
    INTO v_total_stock
    FROM public.product_sizes
    WHERE product_id = v_product_id;

    UPDATE public.products
    SET total_stock = v_total_stock
    WHERE id = v_product_id;
  END LOOP;

  -- Mark order status as confirmed and inventory_adjusted = TRUE
  UPDATE public.orders
  SET order_status = 'confirmed',
      inventory_adjusted = TRUE
  WHERE id = p_order_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Safe atomic cancellation/restore RPC function
CREATE OR REPLACE FUNCTION public.cancel_order_and_restore_inventory(p_order_id UUID)
RETURNS VOID AS $$
DECLARE
  v_order_status VARCHAR(100);
  v_inventory_adjusted BOOLEAN;
  v_item RECORD;
  v_size_id INT;
  v_current_stock INT;
  v_total_stock INT;
  v_product_id INT;
BEGIN
  -- Lock the order row to prevent race conditions
  SELECT order_status, inventory_adjusted
  INTO v_order_status, v_inventory_adjusted
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found.';
  END IF;

  -- If already cancelled, do nothing
  IF LOWER(v_order_status) = 'cancelled' THEN
    RETURN;
  END IF;

  -- If Pending: simply cancel the order, no stock adjustment needed
  IF LOWER(v_order_status) = 'pending' THEN
    UPDATE public.orders
    SET order_status = 'cancelled'
    WHERE id = p_order_id;
    RETURN;
  END IF;

  -- If Confirmed or later: restore stock if it was adjusted
  IF LOWER(v_order_status) IN ('confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered') THEN
    IF v_inventory_adjusted THEN
      FOR v_item IN 
        SELECT oi.product_id, oi.size, oi.quantity
        FROM public.order_items oi
        WHERE oi.order_id = p_order_id
      LOOP
        -- Look up and lock the size record
        SELECT id, stock
        INTO v_size_id, v_current_stock
        FROM public.product_sizes
        WHERE product_id = v_item.product_id AND size = v_item.size
        FOR UPDATE;

        IF FOUND THEN
          -- Restore stock
          UPDATE public.product_sizes
          SET stock = v_current_stock + v_item.quantity
          WHERE id = v_size_id;

          -- Record transaction history
          INSERT INTO public.inventory_history (order_id, product_id, size_id, quantity, transaction_type)
          VALUES (p_order_id, v_item.product_id, v_size_id, v_item.quantity, 'restock_cancelled_order');
        END IF;
      END LOOP;

      -- Recalculate total_stock for each product in the order
      FOR v_product_id IN
        SELECT DISTINCT oi.product_id
        FROM public.order_items oi
        WHERE oi.order_id = p_order_id
      LOOP
        SELECT COALESCE(SUM(stock), 0)
        INTO v_total_stock
        FROM public.product_sizes
        WHERE product_id = v_product_id;

        UPDATE public.products
        SET total_stock = v_total_stock
        WHERE id = v_product_id;
      END LOOP;
    END IF;

    -- Mark order as cancelled and inventory_adjusted = FALSE
    UPDATE public.orders
    SET order_status = 'cancelled',
        inventory_adjusted = FALSE
    WHERE id = p_order_id;
    
    RETURN;
  END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Legacy compat RPC wrapper function
CREATE OR REPLACE FUNCTION public.deduct_inventory(p_order_id UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM public.confirm_order_and_deduct_inventory(p_order_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
