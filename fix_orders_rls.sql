-- ====================================================================
-- CLAD IN STYLE BOUTIQUE - SECURE ORDER CREATION & RLS POLICIES
-- ====================================================================

-- 1. Ensure Row Level Security is enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing insert/select policies to ensure clean state
DROP POLICY IF EXISTS "Allow public to insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow customers and guests to create orders" ON public.orders;
DROP POLICY IF EXISTS "Allow select for owner or admin" ON public.orders;
DROP POLICY IF EXISTS "Allow users to view own orders or guest lookup" ON public.orders;
DROP POLICY IF EXISTS "Allow admins to manage all orders" ON public.orders;

-- 3. Secure INSERT Policy for public.orders
-- Allows both authenticated customers (user_id = auth.uid()) and guest customers (user_id IS NULL)
-- Enforces integrity: order_status must start as 'pending', positive total_amount, required fields
CREATE POLICY "Allow customers and guests to create orders"
ON public.orders FOR INSERT TO public
WITH CHECK (
    (
      (auth.uid() IS NOT NULL AND user_id = auth.uid())
      OR (auth.uid() IS NULL AND user_id IS NULL)
      OR (user_id IS NULL)
    )
    AND order_status = 'pending'
    AND payment_status IN ('pending', 'paid')
    AND order_number IS NOT NULL AND TRIM(order_number) <> ''
    AND customer_name IS NOT NULL AND TRIM(customer_name) <> ''
    AND customer_email IS NOT NULL AND TRIM(customer_email) <> ''
    AND customer_phone IS NOT NULL AND TRIM(customer_phone) <> ''
    AND shipping_address IS NOT NULL AND TRIM(shipping_address) <> ''
    AND city IS NOT NULL AND TRIM(city) <> ''
    AND state IS NOT NULL AND TRIM(state) <> ''
    AND pincode IS NOT NULL AND TRIM(pincode) <> ''
    AND total_amount > 0
    AND admin_seen_at IS NULL
);

-- 4. SELECT Policy for public.orders
-- Allows admins full visibility, authenticated customers visibility of their own orders,
-- and allows guest order tracking when user_id IS NULL
CREATE POLICY "Allow users to view own orders or guest lookup"
ON public.orders FOR SELECT TO public
USING (
    (public.is_admin() = true)
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (user_id IS NULL)
);

-- 5. Administrative management for orders (UPDATE / DELETE)
CREATE POLICY "Allow admins to manage all orders"
ON public.orders FOR ALL TO authenticated
USING (public.is_admin() = true)
WITH CHECK (public.is_admin() = true);

-- 6. Order items policies
DROP POLICY IF EXISTS "Allow public to insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow customers and guests to insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow select for order items owner or admin" ON public.order_items;
DROP POLICY IF EXISTS "Allow admins to manage all order items" ON public.order_items;

CREATE POLICY "Allow customers and guests to insert order items"
ON public.order_items FOR INSERT TO public
WITH CHECK (
    quantity > 0
    AND unit_price >= 0
    AND total_price >= 0
    AND EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = order_items.order_id
    )
);

CREATE POLICY "Allow select for order items owner or admin"
ON public.order_items FOR SELECT TO public
USING (
    (public.is_admin() = true)
    OR EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = order_items.order_id
        AND (
            (auth.uid() IS NOT NULL AND orders.user_id = auth.uid())
            OR (orders.user_id IS NULL)
        )
    )
);

CREATE POLICY "Allow admins to manage all order items"
ON public.order_items FOR ALL TO authenticated
USING (public.is_admin() = true)
WITH CHECK (public.is_admin() = true);
