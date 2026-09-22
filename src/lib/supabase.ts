import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables or localStorage fallback for Supabase credentials
const getSupabaseConfig = () => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  
  const storedUrl = localStorage.getItem('sb_url') || '';
  const storedKey = localStorage.getItem('sb_key') || '';

  return {
    url: storedUrl || envUrl,
    key: storedKey || envKey
  };
};

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export function getSupabase(): SupabaseClient | null {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) {
    return null;
  }
  if (cachedClient && cachedUrl === url && cachedKey === key) {
    return cachedClient;
  }
  try {
    cachedClient = createClient(url, key);
    cachedUrl = url;
    cachedKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function saveSupabaseConfig(url: string, key: string) {
  localStorage.setItem('sb_url', url.trim());
  localStorage.setItem('sb_key', key.trim());
  cachedClient = null;
  cachedUrl = '';
  cachedKey = '';
}

export function clearSupabaseConfig() {
  localStorage.removeItem('sb_url');
  localStorage.removeItem('sb_key');
  cachedClient = null;
  cachedUrl = '';
  cachedKey = '';
}
