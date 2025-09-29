import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured (not just placeholder values)
const isSupabaseConfigured = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.includes('supabase.co') && 
  !supabaseUrl.includes('your-project') && // Not placeholder
  !supabaseUrl.includes('YOUR_PROJECT') && // Not placeholder
  supabaseAnonKey.startsWith('eyJ') && // Valid JWT format
  !supabaseAnonKey.includes('your_anon_key') && // Not placeholder
  !supabaseAnonKey.includes('YOUR_ANON_KEY') && // Not placeholder
  supabaseAnonKey.length > 20;

let supabase: any;

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase not configured. Using mock client.');
  
  // Create a complete mock client that prevents network requests
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ 
        data: { session: null }, 
        error: null 
      }),
      onAuthStateChange: (callback: any) => {
        // Call callback immediately with no session
        setTimeout(() => callback('INITIAL_SESSION', null), 0);
        return { 
          data: { 
            subscription: { 
              unsubscribe: () => {} 
            } 
          } 
        };
      },
      signUp: () => Promise.resolve({ 
        data: { user: null, session: null },
        error: { 
          message: 'Please connect to Supabase first. Click the "Supabase" button in Bolt settings.',
          status: 400
        } 
      }),
      signInWithPassword: () => Promise.resolve({ 
        data: { user: null, session: null },
        error: { 
          message: 'Please connect to Supabase first. Click the "Supabase" button in Bolt settings.',
          status: 400
        } 
      }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ 
            data: null, 
            error: { 
              message: 'Database not connected. Please set up Supabase.',
              status: 400
            }
          }),
          order: () => Promise.resolve({
            data: [],
            error: {
              message: 'Database not connected. Please set up Supabase.',
              status: 400
            }
          })
        }),
        order: () => Promise.resolve({
          data: [],
          error: {
            message: 'Database not connected. Please set up Supabase.',
            status: 400
          }
        })
      }),
      insert: () => ({
        select: () => Promise.resolve({
          data: null,
          error: {
            message: 'Database not connected. Please set up Supabase.',
            status: 400
          }
        })
      }),
      update: () => ({
        eq: () => Promise.resolve({
          data: null,
          error: {
            message: 'Database not connected. Please set up Supabase.',
            status: 400
          }
        })
      })
    }),
    functions: {
      invoke: () => Promise.resolve({
        data: null,
        error: {
          message: 'Supabase functions not available. Please configure Supabase.',
          status: 400
        }
      })
    }
  };
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    // Fall back to mock client if creation fails
    supabase = supabase || {};
  }
}

export { supabase };