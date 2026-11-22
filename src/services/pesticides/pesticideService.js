import { db } from '../../lib/supabase/db';

export const pesticideService = {
  getAllPesticides: async ({ query = '', category = '', verifiedOnly = false }) => {
    const pesticides = await db.getPesticides();
    return pesticides.filter((p) => {
      if (verifiedOnly && !p.isVerified) return false;
      if (category && category !== 'All' && p.category.toLowerCase() !== category.toLowerCase()) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.activeIngredient.toLowerCase().includes(q) ||
          p.approvedCrops.some((c) => c.toLowerCase().includes(q)) ||
          p.targetPests.some((pest) => pest.toLowerCase().includes(q))
        );
      }
      return true;
    });
  },

  getPesticideById: async (id) => {
    return await db.getPesticideById(id);
  },

  getReviews: async (crop) => {
    return await db.getReviews(crop);
  },

  getReviewById: async (id) => {
    return await db.getReviewById(id);
  },

  createReview: async (reviewData) => {
    return await db.createReview(reviewData);
  },

  addComment: async (reviewId, farmerName, comment) => {
    return await db.addCommentToReview(reviewId, farmerName, comment);
  },

  voteHelpful: async (reviewId) => {
    return await db.voteReviewHelpful(reviewId);
  },

  reportReview: async (reviewId, reason) => {
    return await db.reportContent('pesticide_review', reviewId, reason);
  },
};
