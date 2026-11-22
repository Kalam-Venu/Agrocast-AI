import { NextResponse } from 'next/server';
import { databaseUnavailableResponse, requireSupabaseUser } from '@/lib/supabase/api';

const PROFILE_COLUMNS = 'id, full_name, email, phone, preferred_language, notifications_enabled, avatar_url';

function mapProfile(profile, preferences) {
  return {
    id: profile.id,
    fullName: profile.full_name,
    email: profile.email,
    phone: profile.phone || '',
    preferredLanguage: preferences?.preferred_language || profile.preferred_language || 'te',
    notificationsEnabled: preferences?.notifications_enabled ?? profile.notifications_enabled ?? true,
    avatarUrl: profile.avatar_url || '',
  };
}

export async function GET() {
  const { supabase, user, response } = await requireSupabaseUser();
  if (response) return response;

  const [{ data: profile, error: profileError }, { data: preferences, error: preferencesError }] =
    await Promise.all([
      supabase.from('profiles').select(PROFILE_COLUMNS).eq('id', user.id).maybeSingle(),
      supabase.from('user_preferences')
        .select('preferred_language, notifications_enabled')
        .eq('user_id', user.id)
        .maybeSingle(),
    ]);

  if (profileError || preferencesError) {
    return databaseUnavailableResponse(profileError || preferencesError, 'profile read');
  }
  if (!profile) {
    return NextResponse.json({ error: 'The account profile has not been initialized.' }, { status: 404 });
  }
  return NextResponse.json({ profile: mapProfile(profile, preferences) });
}

export async function PUT(request) {
  const { supabase, user, response } = await requireSupabaseUser();
  if (response) return response;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Request body must be a JSON object.' }, { status: 400 });
  }

  const profileUpdates = {};
  if (body.fullName !== undefined) {
    if (typeof body.fullName !== 'string' || !body.fullName.trim() || body.fullName.trim().length > 120) {
      return NextResponse.json({ error: 'Name must contain 1 to 120 characters.' }, { status: 400 });
    }
    profileUpdates.full_name = body.fullName.trim();
  }
  if (body.phone !== undefined) {
    if (typeof body.phone !== 'string' || body.phone.length > 40) {
      return NextResponse.json({ error: 'Phone number must be 40 characters or fewer.' }, { status: 400 });
    }
    profileUpdates.phone = body.phone.trim();
  }

  const preferenceUpdates = {};
  if (body.preferredLanguage !== undefined) {
    if (!['te', 'en'].includes(body.preferredLanguage)) {
      return NextResponse.json({ error: 'Supported languages are te and en.' }, { status: 400 });
    }
    preferenceUpdates.p_preferred_language = body.preferredLanguage;
  }
  if (body.notificationsEnabled !== undefined) {
    if (typeof body.notificationsEnabled !== 'boolean') {
      return NextResponse.json({ error: 'notificationsEnabled must be a boolean.' }, { status: 400 });
    }
    preferenceUpdates.p_notifications_enabled = body.notificationsEnabled;
  }
  if (!Object.keys(profileUpdates).length && !Object.keys(preferenceUpdates).length) {
    return NextResponse.json({ error: 'No profile fields were provided.' }, { status: 400 });
  }

  let profile = null;
  if (Object.keys(profileUpdates).length) {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', user.id)
      .select(PROFILE_COLUMNS)
      .single();
    if (error) return databaseUnavailableResponse(error, 'profile update');
    profile = data;
  }

  let preferences = null;
  if (Object.keys(preferenceUpdates).length) {
    const { data, error } = await supabase.rpc('update_user_preferences', preferenceUpdates);
    if (error) return databaseUnavailableResponse(error, 'preference update');
    preferences = data;
  }

  if (!profile) {
    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_COLUMNS)
      .eq('id', user.id)
      .single();
    if (error) return databaseUnavailableResponse(error, 'profile refresh');
    profile = data;
  }
  if (!preferences) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('preferred_language, notifications_enabled')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) return databaseUnavailableResponse(error, 'preference read');
    preferences = data;
  }

  return NextResponse.json({ profile: mapProfile(profile, preferences) });
}
