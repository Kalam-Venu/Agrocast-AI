'use client';

import { createBrowserClient } from '@supabase/ssr';
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from './config';

let supabaseClient;

export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured) return null;
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
}

export { isSupabaseConfigured };
