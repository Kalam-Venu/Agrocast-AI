import { NextResponse } from 'next/server';
import { databaseUnavailableResponse, requireSupabaseUser } from '@/lib/supabase/api';
import { isUuid } from '@/lib/supabase/reviews';

export async function POST(request, { params }) {
  const { supabase, response } = await requireSupabaseUser();
  if (response) return response;

  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: 'Invalid review ID.' }, { status: 400 });
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }
  const comment = typeof body?.comment === 'string' ? body.comment.trim() : '';
  if (!comment || comment.length > 4000) {
    return NextResponse.json({ error: 'Comment must contain 1 to 4000 characters.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('review_comments')
    .insert({
      review_id: id,
      farmer_name: 'Farmer',
      comment,
    })
    .select('id, farmer_name, comment, created_at')
    .single();
  if (error) {
    if (error.code === '23503' || error.code === 'P0002') {
      return NextResponse.json({ error: 'Review not found.' }, { status: 404 });
    }
    return databaseUnavailableResponse(error, 'community comment create');
  }
  return NextResponse.json({
    comment: {
      id: data.id,
      farmerName: data.farmer_name,
      comment: data.comment,
      createdAt: data.created_at,
    },
  }, { status: 201 });
}
