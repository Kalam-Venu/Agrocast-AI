import { db } from '../../lib/supabase/db';

export const advisorService = {
  getConversations: async (userId) => {
    return await db.getConversations(userId);
  },

  getConversationById: async (convId) => {
    return await db.getConversationById(convId);
  },

  createConversation: async (userId, title, lang) => {
    return await db.createConversation(userId, title, lang);
  },

  addMessage: async (convId, role, message, lang) => {
    return await db.addMessageToConversation(convId, role, message, lang);
  },

  deleteConversation: async (convId) => {
    return await db.deleteConversation(convId);
  },
};
