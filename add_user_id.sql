-- 1. Safely add the user_id column to the existing public.orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Drop the old policies if any to avoid duplication
DROP POLICY IF EXISTS "Allow select for owner or admin" ON public.orders;
DROP POLICY IF EXISTS "Allow select for order items owner or admin" ON public.order_items;

-- 3. Set up updated RLS policies for orders
CREATE POLICY "Allow select for owner or admin"
ON public.orders FOR SELECT
USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (public.is_admin() = true) OR
    (user_id IS NULL) -- Allow guest checkout success page to select by ID
);

-- 4. Set up updated RLS policies for order_items
CREATE POLICY "Allow select for order items owner or admin"
ON public.order_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_items.order_id 
        AND (
            (auth.uid() IS NOT NULL AND orders.user_id = auth.uid()) OR
            (public.is_admin() = true) OR
            (orders.user_id IS NULL)
        )
    )
);
