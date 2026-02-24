import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is available
export const isSupabaseAvailable = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Create Supabase client only when credentials are present
export const supabase = isSupabaseAvailable()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');
