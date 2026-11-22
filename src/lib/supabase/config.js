function normalizeSupabaseUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value.trim());
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return '';
    if (url.search || url.hash) return '';
    const path = url.pathname.replace(/\/+$/, '');
    if (path && path !== '/rest/v1') return '';
    return url.origin;
  } catch {
    return '';
  }
}

export const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
