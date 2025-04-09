/*
  # Fix admin user privileges

  1. Changes
    - Update admin user's profile to ensure admin privileges
    - Add proper RLS policies for admin access
    - Fix profile creation trigger

  2. Security
    - Maintain proper access control
    - Ensure admin privileges are correctly set
*/

-- Update admin user's profile to ensure admin status
UPDATE profiles
SET is_admin = true
WHERE email = 'admin@sns-manager.com';

-- Recreate the handle_new_user function to properly set admin status
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
  )
  ON CONFLICT (id) DO UPDATE
  SET is_admin = CASE 
    WHEN EXCLUDED.email = 'admin@sns-manager.com' THEN true
    ELSE profiles.is_admin
  END;
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to check admin status
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = user_id),
    false
  );
$$;

-- Recreate RLS policies to ensure proper admin access
DROP POLICY IF EXISTS "allow_select_own" ON profiles;
DROP POLICY IF EXISTS "allow_select_admin" ON profiles;
DROP POLICY IF EXISTS "allow_update_own" ON profiles;

CREATE POLICY "allow_select_own"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "allow_select_admin"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "allow_update_own"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    (
      is_admin(auth.uid()) OR
      is_admin = false
    )
  );

-- Ensure admin user exists and has correct privileges
DO $$
BEGIN
  -- Create admin user if not exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@sns-manager.com'
  ) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@sns-manager.com',
      crypt('Admin123!@#', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  END IF;
END $$;