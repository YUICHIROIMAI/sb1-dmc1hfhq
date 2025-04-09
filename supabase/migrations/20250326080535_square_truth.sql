/*
  # Insert admin user profile

  1. Updates
    - Set is_admin to true for the admin user
*/

UPDATE profiles
SET is_admin = true
WHERE email = 'admin@sns-manager.com';