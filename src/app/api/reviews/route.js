import { NextResponse } from 'next/server';
import { databaseUnavailableResponse, requireSupabaseUser } from '@/lib/supabase/api';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { listApprovedReviews, mapReview } from '@/lib/supabase/reviews';

export async function GET(request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured on this server.' }, { status: 503 });
  }
  const { searchParams } = new URL(request.url);
  const result = await listApprovedReviews(supabase, searchParams.get('crop'));
  if (result.error) return databaseUnavailableResponse(result.error, 'community review read');
  return NextResponse.json({ reviews: result.reviews, count: result.reviews.length });
}

export async function POST(request) {
  const { supabase, user, response } = await requireSupabaseUser();
  if (response) return response;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Review data must be a JSON object.' }, { status: 400 });
  }

  const pesticideName = typeof body.pesticideName === 'string' ? body.pesticideName.trim() : '';
  const crop = typeof body.crop === 'string' ? body.crop.trim() : '';
  const reviewText = typeof body.reviewText === 'string' ? body.reviewText.trim() : '';
  const targetPest = typeof body.targetPest === 'string' ? body.targetPest.trim() : '';
  const rating = Number(body.rating);
  let videoUrl = '';
  if (typeof body.videoUrl === 'string' && body.videoUrl.trim()) {
    try {
      const parsed = new URL(body.videoUrl.trim());
      if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('Unsupported protocol.');
      videoUrl = parsed.toString();
    } catch {
      return NextResponse.json({ error: 'Video URL must be a valid HTTP or HTTPS URL.' }, { status: 400 });
    }
  }
  if (
    !pesticideName || pesticideName.length > 120 ||
    !crop || crop.length > 120 ||
    !reviewText || reviewText.length > 5000 ||
    targetPest.length > 120 ||
    !Number.isInteger(rating) || rating < 1 || rating > 5 ||
    videoUrl.length > 1000
  ) {
    return NextResponse.json({ error: 'Provide a pesticide, crop, review, and a rating from 1 to 5.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('pesticide_reviews')
    .insert({
      user_id: user.id,
      pesticide_name: pesticideName,
      farmer_name: 'Farmer',
      crop,
      target_pest: targetPest || null,
      review_text: reviewText,
      rating,
      video_url: videoUrl || null,
      location: 'Andhra Pradesh',
    })
    .select('*')
    .single();
  if (error) return databaseUnavailableResponse(error, 'community review create');
  return NextResponse.json({ review: mapReview(data) }, { status: 201 });
}
