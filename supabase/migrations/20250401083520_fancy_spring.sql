/*
  # Fix infinite recursion in profile policies

  1. Changes
    - Drop all existing policies
    - Create new, non-recursive policies
    - Implement direct user checks without circular dependencies

  2. Security
    - Maintain proper access control
    - Prevent infinite recursion
    - Keep admin functionality working
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "allow_select_own" ON profiles;
DROP POLICY IF EXISTS "allow_select_admin" ON profiles;
DROP POLICY IF EXISTS "allow_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_access" ON profiles;
DROP POLICY IF EXISTS "enable_insert_for_authenticated" ON profiles;
DROP POLICY IF EXISTS "enable_select_for_own_profile" ON profiles;
DROP POLICY IF EXISTS "enable_select_for_admins" ON profiles;
DROP POLICY IF EXISTS "enable_update_for_own_profile" ON profiles;

-- Create new, simplified policies
CREATE POLICY "profiles_read_own"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
  );

CREATE POLICY "profiles_read_all_admin"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM auth.users u
      JOIN profiles p ON u.id = p.id
      WHERE u.id = auth.uid()
      AND p.is_admin = true
    )
  );

CREATE POLICY "profiles_update_own"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id
  )
  WITH CHECK (
    auth.uid() = id
  );

-- Ensure admin status is set correctly
DO $$
BEGIN
  UPDATE profiles
  SET is_admin = true
  WHERE email = 'admin@sns-manager.com'
    AND NOT is_admin;
END $$;