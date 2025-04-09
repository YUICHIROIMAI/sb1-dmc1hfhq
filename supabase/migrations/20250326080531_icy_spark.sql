/*
  # Add trigger for automatic profile creation

  1. New Functions
    - `handle_new_user`: Creates a profile record when a new user is created
  
  2. New Triggers
    - `on_auth_user_created`: Executes when a new user is created in auth.users
*/

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    false
  );
  RETURN NEW;
END;
$$;

-- Create trigger that runs when a new user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();