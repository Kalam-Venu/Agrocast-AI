import { db } from '../../lib/supabase/db';

export const farmService = {
  getFarmProfile: async (userId) => {
    return await db.getFarmProfile(userId);
  },

  updateFarmProfile: async (userId, data) => {
    return await db.updateFarmProfile(userId, data);
  },

  getCrops: async (farmProfileId) => {
    return await db.getCrops(farmProfileId);
  },

  addCrop: async (farmProfileId, cropData) => {
    return await db.addCrop(farmProfileId, cropData);
  },

  updateCrop: async (cropId, updateData) => {
    return await db.updateCrop(cropId, updateData);
  },

  deleteCrop: async (cropId) => {
    return await db.deleteCrop(cropId);
  },
};
