import { supabase } from '../supabase';

export async function getCurrentUser() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  
  if (!session?.user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Error getting profile:', profileError);
    return null;
  }

  return {
    ...session.user,
    profile
  };
}