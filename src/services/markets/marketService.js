import { db } from '../../lib/supabase/db';
import { calculateHaversineDistanceKm } from '../../lib/services/marketService';

export const marketService = {
  getMarkets: async (district) => {
    const markets = await db.getMarkets();
    if (!district) return markets;
    return markets.filter((m) => m.district.toLowerCase() === district.toLowerCase());
  },

  getMarketById: async (id) => {
    return await db.getMarketById(id);
  },

  getNearbyMarkets: async (userLat, userLon, limit = 5) => {
    const markets = await db.getMarkets();
    if (!Number.isFinite(userLat) || !Number.isFinite(userLon)) {
      throw new Error('Valid farm coordinates are required to find nearby markets');
    }

    return markets
      .map((market) => ({
        ...market,
        distanceKm: market.coordinatesVerified === true
          ? calculateHaversineDistanceKm(userLat, userLon, market.lat, market.lon)
          : null,
      }))
      .filter((market) => market.distanceKm != null)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit);
  },

  getPrices: async (crop) => {
    const prices = await db.getMarketPrices();
    if (!crop) return prices;
    return prices.filter((p) => p.cropName.toLowerCase().includes(crop.toLowerCase()));
  },

  getMSPRates: async () => {
    return await db.getMSPRates();
  },

  getPriceTrends: async () => {
    return await db.getPriceTrends();
  },

  calculateEstimate: ({
    quantity,
    pricePerQuintal,
    transportPerQuintal,
    otherDeductions = 0,
  }) => {
    if (
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      !Number.isFinite(pricePerQuintal) ||
      pricePerQuintal < 0 ||
      !Number.isFinite(transportPerQuintal) ||
      transportPerQuintal < 0 ||
      !Number.isFinite(otherDeductions) ||
      otherDeductions < 0
    ) {
      throw new Error('Quantity, price, transport cost, and deductions must be valid non-negative amounts');
    }

    const grossValue = quantity * pricePerQuintal;
    const transportTotal = quantity * transportPerQuintal;
    const netValue = grossValue - transportTotal - otherDeductions;

    return {
      quantityQuintals: quantity,
      modalPricePerQuintal: pricePerQuintal,
      grossValue,
      transportDeductions: transportTotal,
      otherDeductions,
      netEstimatedIncome: netValue,
      currency: '₹',
      unit: 'Quintal',
      disclaimer: 'Estimate based only on the entered price, transport cost, and documented deductions.',
    };
  },
};
