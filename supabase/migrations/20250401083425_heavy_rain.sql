/*
  # Fix profile creation and permissions

  1. Changes
    - Drop existing policies
    - Create new trigger for automatic profile creation
    - Add simplified RLS policies
    - Remove materialized view dependency for admin checks

  2. Security
    - Ensure automatic profile creation on user signup
    - Maintain proper access control without materialized view
*/

-- Drop existing materialized view and related objects
DROP MATERIALIZED VIEW IF EXISTS admin_users CASCADE;
DROP TRIGGER IF EXISTS refresh_admin_users_trigger ON profiles CASCADE;
DROP FUNCTION IF EXISTS refresh_admin_users() CASCADE;

-- Drop existing policies
DROP POLICY IF EXISTS "allow_read_own" ON profiles;
DROP POLICY IF EXISTS "allow_admin_access" ON profiles;
DROP POLICY IF EXISTS "allow_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_access" ON profiles;
DROP POLICY IF EXISTS "enable_insert_for_authenticated" ON profiles;
DROP POLICY IF EXISTS "enable_select_for_own_profile" ON profiles;
DROP POLICY IF EXISTS "enable_select_for_admins" ON profiles;
DROP POLICY IF EXISTS "enable_update_for_own_profile" ON profiles;

-- Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN NEW.email = 'admin@sns-manager.com' THEN true
      ELSE false
    END
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create simplified RLS policies
CREATE POLICY "allow_select_own"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
  );

CREATE POLICY "allow_select_admin"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

CREATE POLICY "allow_update_own"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id
  )
  WITH CHECK (
    auth.uid() = id
  );

-- Refresh existing profiles to ensure admin status
UPDATE profiles
SET is_admin = true
WHERE email = 'admin@sns-manager.com'
  AND NOT is_admin;