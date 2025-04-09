/*
  # Fix profiles policies recursion

  1. Changes
    - Drop existing policies
    - Create new, non-recursive policies
    - Use security definer function for admin checks
    - Implement simplified policy structure

  2. Security
    - Maintain same security model
    - Prevent infinite recursion
    - Keep admin privileges intact
*/

-- Drop existing policies
DROP POLICY IF EXISTS "enable_read_own_profile" ON profiles;
DROP POLICY IF EXISTS "enable_read_all_profiles_admin" ON profiles;
DROP POLICY IF EXISTS "enable_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "enable_update_all_profiles_admin" ON profiles;

-- Create a security definer function to check admin status
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = user_id LIMIT 1),
    false
  );
$$;

-- Basic policy for users to read their own profile
CREATE POLICY "allow_select_own_profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy for admins to read all profiles
CREATE POLICY "allow_select_all_profiles_admin"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Policy for users to update their own profile
CREATE POLICY "allow_update_own_profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    (
      -- Only allow admin status change if user is already admin
      is_admin(auth.uid()) OR
      is_admin = false
    )
  );

-- Policy for admins to update any profile
CREATE POLICY "allow_update_all_profiles_admin"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Ensure admin status is set correctly
DO $$
BEGIN
  UPDATE profiles
  SET is_admin = true
  WHERE email = 'admin@sns-manager.com'
    AND NOT is_admin;
END $$;