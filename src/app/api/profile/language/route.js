import { NextResponse } from 'next/server';
import { databaseUnavailableResponse, requireSupabaseUser } from '@/lib/supabase/api';

export async function GET() {
  const { supabase, user, response } = await requireSupabaseUser();
  if (response) return response;

  const { data, error } = await supabase
    .from('user_preferences')
    .select('preferred_language')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) return databaseUnavailableResponse(error, 'language preference read');
  return NextResponse.json({ preferredLanguage: data?.preferred_language || 'te' });
}

export async function PUT(request) {
  const { supabase, response } = await requireSupabaseUser();
  if (response) return response;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }
  if (!['te', 'en'].includes(body?.language)) {
    return NextResponse.json(
      { error: 'Valid language is required. Supported: te, en.' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.rpc('update_user_preferences', {
    p_preferred_language: body.language,
    p_notifications_enabled: null,
  });
  if (error) return databaseUnavailableResponse(error, 'language preference update');
  return NextResponse.json({
    success: true,
    preferredLanguage: data.preferred_language,
  });
}
