/*
  # Fix infinite recursion in profiles RLS policies

  1. Changes
    - Drop existing problematic RLS policies
    - Create new, simplified policies that avoid recursion
    - Add proper policies for read and update operations

  2. Security
    - Users can read their own profile
    - Admins can read all profiles
    - Users can update their own profile
*/

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Enable read access for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for admins" ON profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Create new, simplified policies
CREATE POLICY "profiles_read_own"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
  );

CREATE POLICY "profiles_read_admin"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        SELECT is_admin
        FROM profiles
        WHERE profiles.id = auth.users.id
      ) = true
    )
  );

CREATE POLICY "profiles_update_own"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);