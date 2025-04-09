/*
  # Fix profiles table RLS policies

  1. Changes
    - Drop existing RLS policies
    - Add new policies for:
      - Profile creation (INSERT)
      - Profile reading (SELECT)
      - Profile updates (UPDATE)
    - Ensure proper security constraints

  2. Security
    - Users can only create their own profile
    - Users can only read their own profile
    - Admins can read all profiles
    - Users can only update their own profile
    - No one can set is_admin to true directly
*/

-- Drop existing policies
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_access" ON profiles;
DROP POLICY IF EXISTS "allow_read_own" ON profiles;
DROP POLICY IF EXISTS "allow_admin_access" ON profiles;
DROP POLICY IF EXISTS "allow_update_own" ON profiles;

-- Create new policies
CREATE POLICY "enable_insert_for_authenticated"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id
    AND is_admin = false -- Prevent setting admin status during creation
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
    AND (
      CASE 
        WHEN is_admin = true THEN
          EXISTS (
            SELECT 1
            FROM admin_users
            WHERE id = auth.uid()
          )
        ELSE true
      END
    )
  );