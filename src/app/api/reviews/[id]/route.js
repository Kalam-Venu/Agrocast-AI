import { NextResponse } from 'next/server';
import { databaseUnavailableResponse } from '@/lib/supabase/api';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getApprovedReview, isUuid } from '@/lib/supabase/reviews';

export async function GET(_request, { params }) {
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: 'Invalid review ID.' }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured on this server.' }, { status: 503 });
  }
  const result = await getApprovedReview(supabase, id);
  if (result.error) return databaseUnavailableResponse(result.error, 'community review read');
  if (!result.review) return NextResponse.json({ error: 'Review not found.' }, { status: 404 });
  return NextResponse.json({ review: result.review });
}
