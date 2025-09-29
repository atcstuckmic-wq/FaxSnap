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

      if (error) {
        if (error.code === 'PGRST205') {
          console.warn('⚠️ Database Migration Required!');
          console.warn('The profiles table does not exist. Please run the database migrations:');
          console.warn('1. Go to your Supabase dashboard');
          console.warn('2. Click "SQL Editor" → "New Query"');  
          console.warn('3. Copy content from supabase/migrations/20250928223951_noisy_field.sql');
          console.warn('4. Paste and click "Run"');
          console.warn('5. Copy content from supabase/migrations/token_expiration.sql');
          console.warn('6. Paste and click "Run"');
          console.warn('7. Refresh this page');
          return;
        }
        if (error.code === 'PGRST116') {
          console.warn('⚠️ User Profile Missing!');
          console.warn('Your user profile was not found in the database. This can happen if:');
          console.warn('1. Database migrations were not fully applied');
          console.warn('2. Your account was created before the database was set up');
          console.warn('To fix this:');
          console.warn('1. Go to your Supabase dashboard');
          console.warn('2. Click "SQL Editor" → "New Query"');  
          console.warn('3. Copy content from supabase/migrations/20250928223951_noisy_field.sql');
          console.warn('4. Paste and click "Run"');
          console.warn('5. Copy content from supabase/migrations/token_expiration.sql');
          console.warn('6. Paste and click "Run"');
          console.warn('7. Sign out and sign back in, or refresh this page');
          return;
        }
      }

      setUserProfile(data);
    } catch (error: any) {
      if (error?.message?.includes('PGRST205') || error?.body?.includes('PGRST205')) {
        console.warn('⚠️ Database Migration Required!');
        console.warn('The profiles table does not exist. Please run the database migrations:');
        console.warn('1. Go to your Supabase dashboard');
        console.warn('2. Click "SQL Editor" → "New Query"');  
        console.warn('3. Copy content from supabase/migrations/20250928223951_noisy_field.sql');
        console.warn('4. Paste and click "Run"');
        console.warn('5. Copy content from supabase/migrations/token_expiration.sql');
        console.warn('6. Paste and click "Run"');
        console.warn('7. Refresh this page');
        return;
      }
      console.error('Error loading user profile:', error);
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