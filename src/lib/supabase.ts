import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Ensure the URL is a valid HTTP/HTTPS URL to prevent app crashes
if (supabaseUrl.startsWith('postgresql://')) {
  const match = supabaseUrl.match(/postgres\.([^:]+):/);
  supabaseUrl = match && match[1] ? `https://${match[1]}.supabase.co` : '';
} else if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  supabaseUrl = 'https://placeholder-project.supabase.co';
}

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables. Please check your .env.local file or AI Studio Secrets.');
}

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
