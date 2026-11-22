const intentPatterns = [
  {
    intent: 'market_prices',
    patterns: [
      'market price', 'mandi rate', 'market rate', 'modal price', 'crop price',
      'ధర ఎంత', 'మార్కెట్ ధర', 'మండి ధర', 'విలువ ఎంత',
    ],
  },
  {
    intent: 'government_schemes',
    patterns: [
      'government scheme', 'govt scheme', 'scheme benefit', 'subsidy', 'pm kisan',
      'పథకం', 'ప్రభుత్వ సహాయం', 'సబ్సిడీ',
    ],
  },
  {
    intent: 'weather_advice',
    patterns: [
      'weather', 'rain', 'forecast', 'వాతావరణం', 'వర్షం', 'వాన',
    ],
  },
  {
    intent: 'harvesting_guidance',
    patterns: [
      'harvest', 'harvesting', 'when to cut', 'కోత ఎప్పుడు', 'కోతకు',
    ],
  },
  {
    intent: 'crop_calendar',
    patterns: [
      'crop calendar', 'season calendar', 'when to sow', 'sowing season',
      'పంట కాలం', 'ఏ సీజన్', 'ఏ సీజన్‌లో',
    ],
  },
  {
    intent: 'seed_selection',
    patterns: [
      'which seed', 'seed variety', 'seed selection', 'విత్తనం ఏది', 'రకం విత్తనం',
    ],
  },
  {
    intent: 'soil_suitability',
    patterns: [
      'soil type', 'soil suitability', 'my soil', 'నేల రకం', 'నేలలో పండుతుందా',
    ],
  },
  {
    intent: 'fertilizer_guidance',
    patterns: [
      'fertilizer', 'fertiliser', 'urea', 'npk', 'పొటాష్', 'యూరియా', 'ఎరువు', 'ఎరువుల',
    ],
  },
  {
    intent: 'irrigation_scheduling',
    patterns: [
      'irrigat', 'watering', 'water my field', 'నీరు పెట్ట', 'నీరు ఎప్పుడు', 'సాగునీరు',
    ],
  },
  {
    intent: 'pesticide_guidance',
    patterns: [
      'pesticide', 'insecticide', 'fungicide', 'spray', 'chemical dose', 'మందు కొట్ట',
      'పురుగుమందు', 'పిచికారీ', 'మోతాదు',
    ],
  },
  {
    intent: 'disease_identification',
    patterns: [
      'disease', 'leaf curl', 'yellow spot', 'yellowing', 'symptom', 'lesion',
      'aaku muduch', 'muduchu', 'ఆకుముడత', 'ముడుచుకుంట', 'పసుపు మచ్చ', 'మచ్చలు', 'తెగులు',
    ],
  },
  {
    intent: 'pest_identification',
    patterns: [
      'pest', 'insect', 'worm', 'bollworm', 'thrips', 'whitefly', 'mite',
      'purugu', ' పురుగు', 'పురుగు', 'నల్లి', 'తామర పురుగు',
    ],
  },
  {
    intent: 'crop_selection',
    patterns: [
      'which crop', 'what crop', 'crop to grow', 'select a crop', 'ఏ పంట', 'ఏ పంటను',
    ],
  },
  {
    intent: 'crop_suitability',
    patterns: [
      'suitable', 'can i grow', 'can i plant', 'can i sow', 'set avutunda',
      'set avuthunda', 'veyacha', 'veyocha', 'వేయవచ్చా', 'అనుకూలమా',
    ],
  },
  {
    intent: 'sowing_recommendation',
    patterns: [
      'sow', 'sowing', 'plant', 'cultivat', 'veyali', 'veyadam', 'vestha',
      'vestunna', 'vedham', 'veddam', 'natu', 'నాటాలి', 'విత్తాలి', 'సాగు చేయ',
    ],
  },
];

const cropPatterns = [
  { crop: 'chickpea', patterns: ['chickpea', 'bengal gram', 'senaga', 'shanaga', 'శనగ'] },
  { crop: 'red_gram', patterns: ['red gram', 'pigeon pea', 'tur dal', 'kandi', 'కంది'] },
  { crop: 'black_gram', patterns: ['black gram', 'urad', 'minumu', 'మినుము'] },
  { crop: 'groundnut', patterns: ['groundnut', 'peanut', 'verusenaga', 'వేరుశనగ'] },
  { crop: 'chilli', patterns: ['chilli', 'chili', 'mirchi', 'mirapa', 'మిరప'] },
  { crop: 'cotton', patterns: ['cotton', 'patti', 'పత్తి'] },
  { crop: 'maize', patterns: ['maize', 'corn', 'mokka jonna', 'మొక్కజొన్న'] },
  { crop: 'tomato', patterns: ['tomato', 'tamata', 'టమాటా', 'టమోటా'] },
  { crop: 'paddy', patterns: ['paddy', 'rice', 'vari', 'వరి'] },
];

const normalize = (value) => value.toLocaleLowerCase().replace(/\s+/g, ' ').trim();

export function classifyAdvisorIntent(message) {
  const query = normalize(message);
  const greeting = /^(hi|hello|hey|namaste|namaskaram|నమస్కారం|హలో|నమస్తే)[!.?\s]*$/u.test(query);
  if (greeting) {
    return { intent: 'greeting', crop: null };
  }

  const cropMatch = cropPatterns.find(({ patterns }) =>
    patterns.some((pattern) => query.includes(normalize(pattern)))
  );
  const detected = intentPatterns.find(({ patterns }) =>
    patterns.some((pattern) => query.includes(normalize(pattern)))
  );

  return {
    intent: detected?.intent || 'general_conversation',
    crop: cropMatch?.crop || null,
  };
}
