import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';

interface AuthContextType {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Database migration required. Please follow the setup instructions.');
        console.error('Error loading user profile:', error);
        return;
      }

      // Handle missing profile (PGRST116) by creating a default profile
      if (error && error.code === 'PGRST116') {
        console.warn(`🚨 DATABASE MIGRATION REQUIRED
${'='.repeat(50)}
Your database needs to be set up. Follow these steps:

1. Go to your Supabase dashboard
2. Click "SQL Editor" → "New Query"
3. Copy ALL content from:
   supabase/migrations/20250928223951_noisy_field.sql
4. Paste and click "Run"
5. You should see "Success. No rows returned"
6. Refresh this page

Need help? Check QUICKSTART.md for detailed steps
${'='.repeat(50)}`);
        return;
      }

      setUserProfile(data);
    } catch (error: any) {
      // Handle RLS policy violations (42501) and other database errors
      if (error?.code === '42501' || error?.message?.includes('row-level security')) {
        console.warn(`🚨 DATABASE MIGRATION REQUIRED
${'='.repeat(50)}
Row Level Security policies are not set up.

REQUIRED: Run database migrations first:

1. Go to your Supabase dashboard
2. Click "SQL Editor" → "New Query"
3. Copy ALL content from:
   supabase/migrations/20250928223951_noisy_field.sql
4. Paste and click "Run"
5. You should see "Success. No rows returned"
6. Sign out and sign back in

Need help? Check QUICKSTART.md for detailed steps
${'='.repeat(50)}`);
        return;
      }
      
      console.error('Database error:', error);
      console.error('Please ensure database migrations are applied. Check QUICKSTART.md');
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        refreshUserProfile();
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await refreshUserProfile();
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && !userProfile) {
      refreshUserProfile();
    }
  }, [user]);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      signUp,
      signIn,
      signOut,
      refreshUserProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};