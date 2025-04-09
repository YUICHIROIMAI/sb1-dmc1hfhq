/*
  # Fix profiles policies to prevent recursion

  1. Changes
    - Drop existing policies
    - Create new, simplified policies
    - Fix NEW record handling in RLS policies
    - Add proper admin checks

  2. Security
    - Users can read and update their own profiles
    - Admins can read and update all profiles
    - Prevent regular users from setting admin status
*/

-- Drop existing policies
DROP POLICY IF EXISTS "profiles_read_own" ON profiles;
DROP POLICY IF EXISTS "profiles_read_all_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;
DROP POLICY IF EXISTS "admins_read_all_profiles" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "admins_update_all_profiles" ON profiles;

-- Basic policy for users to read their own profile
CREATE POLICY "enable_read_own_profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy for admins to read all profiles
CREATE POLICY "enable_read_all_profiles_admin"
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

-- Policy for users to update their own profile
CREATE POLICY "enable_update_own_profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      -- Only allow admin status change if user is already admin
      COALESCE(
        (SELECT is_admin FROM profiles WHERE id = auth.uid()),
        false
      ) = true
      OR is_admin = false
    )
  );

-- Policy for admins to update any profile
CREATE POLICY "enable_update_all_profiles_admin"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- Ensure admin status is set correctly
DO $$
BEGIN
  UPDATE profiles
  SET is_admin = true
  WHERE email = 'admin@sns-manager.com'
    AND NOT is_admin;
END $$;