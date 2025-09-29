import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: any;

if (!supabaseUrl || !supabaseAnonKey || !supabaseUrl.startsWith('http')) {
  console.error('⚠️ Supabase not configured. Please set up your environment variables.');
  
  // Create a complete mock client that doesn't make network requests
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ 
        data: { session: null }, 
        error: null 
      }),
      onAuthStateChange: () => ({ 
        data: { 
          subscription: { 
            unsubscribe: () => {} 
          } 
        } 
      }),
      signUp: () => Promise.resolve({ 
        data: { user: null, session: null },
        error: { 
          message: 'Supabase not configured. Please click the "Supabase" button in settings to connect your database.',
          status: 400,
          statusCode: 400
        } 
      }),
      signInWithPassword: () => Promise.resolve({ 
        data: { user: null, session: null },
        error: { 
          message: 'Supabase not configured. Please click the "Supabase" button in settings to connect your database.',
          status: 400,
          statusCode: 400
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
              message: 'Database not configured',
              status: 400,
              statusCode: 400
            }
          }),
          order: () => Promise.resolve({
            data: [],
            error: {
              message: 'Database not configured',
              status: 400,
              statusCode: 400
            }
          })
        }),
        order: () => Promise.resolve({
          data: [],
          error: {
            message: 'Database not configured',
            status: 400,
            statusCode: 400
          }
        })
      }),
      insert: () => Promise.resolve({
        data: null,
        error: {
          message: 'Database not configured',
          status: 400,
          statusCode: 400
        }
      }),
      update: () => Promise.resolve({
        data: null,
        error: {
          message: 'Database not configured',
          status: 400,
          statusCode: 400
        }
      })
    }),
    functions: {
      invoke: () => Promise.resolve({
        data: null,
        error: {
          message: 'Supabase functions not configured',
          status: 400,
          statusCode: 400
        }
      })
    }
  };
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };