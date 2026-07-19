import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to check if user has admin role in database.
// We will look for an 'admins' table where user id matches.
export async function checkIfAdmin(userId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) {
      // Fallback: maybe they are in an 'admins' table, or we check if user email is boluakintola@gmail.com (which is the user's email)
      const { data: adminData, error: adminErr } = await supabase
        .from('admins')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!adminErr && adminData) return true;
      return false;
    }
    
    return data?.role === 'admin';
  } catch (err) {
    console.error('Error checking admin status:', err);
    return false;
  }
}
