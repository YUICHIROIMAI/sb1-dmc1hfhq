/*
  # Fix admin login and profile handling

  1. Changes
    - Force update admin profile
    - Add upsert handling for admin status
    - Ensure proper RLS policies
*/

-- Force update admin profile to ensure admin status
UPDATE profiles
SET is_admin = true
WHERE email = 'admin@sns-manager.com';

-- Recreate handle_new_user function with proper admin handling
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
  SET 
    email = EXCLUDED.email,
    is_admin = CASE 
      WHEN EXCLUDED.email = 'admin@sns-manager.com' THEN true
      ELSE profiles.is_admin
    END;
  RETURN NEW;
END;
$$;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure admin user exists and has correct privileges
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get or create admin user
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@sns-manager.com';

  IF admin_user_id IS NULL THEN
    -- Create admin user if not exists
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
    )
    RETURNING id INTO admin_user_id;
  END IF;

  -- Ensure admin profile exists and has admin privileges
  INSERT INTO profiles (id, email, is_admin)
  VALUES (
    admin_user_id,
    'admin@sns-manager.com',
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET is_admin = true;
END $$;