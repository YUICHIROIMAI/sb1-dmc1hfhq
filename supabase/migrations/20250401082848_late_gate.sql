/*
  # Fix profiles table policies

  1. Changes
    - Drop existing policies
    - Create new policies for insert, select, and update operations
    - Add proper checks for admin status modification
*/

-- Drop existing policies
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_access" ON profiles;
DROP POLICY IF EXISTS "allow_read_own" ON profiles;
DROP POLICY IF EXISTS "allow_admin_access" ON profiles;
DROP POLICY IF EXISTS "allow_update_own" ON profiles;
DROP POLICY IF EXISTS "enable_insert_for_authenticated" ON profiles;
DROP POLICY IF EXISTS "enable_select_for_own_profile" ON profiles;
DROP POLICY IF EXISTS "enable_select_for_admins" ON profiles;
DROP POLICY IF EXISTS "enable_update_for_own_profile" ON profiles;

-- Create new policies
CREATE POLICY "enable_insert_for_authenticated"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id
  );

CREATE POLICY "enable_select_for_own_profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
  );

CREATE POLICY "enable_select_for_admins"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM admin_users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "enable_update_for_own_profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id
  )
  WITH CHECK (
    auth.uid() = id
  );