-- 1. Enable UUID Extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create customer_profiles table
CREATE TABLE IF NOT EXISTS public.customer_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(255) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    shipping_address TEXT NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    shipping_charge DECIMAL(12, 2) NOT NULL,
    discount DECIMAL(12, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(100) NOT NULL,
    payment_status VARCHAR(100) DEFAULT 'Pending' NOT NULL,
    order_status VARCHAR(100) DEFAULT 'Pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Safely add user_id column to existing orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 4. Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    product_image TEXT,
    size VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL
);

-- 5. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 6. Clean up any existing policies
DROP POLICY IF EXISTS "Allow users to select their own profile" ON public.customer_profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.customer_profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.customer_profiles;
DROP POLICY IF EXISTS "Allow admins to manage all customer profiles" ON public.customer_profiles;

DROP POLICY IF EXISTS "Allow public to insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow admins to manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Allow select for owner or admin" ON public.orders;

DROP POLICY IF EXISTS "Allow public to insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow select for order items owner or admin" ON public.order_items;
DROP POLICY IF EXISTS "Allow admins to manage all order items" ON public.order_items;

-- 7. Define customer_profiles policies
CREATE POLICY "Allow users to select their own profile"
ON public.customer_profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile"
ON public.customer_profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to insert their own profile"
ON public.customer_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow admins to manage all customer profiles"
ON public.customer_profiles FOR ALL
USING (public.is_admin() = true)
WITH CHECK (public.is_admin() = true);

-- 8. Define orders policies
CREATE POLICY "Allow public to insert orders" 
ON public.orders FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow select for owner or admin"
ON public.orders FOR SELECT
USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (public.is_admin() = true) OR
    (user_id IS NULL)
);

CREATE POLICY "Allow admins to manage all orders"
ON public.orders FOR ALL
USING (public.is_admin() = true)
WITH CHECK (public.is_admin() = true);

-- 9. Define order_items policies
CREATE POLICY "Allow public to insert order items" 
ON public.order_items FOR INSERT 
WITH CHECK (true);

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

CREATE POLICY "Allow admins to manage all order items"
ON public.order_items FOR ALL
USING (public.is_admin() = true)
WITH CHECK (public.is_admin() = true);

-- 10. Database Function & Trigger to automatically copy new users to customer_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.customer_profiles (id, first_name, last_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution binding
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
