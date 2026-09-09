-- ==============================================================================
-- Migration 01: Auth, Roles, and Admin Policies
-- Run this in your Supabase SQL Editor or via Supabase CLI
-- ==============================================================================

-- 1. Add role column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin'));

-- 2. Create helper function to check if current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3. Automatic profile creation trigger on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if already exists then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Admin RLS Policies for Catalog Management
DROP POLICY IF EXISTS "Admins have full access to products." ON public.products;
CREATE POLICY "Admins have full access to products."
  ON public.products FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to categories." ON public.categories;
CREATE POLICY "Admins have full access to categories."
  ON public.categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. Admin RLS Policies for Order Management
DROP POLICY IF EXISTS "Admins have full access to orders." ON public.orders;
CREATE POLICY "Admins have full access to orders."
  ON public.orders FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to order items." ON public.order_items;
CREATE POLICY "Admins have full access to order items."
  ON public.order_items FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6. Admin RLS Policy for Profiles
DROP POLICY IF EXISTS "Admins have full access to profiles." ON public.profiles;
CREATE POLICY "Admins have full access to profiles."
  ON public.profiles FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
