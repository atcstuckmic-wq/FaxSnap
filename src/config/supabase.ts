import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables exist and are not empty
const hasValidEnvVars = supabaseUrl && supabaseAnonKey && 
  supabaseUrl.trim() !== '' && supabaseAnonKey.trim() !== '';

// Check for placeholder/example values
const hasPlaceholders = hasValidEnvVars && (
  supabaseUrl.includes('your-project') ||
  supabaseUrl.includes('YOUR_PROJECT') ||
  supabaseUrl.includes('xxxxx') ||
  supabaseUrl.includes('example') ||
  supabaseAnonKey.includes('your_anon_key') ||
  supabaseAnonKey.includes('YOUR_ANON_KEY') ||
  supabaseAnonKey.includes('xxxxx') ||
  supabaseAnonKey === 'eyJhbGci...'
);

// Validate Supabase URL format
const hasValidUrl = hasValidEnvVars && 
  supabaseUrl.startsWith('https://') && 
  supabaseUrl.includes('.supabase.co') &&
  !supabaseUrl.includes('localhost');

// Validate anon key format (should be JWT starting with eyJ and reasonably long)
const hasValidKey = hasValidEnvVars && 
  supabaseAnonKey.startsWith('eyJ') && 
  supabaseAnonKey.length > 100;

const isSupabaseConfigured = hasValidEnvVars && !hasPlaceholders && hasValidUrl && hasValidKey;

let supabase: any;

if (!isSupabaseConfigured) {
  if (!hasValidEnvVars) {
    console.warn('⚠️ Supabase environment variables not set. Using mock client.');
  } else if (hasPlaceholders) {
    console.warn('⚠️ Supabase contains placeholder values. Using mock client.');
  } else if (!hasValidUrl) {
    console.warn('⚠️ Invalid Supabase URL format. Using mock client.');
  } else if (!hasValidKey) {
    console.warn('⚠️ Invalid Supabase anon key format. Using mock client.');
  }
  
  // Complete mock client that prevents all network requests
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
          message: 'Supabase not configured. Please set up your Supabase credentials in the .env file.',
          status: 400
        } 
      }),
      signInWithPassword: () => Promise.resolve({ 
        data: { user: null, session: null },
        error: { 
          message: 'Supabase not configured. Please set up your Supabase credentials in the .env file.',
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