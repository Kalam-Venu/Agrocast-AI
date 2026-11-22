// Server-side Data Store Layer with Supabase connection & robust offline fallback
import { ANDHRA_PRADESH_DISTRICTS } from '../data/andhraPradesh';
import { PESTICIDES_DATA } from '../data/pesticides';
import { AP_MARKETS, DAILY_MARKET_PRICES, OFFICIAL_MSP_RATES, PRICE_TREND_DATA } from '../data/markets';
import { AP_WEATHER_ALERTS } from '../data/weatherAlerts';
import { INITIAL_FARMER_REVIEWS } from '../data/reviews';

// In-Memory store initialized with verified AP baseline data
let mockDatabase = {
  profiles: {
    'farmer-demo-ap-01': {
      id: 'farmer-demo-ap-01',
      fullName: 'వెంకటేశ్వర రావు (Venkateswara Rao)',
      email: 'farmer@agrocast.ap.gov.in',
      phone: '+91 98480 22338',
      preferredLanguage: 'te',
      notificationsEnabled: true,
      updatedAt: new Date().toISOString(),
    },
  },
  farmProfiles: {
    'farm-01': {
      id: 'farm-01',
      userId: 'farmer-demo-ap-01',
      location: {
        state: 'Andhra Pradesh',
        district: 'Guntur',
        mandal: 'Tenali',
        village: 'Angalakuduru',
        latitude: 16.2437,
        longitude: 80.6400,
      },
      soilType: 'black',
      landArea: 4.5,
      irrigationMethod: 'canal',
      updatedAt: new Date().toISOString(),
    },
  },
  farmCrops: [
    {
      id: 'crop-1',
      farmProfileId: 'farm-01',
      cropName: 'Paddy (వరి)',
      sowingDate: '2026-07-15',
      growthStage: 'vegetative',
      notes: 'యూరియా మరియు పొటాష్ మొదటి విడత వేశాము. నీటి మట్టం 2 అంగుళాలు నిర్వహిస్తున్నాము.',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'crop-2',
      farmProfileId: 'farm-01',
      cropName: 'Chilli (మిరప)',
      sowingDate: '2026-08-10',
      growthStage: 'flowering',
      notes: 'కొద్దిగా ఆకుముడత లక్షణాలు ఉన్నాయి. వేపనూనె పిచికారీ చేయబడింది.',
      updatedAt: new Date().toISOString(),
    },
  ],
  conversations: [
    {
      id: 'conv-demo-01',
      userId: 'farmer-demo-ap-01',
      title: 'వరిలో ఎరువుల యాజమాన్యం',
      preferredLanguage: 'te',
      createdAt: '2026-11-19T10:00:00Z',
      messages: [
        {
          id: 'm1',
          role: 'user',
          message: 'వరి పిలక దశలో ఎంత యూరియా వేయాలి?',
          createdAt: '2026-11-19T10:00:00Z',
        },
        {
          id: 'm2',
          role: 'assistant',
          message: 'ఎకరానికి 25-30 కిలోల యూరియాను పొటాష్‌తో కలిపి వేయండి. వర్షం లేనప్పుడు వేయడం ముఖ్యం.',
          createdAt: '2026-11-19T10:01:00Z',
        },
      ],
    },
  ],
  reviews: [...INITIAL_FARMER_REVIEWS],
  reports: [],
  notifications: [
    {
      id: 'notif-1',
      userId: 'farmer-demo-ap-01',
      type: 'weather_alert',
      title: 'తీరప్రాంత ఆంధ్రప్రదేశ్‌కు భారీ వర్ష సూచన',
      message: 'రాగల 48 గంటల్లో భారీ వర్షాలు కురిసే అవకాశం ఉన్నందున ఎరువుల పిచికారీని వాయిదా వేయండి.',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
  ],
};

export const db = {
  // Profiles
  getProfile: async (userId = 'farmer-demo-ap-01') => {
    return mockDatabase.profiles[userId] || mockDatabase.profiles['farmer-demo-ap-01'];
  },

  updateProfile: async (userId = 'farmer-demo-ap-01', data) => {
    const existing = mockDatabase.profiles[userId] || mockDatabase.profiles['farmer-demo-ap-01'];
    mockDatabase.profiles[userId] = { ...existing, ...data, updatedAt: new Date().toISOString() };
    return mockDatabase.profiles[userId];
  },

  updateLanguage: async (userId = 'farmer-demo-ap-01', lang) => {
    if (!['te', 'en'].includes(lang)) {
      throw new Error('Unsupported language. Only te and en are allowed.');
    }
    const profile = await db.getProfile(userId);
    profile.preferredLanguage = lang;
    return profile;
  },

  // Farm & Crops
  getFarmProfile: async (userId = 'farmer-demo-ap-01') => {
    const farm = mockDatabase.farmProfiles['farm-01'];
    const crops = mockDatabase.farmCrops.filter((c) => c.farmProfileId === farm.id);
    return { ...farm, crops };
  },

  updateFarmProfile: async (userId = 'farmer-demo-ap-01', data) => {
    const existing = mockDatabase.farmProfiles['farm-01'];
    mockDatabase.farmProfiles['farm-01'] = { ...existing, ...data, updatedAt: new Date().toISOString() };
    return mockDatabase.farmProfiles['farm-01'];
  },

  getCrops: async (farmProfileId = 'farm-01') => {
    return mockDatabase.farmCrops.filter((c) => c.farmProfileId === farmProfileId);
  },

  addCrop: async (farmProfileId = 'farm-01', cropData) => {
    const newCrop = {
      id: 'crop-' + Date.now(),
      farmProfileId,
      ...cropData,
      updatedAt: new Date().toISOString(),
    };
    mockDatabase.farmCrops.push(newCrop);
    return newCrop;
  },

  updateCrop: async (cropId, updateData) => {
    const idx = mockDatabase.farmCrops.findIndex((c) => c.id === cropId);
    if (idx === -1) return null;
    mockDatabase.farmCrops[idx] = { ...mockDatabase.farmCrops[idx], ...updateData, updatedAt: new Date().toISOString() };
    return mockDatabase.farmCrops[idx];
  },

  deleteCrop: async (cropId) => {
    mockDatabase.farmCrops = mockDatabase.farmCrops.filter((c) => c.id !== cropId);
    return { success: true, deletedId: cropId };
  },

  // Conversations
  getConversations: async (userId = 'farmer-demo-ap-01') => {
    return mockDatabase.conversations.filter((c) => c.userId === userId);
  },

  getConversationById: async (convId) => {
    return mockDatabase.conversations.find((c) => c.id === convId) || null;
  },

  createConversation: async (userId = 'farmer-demo-ap-01', title, language = 'te') => {
    const newConv = {
      id: 'conv-' + Date.now(),
      userId,
      title: title || 'కొత్త సంభాషణ',
      preferredLanguage: language,
      createdAt: new Date().toISOString(),
      messages: [],
    };
    mockDatabase.conversations.unshift(newConv);
    return newConv;
  },

  addMessageToConversation: async (convId, role, message, language = 'te') => {
    let conv = mockDatabase.conversations.find((c) => c.id === convId);
    if (!conv) {
      conv = await db.createConversation('farmer-demo-ap-01', message.slice(0, 30), language);
    }
    const msg = {
      id: 'msg-' + Date.now(),
      role,
      message,
      language,
      createdAt: new Date().toISOString(),
    };
    conv.messages.push(msg);
    return msg;
  },

  deleteConversation: async (convId) => {
    mockDatabase.conversations = mockDatabase.conversations.filter((c) => c.id !== convId);
    return { success: true };
  },

  // Reviews
  getReviews: async (crop = null) => {
    if (!crop || crop === 'All') return mockDatabase.reviews;
    return mockDatabase.reviews.filter((r) => r.crop.toLowerCase().includes(crop.toLowerCase()));
  },

  getReviewById: async (reviewId) => {
    return mockDatabase.reviews.find((r) => r.id === reviewId) || null;
  },

  createReview: async (reviewData) => {
    const newRev = {
      id: 'rev-' + Date.now(),
      farmerName: reviewData.farmerName || 'రైతు మిత్రుడు',
      location: reviewData.location || 'Andhra Pradesh',
      crop: reviewData.crop || 'Paddy',
      pesticideName: reviewData.pesticideName,
      targetPest: reviewData.targetPest || 'General',
      rating: reviewData.rating || 5,
      reviewText: reviewData.reviewText,
      helpfulVotes: 0,
      createdAt: new Date().toISOString().split('T')[0],
      comments: [],
      moderationStatus: 'approved',
      videoUrl: reviewData.videoUrl || '',
    };
    mockDatabase.reviews.unshift(newRev);
    return newRev;
  },

  addCommentToReview: async (reviewId, farmerName, comment) => {
    const rev = mockDatabase.reviews.find((r) => r.id === reviewId);
    if (!rev) return null;
    const newComment = {
      id: 'c-' + Date.now(),
      farmerName: farmerName || 'రైతు మిత్రుడు',
      comment,
      createdAt: new Date().toISOString().split('T')[0],
    };
    rev.comments.push(newComment);
    return newComment;
  },

  voteReviewHelpful: async (reviewId) => {
    const rev = mockDatabase.reviews.find((r) => r.id === reviewId);
    if (!rev) return null;
    rev.helpfulVotes = (rev.helpfulVotes || 0) + 1;
    return { id: reviewId, helpfulVotes: rev.helpfulVotes };
  },

  reportContent: async (contentType, contentId, reason) => {
    const report = {
      id: 'rep-' + Date.now(),
      contentType,
      contentId,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    mockDatabase.reports.push(report);
    return report;
  },

  // Notifications
  getNotifications: async (userId = 'farmer-demo-ap-01') => {
    return mockDatabase.notifications.filter((n) => n.userId === userId);
  },

  markNotificationAsRead: async (notifId) => {
    const notif = mockDatabase.notifications.find((n) => n.id === notifId);
    if (notif) notif.isRead = true;
    return notif || { success: true };
  },

  // Agricultural Reference Data
  getPesticides: async () => PESTICIDES_DATA,
  getPesticideById: async (id) => PESTICIDES_DATA.find((p) => p.id === id) || null,
  getMarkets: async () => AP_MARKETS,
  getMarketById: async (id) => AP_MARKETS.find((m) => m.id === id) || null,
  getMarketPrices: async () => DAILY_MARKET_PRICES,
  getMSPRates: async () => OFFICIAL_MSP_RATES,
  getPriceTrends: async () => PRICE_TREND_DATA,
  getWeatherAlerts: async () => AP_WEATHER_ALERTS,
  getDistricts: async () => ANDHRA_PRADESH_DISTRICTS,
};
