import { NextResponse } from 'next/server';
import { databaseUnavailableResponse, requireSupabaseUser } from '@/lib/supabase/api';
import { isUuid } from '@/lib/supabase/reviews';

export async function POST(_request, { params }) {
  const { supabase, response } = await requireSupabaseUser();
  if (response) return response;

  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: 'Invalid review ID.' }, { status: 400 });
  const { data, error } = await supabase.rpc('vote_review_helpful', { p_review_id: id });
  if (error) {
    if (error.code === 'P0002') return NextResponse.json({ error: 'Review not found.' }, { status: 404 });
    return databaseUnavailableResponse(error, 'community review vote');
  }
  return NextResponse.json({ helpfulVotes: data });
}
