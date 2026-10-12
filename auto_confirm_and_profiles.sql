-- ====================================================================
-- CLAD IN STYLE BOUTIQUE - AUTO-CONFIRMATION & PROFILE SYNC MIGRATION
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rqszvlrycodrggowhmlo/sql
-- ====================================================================

-- 1. Create function to automatically confirm user emails on signup
-- This allows newly registered customers to log in immediately without waiting for SMTP
CREATE OR REPLACE FUNCTION public.auto_confirm_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to run BEFORE INSERT on auth.users
DROP TRIGGER IF EXISTS on_auth_user_before_insert ON auth.users;
CREATE TRIGGER on_auth_user_before_insert
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_new_user();

-- 2. Confirm any existing unconfirmed customer accounts
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 3. Ensure customer_profiles table exists with proper schema
CREATE TABLE IF NOT EXISTS public.customer_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Automatically sync customer profile when an auth.user is created
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.customer_profiles (id, first_name, last_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = COALESCE(EXCLUDED.first_name, customer_profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, customer_profiles.last_name),
    email = COALESCE(EXCLUDED.email, customer_profiles.email),
    phone = COALESCE(EXCLUDED.phone, customer_profiles.phone),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();

-- 5. Configure Row Level Security (RLS) on customer_profiles
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to select their own profile" ON public.customer_profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.customer_profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.customer_profiles;
DROP POLICY IF EXISTS "Allow admins to manage all customer profiles" ON public.customer_profiles;

-- Allow authenticated customers to select their own profile
CREATE POLICY "Allow users to select their own profile"
ON public.customer_profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow authenticated customers to insert their own profile
CREATE POLICY "Allow users to insert their own profile"
ON public.customer_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow authenticated customers to update their own profile
CREATE POLICY "Allow users to update their own profile"
ON public.customer_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow admins to manage all customer profiles
CREATE POLICY "Allow admins to manage all customer profiles"
ON public.customer_profiles FOR ALL
TO authenticated
USING (public.is_admin() = true)
WITH CHECK (public.is_admin() = true);
