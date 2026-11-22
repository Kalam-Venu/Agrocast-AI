import { NextResponse } from 'next/server';
import { classifyAdvisorIntent } from '../../../../lib/advisor/intent';
import { containsActionableChemicalInstruction } from '../../../../lib/advisor/safety';
import {
  GeminiProviderError,
  requestGemini,
} from '../../../../lib/advisor/geminiClient.cjs';

const GEMINI_MODEL = 'gemini-3.5-flash';
const GEMINI_REQUEST_TIMEOUT_MS = 25000;
const GEMINI_MAX_RETRIES = 1;
const MAX_MESSAGE_LENGTH = 2000;

function responseError(language, code, status) {
  const messages = {
    AI_PROVIDER_NOT_CONFIGURED: {
      te: 'AI సలహా సేవ కాన్ఫిగర్ కాలేదు. సర్వర్‌లో GEMINI_API_KEY ఏర్పాటు చేయండి.',
      en: 'AI advice is not configured. Set GEMINI_API_KEY on the server.',
    },
    AI_PROVIDER_QUOTA_EXCEEDED: {
      te: 'AI సేవ వినియోగ పరిమితి ముగిసింది. ప్రాజెక్ట్ కోటా మరియు బిల్లింగ్‌ను తనిఖీ చేయండి.',
      en: 'The AI service quota is exhausted. Check the project quota and billing.',
    },
    AI_PROVIDER_RATE_LIMITED: {
      te: 'AI సేవ అభ్యర్థన పరిమితిని చేరుకుంది. కొద్దిసేపటి తర్వాత మళ్లీ ప్రయత్నించండి.',
      en: 'The AI service is rate limited. Please try again shortly.',
    },
    AI_PROVIDER_UNAUTHORIZED: {
      te: 'AI సేవ API కీని అంగీకరించలేదు. సర్వర్ కాన్ఫిగరేషన్‌ను తనిఖీ చేయండి.',
      en: 'The AI service rejected its API key. Check the server configuration.',
    },
    AI_PROVIDER_TIMEOUT: {
      te: 'AI సేవ స్పందించడానికి ఎక్కువ సమయం తీసుకుంది. మళ్లీ ప్రయత్నించండి.',
      en: 'The AI service timed out. Please retry.',
    },
    AI_PROVIDER_INVALID_RESPONSE: {
      te: 'AI సేవ నుండి చెల్లుబాటు అయ్యే సమాధానం రాలేదు. మళ్లీ ప్రయత్నించండి.',
      en: 'The AI service returned no usable answer. Please retry.',
    },
    AI_PROVIDER_FAILED: {
      te: 'AI సేవ తాత్కాలికంగా అందుబాటులో లేదు. కొద్దిసేపటి తర్వాత మళ్లీ ప్రయత్నించండి.',
      en: 'The AI service is temporarily unavailable. Please try again later.',
    },
    AI_PROVIDER_INVALID_CONFIGURATION: {
      te: 'AI సేవ కాన్ఫిగరేషన్ లేదా మోడల్ సెట్టింగ్ చెల్లదు. సర్వర్ సెట్టింగ్‌లను తనిఖీ చేయండి.',
      en: 'The AI model or server configuration is invalid. Check the server settings.',
    },
  };
  const localized = messages[code] || messages.AI_PROVIDER_FAILED;
  return NextResponse.json({ error: localized[language], code }, { status });
}

function safeChemicalFallback(language) {
  return language === 'te'
    ? 'కచ్చితమైన పురుగుమందు, శిలీంద్రనాశిని లేదా ఎరువుల మోతాదు, కలయిక లేదా అనధికారిక ఉపయోగ సూచనలు ఇవ్వడం సురక్షితం కాదు. వృత్తిపరమైన రోగ నిర్ధారణకు స్థానిక వ్యవసాయ అధికారి/KVKను సంప్రదించండి. ప్రస్తుతం వర్షం, తేమ మరియు మొక్కల పరిస్థితిని బట్టి పర్యవేక్షణ, పారిశుద్ధ్యం మరియు అనుమతించిన రసాయనేతర నియంత్రణ పద్ధతులు వాడండి.'
    : 'I cannot provide an unsupported pesticide, fungicide, fertilizer dosage, chemical mixture, or unverified application instruction. Consult a local Agriculture Officer or KVK for a field diagnosis and follow the current registered product label. Use safe preventive steps such as field monitoring, sanitation, weather precautions, and approved non-chemical controls where suitable.';
}

