-- 1. Drop any existing foreign key constraint on the product_id column
ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- 2. Drop the incorrect UUID column
ALTER TABLE public.order_items DROP COLUMN IF EXISTS product_id;

-- 3. Add the correct integer product_id column referencing public.products(id)
ALTER TABLE public.order_items ADD COLUMN product_id INT REFERENCES public.products(id) ON DELETE SET NULL;
