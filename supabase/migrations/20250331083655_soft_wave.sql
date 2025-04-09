/*
  # Fix infinite recursion in profiles RLS policies

  1. Changes
    - Drop all existing policies
    - Create new, non-recursive policies
    - Simplify admin check logic
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "profiles_read_own" ON profiles;
DROP POLICY IF EXISTS "profiles_read_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "allow_read_own_profile" ON profiles;
DROP POLICY IF EXISTS "allow_admin_read_all" ON profiles;
DROP POLICY IF EXISTS "allow_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for admins" ON profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON profiles;

-- Create new, simplified policies
CREATE POLICY "allow_read_own"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Non-recursive admin policy using a direct check
CREATE POLICY "allow_admin_access"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    (
      SELECT is_admin
      FROM profiles
      WHERE id = auth.uid()
    ) = true
  );

-- Allow users to update their own profiles
CREATE POLICY "allow_update_own"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);