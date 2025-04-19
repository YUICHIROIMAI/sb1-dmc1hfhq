/*
  # Fix infinite recursion in profiles RLS policies

  1. Changes
    - Drop all existing policies
    - Create new, simplified policies without recursion
    - Use direct user ID checks for basic access
    - Implement admin checks without querying profiles table recursively

  2. Security
    - Maintain same level of security with simplified policy structure
    - Ensure users can only access their own profiles
    - Allow admins to access all profiles without causing recursion
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "allow_read_own" ON profiles;
DROP POLICY IF EXISTS "allow_admin_access" ON profiles;
DROP POLICY IF EXISTS "allow_update_own" ON profiles;

-- Basic policy for users to read their own profile
CREATE POLICY "profiles_select_own"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
  );

-- Policy for users to update their own profile
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

-- Admin access policy using a materialized view to prevent recursion
CREATE MATERIALIZED VIEW IF NOT EXISTS admin_users AS
SELECT id
FROM profiles
WHERE is_admin = true;

CREATE UNIQUE INDEX IF NOT EXISTS admin_users_id_idx ON admin_users (id);

REFRESH MATERIALIZED VIEW admin_users;

-- Create function to refresh admin users view
CREATE OR REPLACE FUNCTION refresh_admin_users()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY admin_users;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh admin users view when profiles are modified
DROP TRIGGER IF EXISTS refresh_admin_users_trigger ON profiles;
CREATE TRIGGER refresh_admin_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_admin_users();

-- Admin policy using materialized view
CREATE POLICY "profiles_admin_access"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM admin_users
      WHERE id = auth.uid()
    )
  );
