import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Comprehensive check if Supabase is properly configured
const isSupabaseConfigured = (() => {
  // Check if variables exist
  if (!supabaseUrl || !supabaseAnonKey) {
    return false;
  }

  // Check for common placeholder patterns
  const placeholderPatterns = [
    'your-project', 'YOUR_PROJECT', 'your_anon_key', 'YOUR_ANON_KEY',
    'xxxxx', 'XXXXX', 'placeholder', 'PLACEHOLDER', 'example', 'EXAMPLE',
    'abcdef', 'ABCDEF', 'project-id', 'PROJECT_ID'
  ];

  const hasUrlPlaceholder = placeholderPatterns.some(pattern => 
    supabaseUrl.toLowerCase().includes(pattern.toLowerCase())
  );
  const hasKeyPlaceholder = placeholderPatterns.some(pattern => 
    supabaseAnonKey.toLowerCase().includes(pattern.toLowerCase())
  );

  if (hasUrlPlaceholder || hasKeyPlaceholder) {
    return false;
  }

  // Validate URL format - must be https and contain supabase.co
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('supabase.co')) {
    return false;
  }

  // Validate anon key format - must be JWT (starts with eyJ) and be reasonably long
  if (!supabaseAnonKey.startsWith('eyJ') || supabaseAnonKey.length < 100) {
    return false;
  }

  // Additional validation: URL should match pattern
  const urlPattern = /^https:\/\/[a-z0-9]+\.supabase\.co$/;
  if (!urlPattern.test(supabaseUrl)) {
    return false;
  }

  return true;
})();

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