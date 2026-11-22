import { NextResponse } from 'next/server';
import { databaseUnavailableResponse, requireSupabaseUser } from '@/lib/supabase/api';
import { isUuid } from '@/lib/supabase/reviews';

export async function POST(request, { params }) {
  const { supabase, user, response } = await requireSupabaseUser();
  if (response) return response;

  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: 'Invalid review ID.' }, { status: 400 });
  let body = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Report data must be a JSON object.' }, { status: 400 });
  }
  const reason = typeof body.reason === 'string' ? body.reason.trim() : 'Inappropriate or unverified content';
  if (!reason || reason.length > 1000) {
    return NextResponse.json({ error: 'Report reason must contain 1 to 1000 characters.' }, { status: 400 });
  }

  const { data: review, error: reviewError } = await supabase
    .from('pesticide_reviews')
    .select('id')
    .eq('id', id)
    .maybeSingle();
  if (reviewError) return databaseUnavailableResponse(reviewError, 'reported review lookup');
  if (!review) return NextResponse.json({ error: 'Review not found.' }, { status: 404 });

  const { data, error } = await supabase
    .from('content_reports')
    .insert({
      user_id: user.id,
      content_type: 'pesticide_review',
      content_id: id,
      reason,
    })
    .select('id')
    .single();
  if (error) return databaseUnavailableResponse(error, 'community review report');
  return NextResponse.json({
    success: true,
    reportId: data.id,
    message: 'Report received and queued for moderation.',
  }, { status: 201 });
}
