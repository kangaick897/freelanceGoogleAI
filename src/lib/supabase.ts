import { createClient } from '@supabase/supabase-js';

// Use environment variables, but provide a dummy URL fallback to prevent 
// the app from crashing completely if the user hasn't set up the secrets yet.
let supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
let supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Validate URL to prevent crash if user pasted placeholder text like "YOUR_SUPABASE_PROJECT_URL"
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  supabaseUrl = 'https://placeholder-project.supabase.co';
  supabaseAnonKey = 'placeholder-key';
}

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
