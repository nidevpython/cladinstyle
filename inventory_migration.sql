-- 1. Safely add inventory_adjusted column to the orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS inventory_adjusted BOOLEAN DEFAULT FALSE;

-- 2. Create the inventory_history table for stock auditing
CREATE TABLE IF NOT EXISTS public.inventory_history (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    product_id INT REFERENCES public.products(id) ON DELETE CASCADE,
    size_id INT REFERENCES public.product_sizes(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    transaction_type TEXT NOT NULL, -- 'sale', 'restock_cancelled_order'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Configure Row Level Security (RLS) on inventory_history
ALTER TABLE public.inventory_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on inventory history" ON public.inventory_history;
DROP POLICY IF EXISTS "Allow admins to manage inventory history" ON public.inventory_history;

CREATE POLICY "Allow public select on inventory history"
ON public.inventory_history FOR SELECT
USING (true);

CREATE POLICY "Allow admins to manage inventory history"
ON public.inventory_history FOR ALL
USING (public.is_admin() = true)
WITH CHECK (public.is_admin() = true);

-- 4. Create the secure atomic confirmed/deduct RPC function
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

-- 5. Create the secure atomic cancellation/restore RPC function
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

  -- If Confirmed or Processing: restore stock if it was adjusted
  IF LOWER(v_order_status) IN ('confirmed', 'processing') THEN
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

  -- For Shipped, Out for Delivery, or Delivered: cancel order without restoring inventory
  UPDATE public.orders
  SET order_status = 'cancelled'
  WHERE id = p_order_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
