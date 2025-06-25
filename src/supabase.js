import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tfkzurrfppeuskasyklb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRma3p1cnJmcHBldXNrYXN5a2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2Njk1NjMsImV4cCI6MjA2NjI0NTU2M30.SaCrIe7lCMKbG7GHW_RcFgOaK6zAQSXho54qxCR3rzQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
    detectSessionInUrl: true,
  },
});