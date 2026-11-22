import { db } from '../../lib/supabase/db';

export const authService = {
  getProfile: async (userId) => {
    return await db.getProfile(userId);
  },

  updateProfile: async (userId, data) => {
    return await db.updateProfile(userId, data);
  },

  updateLanguage: async (userId, language) => {
    return await db.updateLanguage(userId, language);
  },
};
