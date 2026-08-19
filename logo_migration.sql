-- 1. Create store_settings singleton configuration table
CREATE TABLE IF NOT EXISTS public.store_settings (
    id INT PRIMARY KEY DEFAULT 1,
    store_logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT singleton_row CHECK (id = 1)
);

-- 2. Seed default singleton record if not already present
INSERT INTO public.store_settings (id, store_logo_url)
VALUES (1, NULL)
ON CONFLICT (id) DO NOTHING;

-- 3. Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- 4. Drop prior policies to prevent duplication conflicts
DROP POLICY IF EXISTS "Allow public select on store settings" ON public.store_settings;
DROP POLICY IF EXISTS "Allow admins to update store settings" ON public.store_settings;

-- 5. Set up granular RLS policies
CREATE POLICY "Allow public select on store settings"
ON public.store_settings FOR SELECT
USING (true);

CREATE POLICY "Allow admins to update store settings"
ON public.store_settings FOR ALL
USING (public.is_admin() = true)
WITH CHECK (public.is_admin() = true);

-- 6. Dynamically register store-assets bucket in Supabase storage schema
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-assets', 'store-assets', true)
ON CONFLICT (id) DO NOTHING;

