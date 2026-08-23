import { createClient } from '@supabase/supabase-js';

// Resolve and sanitize Supabase credentials even if environment variables are swapped or formatted differently
const resolveSupabaseCredentials = () => {
  let envUrl = ((import.meta as any).env?.VITE_SUPABASE_URL || '').trim();
  let envKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '').trim();

  // If URL looks like a key and Key looks like a URL, swap them
  if ((envUrl.startsWith('sb_') || envUrl.startsWith('eyJ')) && (envKey.includes('http') || envKey.includes('supabase.co'))) {
    const temp = envUrl;
    envUrl = envKey;
    envKey = temp;
  }

  // If Key is empty or is a URL, check if envUrl was actually the key
  if (!envKey || envKey.includes('supabase.co') || envKey.startsWith('http')) {
    if (envUrl.startsWith('sb_') || envUrl.startsWith('eyJ')) {
      envKey = envUrl;
      envUrl = 'https://hnunflpzqxkwkzjhnbpz.supabase.co';
    }
  }

  // Default project URL if not a valid HTTP URL
  if (!envUrl || (!envUrl.startsWith('http://') && !envUrl.startsWith('https://'))) {
    if (envUrl && envUrl.includes('supabase.co')) {
      envUrl = `https://${envUrl}`;
    } else {
      envUrl = 'https://hnunflpzqxkwkzjhnbpz.supabase.co';
    }
  }

  // Default public key if missing
  if (!envKey) {
    envKey = 'sb_publishable_BZBcZn2Br2D7d3ymCPXPQQ_XJQ2C5QL';
  }

  return { url: envUrl, key: envKey };
};

const { url: supabaseUrl, key: supabaseAnonKey } = resolveSupabaseCredentials();

let clientInstance: any = null;
let configured = false;

if (supabaseUrl && supabaseAnonKey) {
  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    configured = true;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    clientInstance = null;
    configured = false;
  }
}

export const isSupabaseConfigured = configured;
export const supabase: any = clientInstance;

// Helper to check if user has admin role in database.
export async function checkIfAdmin(userId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) {
      const { data: adminData, error: adminErr } = await supabase
        .from('admins')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!adminErr && adminData) return true;
      return false;
    }
    
    return (data as any)?.role === 'admin';
  } catch (err) {
    console.error('Error checking admin status:', err);
    return false;
  }
}

