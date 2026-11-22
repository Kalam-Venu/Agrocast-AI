import { db } from '../../lib/supabase/db';

export const notificationService = {
  getNotifications: async (userId) => {
    return await db.getNotifications(userId);
  },

  markAsRead: async (notifId) => {
    return await db.markNotificationAsRead(notifId);
  },
};