function safeText(value, maxLength = 100) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function sanitizeFarmProfile(profile) {
  if (!profile || typeof profile !== 'object' || Array.isArray(profile))
    return null;
  const location =
    profile.location && typeof profile.location === 'object'
      ? profile.location
      : {};
  const crops = Array.isArray(profile.crops)
    ? profile.crops
        .slice(0, 12)
        .map((crop) => ({
          cropName: safeText(crop?.cropName),
          sowingDate: safeText(crop?.sowingDate, 20),
          growthStage: safeText(crop?.growthStage, 40),
        }))
        .filter((crop) => crop.cropName)
    : [];
  const landArea = Number(profile.landArea);
  return {
    location: {
      state: safeText(location.state),
      district: safeText(location.district),
      mandal: safeText(location.mandal),
      village: safeText(location.village),
      coordinatesApproximate: location.approximateCoords === true,
    },
    soilType: safeText(profile.soilType),
    landArea: Number.isFinite(landArea) && landArea > 0 ? landArea : null,
    irrigationMethod: safeText(profile.irrigationMethod),
    crops,
  };
}

function sanitizeWeatherContext(weather) {
  if (!weather || typeof weather !== 'object' || Array.isArray(weather))
    return null;
  const fields = [
    'temperature',
    'feelsLike',
    'rainfall',
    'humidity',
    'windSpeed',
  ];
  const safeWeather = {};
  for (const field of fields) {
    const value = Number(weather[field]);
    if (
      weather[field] !== null &&
      weather[field] !== '' &&
      Number.isFinite(value)
    ) {
      safeWeather[field] = value;
    }
  }
  const description = safeText(weather.description || weather.condition, 160);
  const source = safeText(weather.source, 80);
  if (description) safeWeather.description = description;
  if (source) safeWeather.source = source;
  return Object.keys(safeWeather).length ? safeWeather : null;
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history.slice(-8).flatMap((entry) => {
    if (!entry || !['user', 'assistant'].includes(entry.role)) return [];
    const text = safeText(entry.content, MAX_MESSAGE_LENGTH);
    if (!text) return [];
    return [
      {
        role: entry.role === 'assistant' ? 'model' : 'user',
        parts: [{ text }],
      },
    ];
  });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Request body must be valid JSON.' },
      { status: 400 }
    );
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json(
      { error: 'Request body must be a JSON object.' },
      { status: 400 }
    );
  }

  const language = body.language === 'en' ? 'en' : 'te';
  const message = safeText(body.message, MAX_MESSAGE_LENGTH);
  if (!message) {
    return NextResponse.json(
      { error: 'Message is required.' },
      { status: 400 }
    );
  }
  if (
    typeof body.message !== 'string' ||
    body.message.length > MAX_MESSAGE_LENGTH
  ) {
    return NextResponse.json(
      { error: 'Message must be 1–2000 characters.' },
      { status: 400 }
    );
  }

  const classification = classifyAdvisorIntent(message);
  if (classification.intent === 'greeting') {
    return NextResponse.json({
      reply:
        language === 'te'
          ? 'నమస్కారం! మీ వ్యవసాయ ప్రశ్నకు ఎలా సహాయపడగలను?'
          : 'Hello! How can I help with your farming question?',
      intent: classification.intent,
      provider: 'local greeting',
      language,
    });
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    const errorResponse = responseError(
      language,
      'AI_PROVIDER_NOT_CONFIGURED',
      503
    );
    const payload = await errorResponse.json();
    return NextResponse.json(
      { ...payload, intent: classification.intent, crop: classification.crop },
      { status: 503 }
    );
  }

  const farmContext = sanitizeFarmProfile(body.farmProfile);
  const weatherContext = sanitizeWeatherContext(body.weatherContext);
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const systemPrompt = `You are AgroCast AI, a careful agricultural information assistant for Andhra Pradesh farmers.
Respond only in ${language === 'te' ? 'natural, simple Telugu' : 'clear English'}.
Today in Andhra Pradesh: ${today}.
Detected intent hint: ${classification.intent}. Explicit crop hint: ${classification.crop || 'none'}.
Treat these classifications only as hints. Answer the farmer's actual question; do not infer the subject from registered crops.
Farm profile supplied by the farmer (missing values are unknown): ${JSON.stringify(farmContext)}
Weather observations supplied for this request (missing means unavailable): ${JSON.stringify(weatherContext)}
Guidance:
- Understand Telugu script, Roman Telugu/Tanglish, English, and mixed messages. Do not merely repeat or transliterate the question.
- Give a response specific to the detected intent. A greeting should be conversational; unrelated topics should be politely identified as outside this agricultural assistant's scope.
- For crop suitability or sowing questions, use the location, season, soil, irrigation, and weather details only when provided and reliable. If key details are missing, ask concise follow-up questions instead of asserting suitability.
- Never treat approximate mandal coordinates as exact village coordinates. Coordinates are not supplied to this request.
- Do not invent weather observations, government schemes, market prices, sources, crop recommendations, pesticide registrations, dosages, chemical mixtures, or yield claims.
- Do not prescribe chemical pesticides, fungicides, or fertilizer rates. Refer chemical-use questions to the current registered product label and a local Agriculture Officer/KVK.
- For unsupported or uncertain claims, explain the limitation and what information or official source is needed.`;

  const contents = sanitizeHistory(body.conversationHistory);
  contents.push({ role: 'user', parts: [{ text: message }] });

  try {
    const payload = await requestGemini({
      model: GEMINI_MODEL,
      apiKey,
      timeoutMs: GEMINI_REQUEST_TIMEOUT_MS,
      maxRetries: GEMINI_MAX_RETRIES,
      maxTimeoutRetries: 1,
      requestBody: {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          temperature: 0.25,
          maxOutputTokens: 1000,
        },
      },
    });
    const reply = payload.candidates?.[0]?.content?.parts
      ?.map((part) => (typeof part.text === 'string' ? part.text : ''))
      .join('')
      .trim();
    if (!reply) {
      return responseError(language, 'AI_PROVIDER_INVALID_RESPONSE', 502);
    }
    if (containsActionableChemicalInstruction(reply)) {
      console.warn(
        'Gemini advisor response rejected: potential actionable chemical instruction.',
        { provider: GEMINI_MODEL, intent: classification.intent, language }
      );
      return NextResponse.json({
        reply: safeChemicalFallback(language),
        intent: classification.intent,
        crop: classification.crop,
        provider: 'safety fallback',
        language,
        safetyFallback: true,
      });
    }

    return NextResponse.json({
      reply,
      intent: classification.intent,
      crop: classification.crop,
      provider: GEMINI_MODEL,
      language,
    });
  } catch (error) {
    if (error instanceof GeminiProviderError) {
      console.warn('Gemini advisor request failed.', {
        code: error.code,
        httpStatus: error.httpStatus,
        providerStatus: error.providerStatus,
        providerCode: error.providerCode,
        providerMessage: error.providerMessage,
        attempts: error.attempts,
      });
      if (error.code === 'AI_PROVIDER_TIMEOUT') {
        return responseError(language, error.code, 504);
      }
      if (
        error.code === 'AI_PROVIDER_RATE_LIMITED' ||
        error.code === 'AI_PROVIDER_QUOTA_EXCEEDED'
      ) {
        return responseError(language, error.code, 429);
      }
      if (error.code === 'AI_PROVIDER_INVALID_CONFIGURATION') {
        return responseError(language, error.code, 503);
      }
      if (error.code === 'AI_PROVIDER_UNAVAILABLE') {
        return responseError(language, error.code, 503);
      }
      return responseError(language, error.code, 502);
    }
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return responseError(language, 'AI_PROVIDER_TIMEOUT', 504);
    }
    console.error('Advisor provider request failed:', error.name);
    return responseError(language, 'AI_PROVIDER_FAILED', 502);
  }
}
