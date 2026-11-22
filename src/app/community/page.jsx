'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { INITIAL_FARMER_REVIEWS } from '../../lib/data/reviews';
import {
  Users,
  ThumbsUp,
  MessageSquare,
  Plus,
  Star,
  ShieldAlert,
  Send,
  Flag,
  CheckCircle2,
  X,
  MapPin,
} from 'lucide-react';

export default function CommunityPage() {
  const { t, isTelugu } = useLanguage();
  const { user, isSupabaseConfigured } = useAuth();

  const [reviews, setReviews] = useState(INITIAL_FARMER_REVIEWS);
  const [filterCrop, setFilterCrop] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [communityError, setCommunityError] = useState('');
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // New review form
  const [formPesticide, setFormPesticide] = useState('');
  const [formCrop, setFormCrop] = useState('Paddy (వరి)');
  const [formPest, setFormPest] = useState('');
  const [formText, setFormText] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formVideo, setFormVideo] = useState('');

  // Comment input per review
  const [commentInputs, setCommentInputs] = useState({});
  const writesEnabled = !isSupabaseConfigured || Boolean(user && !user.isDemo);

  useEffect(() => {
    let active = true;
    if (!isSupabaseConfigured) {
      setReviews(INITIAL_FARMER_REVIEWS);
      setReviewsLoading(false);
      return () => {
        active = false;
      };
    }

    fetch('/api/reviews?crop=All')
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || 'Could not load community reviews.');
        return result;
      })
      .then(({ reviews: savedReviews }) => {
        if (!active) return;
        setReviews(Array.isArray(savedReviews) ? savedReviews : []);
        setCommunityError('');
      })
      .catch((error) => {
        if (!active) return;
        console.error('Community review load failed:', error.message);
        setReviews([]);
        setCommunityError(error.message);
      })
      .finally(() => {
        if (active) setReviewsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isSupabaseConfigured]);

  const handleVote = async (id) => {
    if (!isSupabaseConfigured) {
      setReviews((prev) =>
        prev.map((review) =>
          review.id === id ? { ...review, helpfulVotes: review.helpfulVotes + 1 } : review
        )
      );
      return;
    }
    try {
      const response = await fetch(`/api/reviews/${id}/vote`, { method: 'POST' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not record your vote.');
      setReviews((prev) =>
        prev.map((review) =>
          review.id === id ? { ...review, helpfulVotes: result.helpfulVotes } : review
        )
      );
      setCommunityError('');
    } catch (error) {
      setCommunityError(error.message);
    }
  };

  const handleAddComment = async (reviewId) => {
    const text = commentInputs[reviewId]?.trim();
    if (!text) return;

    let newComment;
    if (isSupabaseConfigured) {
      try {
        const response = await fetch(`/api/reviews/${reviewId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comment: text }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || 'Could not save your comment.');
        newComment = result.comment;
        setCommunityError('');
      } catch (error) {
        setCommunityError(error.message);
        return;
      }
    } else {
      newComment = {
        id: 'c-' + Date.now(),
        farmerName: user?.fullName || 'రైతు మిత్రుడు',
        comment: text,
        createdAt: new Date().toISOString().split('T')[0],
      };
    }

    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, comments: [...(r.comments || []), newComment] } : r
      )
    );

    setCommentInputs((prev) => ({ ...prev, [reviewId]: '' }));
  };

  const handleCreateReview = async (e) => {
    e.preventDefault();
    if (!formPesticide || !formText) return;

    setSubmitting(true);
    let newRev;
    if (isSupabaseConfigured) {
      try {
        const response = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pesticideName: formPesticide,
            crop: formCrop,
            targetPest: formPest || 'General Pest',
            rating: formRating,
            reviewText: formText,
            videoUrl: formVideo,
          }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || 'Could not submit your review.');
        newRev = result.review;
        setCommunityError('');
      } catch (error) {
        setCommunityError(error.message);
        setSubmitting(false);
        return;
      }
    } else {
      newRev = {
        id: 'rev-' + Date.now(),
        pesticideId: 'custom',
        pesticideName: formPesticide,
        farmerName: user?.fullName || 'రైతు మిత్రుడు',
        location: 'Andhra Pradesh',
        crop: formCrop,
        targetPest: formPest || 'General Pest',
        rating: formRating,
        reviewText: formText,
        helpfulVotes: 0,
        createdAt: new Date().toISOString().split('T')[0],
        comments: [],
        moderationStatus: 'approved',
        videoUrl: formVideo,
      };
    }

    setReviews((prev) => [newRev, ...prev]);
    setShowAddModal(false);
    setFormPesticide('');
    setFormText('');
    setFormPest('');
    setFormVideo('');
    setSubmitting(false);
  };

  const handleReport = async (reviewId) => {
    if (!isSupabaseConfigured) {
      setReportSuccess(true);
      setTimeout(() => setReportSuccess(false), 3000);
      return;
    }
    try {
      const response = await fetch(`/api/reviews/${reviewId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not report this review.');
      setCommunityError('');
      setReportSuccess(true);
      setTimeout(() => setReportSuccess(false), 3000);
    } catch (error) {
      setCommunityError(error.message);
    }
  };

  const filtered = reviews.filter((r) => {
    if (filterCrop !== 'All' && !r.crop.toLowerCase().includes(filterCrop.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
            <Users className="w-4 h-4 text-blue-600" />
            <span>{t('community.title')}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('community.title')}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
            {t('community.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          disabled={!writesEnabled}
          className="self-start md:self-auto px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all inline-flex items-center disabled:opacity-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('community.shareExperienceBtn')}
        </button>
      </div>

      {/* Moderation Disclaimer Notice */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center space-x-2">
        <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span>{t('community.moderationNotice')}</span>
      </div>

      {reportSuccess && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{t('community.reportSuccess')}</span>
        </div>
      )}
      {communityError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          {communityError}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-600 whitespace-nowrap">
          {t('community.filterByCrop')}
        </span>
        {['All', 'Paddy', 'Chilli', 'Cotton', 'Banana'].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilterCrop(c)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              filterCrop === c
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviewsLoading && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            {t('common.loading')}
          </div>
        )}
        {!reviewsLoading && filtered.length === 0 && !communityError && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            {isTelugu ? 'ఈ పంటకు సమీక్షలు అందుబాటులో లేవు.' : 'No reviews are available for this crop.'}
          </div>
        )}
        {!reviewsLoading && filtered.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-slate-900 text-base">
                    {rev.farmerName}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center">
                    <MapPin className="w-3 h-3 mr-0.5 text-slate-400" />
                    {rev.location}
                  </span>
                </div>
                <div className="text-xs font-semibold text-emerald-700 mt-0.5">
                  {rev.pesticideName} • {rev.crop}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center text-amber-500">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-400">{rev.createdAt}</span>
              </div>
            </div>

            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
              {rev.reviewText}
            </p>

            {rev.videoUrl && (
              <div className="text-xs text-blue-600 font-medium">
                🎥 Video: <a href={rev.videoUrl} target="_blank" rel="noopener noreferrer" className="underline">{rev.videoUrl}</a>
              </div>
            )}

            {/* Actions: Helpful button & Report */}
            <div className="flex flex-wrap items-center justify-between gap-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  disabled={!writesEnabled}
                  onClick={() => handleVote(rev.id)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-colors font-medium"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('community.helpful')} ({rev.helpfulVotes})</span>
                </button>

                <div className="text-slate-500 flex items-center space-x-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{(rev.comments || []).length} {t('community.comments')}</span>
                </div>
              </div>

              <button
                type="button"
                disabled={!writesEnabled}
                onClick={() => handleReport(rev.id)}
                className="text-slate-400 hover:text-red-600 transition-colors flex items-center space-x-1"
                title={t('community.reportContent')}
              >
                <Flag className="w-3.5 h-3.5" />
                <span className="text-[11px]">{t('community.reportContent')}</span>
              </button>
            </div>

            {/* Comments Thread */}
            {(rev.comments || []).length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                {rev.comments.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-slate-800">{c.farmerName}</div>
                    <div className="text-slate-700">{c.comment}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment Input */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                value={commentInputs[rev.id] || ''}
                onChange={(e) =>
                  setCommentInputs({ ...commentInputs, [rev.id]: e.target.value })
                }
                disabled={!writesEnabled}
                placeholder={t('community.addCommentPlaceholder')}
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => handleAddComment(rev.id)}
                disabled={!writesEnabled}
                className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Review Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {t('community.modalTitle')}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('community.pesticideNameLabel')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Coragen / Pegasus"
                  value={formPesticide}
                  onChange={(e) => setFormPesticide(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('community.cropLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formCrop}
                    onChange={(e) => setFormCrop(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('community.targetPestLabel')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Stem Borer"
                    value={formPest}
                    onChange={(e) => setFormPest(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('community.ratingLabel')}
                </label>
                <select
                  value={formRating}
                  onChange={(e) => setFormRating(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 Stars - Excellent)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 Stars - Good)</option>
                  <option value={3}>⭐⭐⭐ (3 Stars - Average)</option>
                  <option value={2}>⭐⭐ (2 Stars - Low)</option>
                  <option value={1}>⭐ (1 Star - Poor)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('community.experienceLabel')}
                </label>
                <textarea
                  rows={3}
                  required
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="మీ పంటపై మందు ఎలా పనిచేసింది? మోతాదు ఎంత వాడారు?..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('community.videoUrlLabel')}
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/..."
                  value={formVideo}
                  onChange={(e) => setFormVideo(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!writesEnabled || submitting}
                  className="px-5 py-2 text-sm font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow disabled:opacity-50"
                >
                  {t('common.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
