export const REVIEW_COLUMNS = [
  'id',
  'pesticide_name',
  'farmer_name',
  'crop',
  'target_pest',
  'review_text',
  'rating',
  'video_url',
  'location',
  'helpful_votes',
  'moderation_status',
  'created_at',
].join(',');

export function isUuid(value) {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function mapComment(comment) {
  return {
    id: comment.id,
    farmerName: comment.farmer_name,
    comment: comment.comment,
    createdAt: comment.created_at,
  };
}

export function mapReview(review, comments = []) {
  return {
    id: review.id,
    pesticideId: '',
    pesticideName: review.pesticide_name,
    farmerName: review.farmer_name,
    location: review.location || '',
    crop: review.crop,
    targetPest: review.target_pest || '',
    rating: review.rating || 0,
    reviewText: review.review_text,
    helpfulVotes: review.helpful_votes || 0,
    createdAt: review.created_at,
    comments: comments.map(mapComment),
    moderationStatus: review.moderation_status,
    videoUrl: review.video_url || '',
  };
}

async function loadComments(supabase, reviewIds) {
  if (!reviewIds.length) return { comments: [], error: null };
  const { data, error } = await supabase
    .from('review_comments')
    .select('id, review_id, farmer_name, comment, created_at')
    .in('review_id', reviewIds)
    .order('created_at', { ascending: true });
  return { comments: data || [], error };
}

export async function listApprovedReviews(supabase, crop) {
  let query = supabase
    .from('pesticide_reviews')
    .select(REVIEW_COLUMNS)
    .eq('moderation_status', 'approved')
    .order('created_at', { ascending: false })
    .limit(100);
  if (crop && crop !== 'All') query = query.ilike('crop', `%${crop}%`);

  const { data: reviews, error } = await query;
  if (error) return { error };
  const { comments, error: commentsError } = await loadComments(
    supabase,
    (reviews || []).map((review) => review.id)
  );
  if (commentsError) return { error: commentsError };
  const commentsByReview = new Map();
  for (const comment of comments) {
    const reviewComments = commentsByReview.get(comment.review_id) || [];
    reviewComments.push(comment);
    commentsByReview.set(comment.review_id, reviewComments);
  }
  return {
    reviews: (reviews || []).map((review) =>
      mapReview(review, commentsByReview.get(review.id) || [])
    ),
  };
}

export async function getApprovedReview(supabase, id) {
  const { data: review, error } = await supabase
    .from('pesticide_reviews')
    .select(REVIEW_COLUMNS)
    .eq('id', id)
    .eq('moderation_status', 'approved')
    .maybeSingle();
  if (error || !review) return { review: null, error };
  const { comments, error: commentsError } = await loadComments(supabase, [review.id]);
  if (commentsError) return { review: null, error: commentsError };
  return { review: mapReview(review, comments) };
}
