import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  impersonatedUser: User | null;
  impersonate: (user: User) => void;
  stopImpersonating: () => void;
  devModeAccess?: (type: 'admin' | 'user') => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  impersonatedUser: null,
  impersonate: () => {},
  stopImpersonating: () => {},
  devModeAccess: undefined
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
  const [devMode, setDevMode] = useState<'admin' | 'user' | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isDevelopment = import.meta.env.DEV;

  const checkAdminStatus = async (userId: string): Promise<boolean> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return profile?.is_admin ?? false;
    } catch (error) {
      console.error('Error in checkAdminStatus:', error);
      return false;
    }
  };

  const devModeAccess = (type: 'admin' | 'user') => {
    if (!isDevelopment) return;
    
    setDevMode(type);
    setIsAdmin(type === 'admin');
    setUser({ 
      id: type === 'admin' ? 'dev-admin-id' : 'dev-user-id',
      email: type === 'admin' ? 'dev-admin@example.com' : 'dev-user@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString()
    });
    
    navigate(type === 'admin' ? '/admin' : '/dashboard');
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) {
            setLoading(false);
            if (location.pathname !== '/login') {
              navigate('/login');
            }
          }
          return;
        }

        if (session?.user && mounted) {
          setUser(session.user);
          const isUserAdmin = await checkAdminStatus(session.user.id);
          
          if (mounted) {
            setIsAdmin(isUserAdmin);
            setLoading(false);
            
            if (location.pathname === '/login') {
              navigate(isUserAdmin ? '/admin' : '/dashboard');
            }
          }
        } else {
          if (mounted) {
            setUser(null);
            setIsAdmin(false);
            setLoading(false);
            
            if (location.pathname !== '/login') {
              navigate('/login');
            }
          }
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        if (mounted) {
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
          navigate('/login');
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setUser(null);
        setIsAdmin(false);
        setImpersonatedUser(null);
        setDevMode(null);
        setLoading(false);
        navigate('/login');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          setUser(session.user);
          const isUserAdmin = await checkAdminStatus(session.user.id);
          setIsAdmin(isUserAdmin);
          setLoading(false);
          
          if (location.pathname === '/login') {
            navigate(isUserAdmin ? '/admin' : '/dashboard');
          }
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const impersonate = async (targetUser: User) => {
    if (!isAdmin) {
      console.error('Only admins can impersonate users');
      return;
    }

    setLoading(true);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUser.id)
        .single();

      if (error) throw error;

      if (profile) {
        setImpersonatedUser({
          ...targetUser,
          user_metadata: { ...targetUser.user_metadata, ...profile }
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error impersonating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const stopImpersonating = () => {
    setLoading(true);
    setImpersonatedUser(null);
    navigate('/admin');
    setLoading(false);
  };

  const value = {
    user: impersonatedUser || user,
    loading,
    isAdmin,
    impersonatedUser,
    impersonate,
    stopImpersonating,
    devModeAccess: isDevelopment ? devModeAccess : undefined
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};