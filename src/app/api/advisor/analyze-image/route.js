import { NextResponse } from 'next/server';
import { containsActionableChemicalInstruction } from '../../../../lib/advisor/safety';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_DATA_URL_LENGTH = Math.ceil(MAX_IMAGE_BYTES * 4 / 3) + 128;
const GEMINI_MODEL = 'gemini-3.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_STAGES = new Set([
  'germination',
  'seedling',
  'vegetative',
  'flowering',
  'fruiting',
  'maturity',
  'harvest',
  'not_sure',
]);
const ALLOWED_IMAGE_TYPES_BY_USER = new Set([
  'crop_disease',
  'pest_insect',
  'pesticide_label',
  'unsure',
]);

function errorResponse(language, code, status) {
  const messages = {
    AI_PROVIDER_UNAVAILABLE: {
      te: 'చిత్ర విశ్లేషణ సేవ కాన్ఫిగర్ చేయబడలేదు. సర్వర్‌లో GEMINI_API_KEY ఏర్పాటు చేయండి.',
      en: 'Image analysis is not configured. Set GEMINI_API_KEY on the server.',
    },
    AI_PROVIDER_RATE_LIMITED: {
      te: 'చిత్ర విశ్లేషణ సేవ అభ్యర్థన పరిమితిని చేరుకుంది. కొద్దిసేపటి తర్వాత ప్రయత్నించండి.',
      en: 'Image analysis is rate limited. Please try again shortly.',
    },
    AI_PROVIDER_UNAUTHORIZED: {
      te: 'చిత్ర విశ్లేషణ సేవ API కీని అంగీకరించలేదు. సర్వర్ కాన్ఫిగరేషన్‌ను తనిఖీ చేయండి.',
      en: 'The image service rejected its API key. Check the server configuration.',
    },
    AI_PROVIDER_TIMEOUT: {
      te: 'చిత్ర విశ్లేషణకు ఎక్కువ సమయం పట్టింది. మళ్లీ ప్రయత్నించండి.',
      en: 'Image analysis timed out. Please try again.',
    },
    AI_PROVIDER_FAILED: {
      te: 'చిత్ర విశ్లేషణ సేవ తాత్కాలికంగా అందుబాటులో లేదు.',
      en: 'Image analysis is temporarily unavailable.',
    },
    AI_PROVIDER_INVALID_RESPONSE: {
      te: 'చిత్రం నుండి స్పష్టమైన, ధృవీకరించగల విశ్లేషణ రాలేదు.',
      en: 'The image service returned no usable, verifiable analysis.',
    },
  };
  const localized = messages[code] || messages.AI_PROVIDER_FAILED;
  return NextResponse.json(
    { success: false, unavailable: true, code, error: localized[language] },
    { status }
  );
}

function inputError(language, code) {
  const messages = {
    CROP_REQUIRED: {
      te: 'చిత్ర విశ్లేషణకు పంట పేరు అవసరం.',
      en: 'A crop name is required for image analysis.',
    },
    IMAGE_TOO_LARGE: {
      te: '5 MB కంటే చిన్న JPEG, PNG లేదా WebP చిత్రాన్ని ఎంచుకోండి.',
      en: 'Choose a JPEG, PNG, or WebP image smaller than 5 MB.',
    },
    INVALID_IMAGE_DATA_URL: {
      te: 'చెల్లుబాటు అయ్యే base64 డేటా URLతో JPEG, PNG లేదా WebP చిత్రాన్ని అందించండి.',
      en: 'Provide a JPEG, PNG, or WebP image using a valid base64 data URL.',
    },
    INVALID_IMAGE_CONTENT: {
      te: 'చిత్ర డేటా చెల్లదు, మద్దతు లేనిది లేదా 5 MB కంటే పెద్దది.',
      en: 'The image data is invalid, unsupported, or larger than 5 MB.',
    },
    INVALID_GROWTH_STAGE: {
      te: 'సరైన పంట దశను ఎంచుకోండి.',
      en: 'Choose a valid crop growth stage.',
    },
    INVALID_IMAGE_TYPE: {
      te: 'సరైన చిత్ర రకాన్ని ఎంచుకోండి.',
      en: 'Choose a valid image type.',
    },
    SYMPTOM_TOO_LONG: {
      te: 'లక్షణాల వివరణ 1000 అక్షరాలు లేదా అంతకంటే తక్కువగా ఉండాలి.',
      en: 'Symptom description must be 1000 characters or fewer.',
    },
  };
  return NextResponse.json({ error: messages[code][language] }, { status: 400 });
}

function safeText(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function imageSignatureMatches(mimeType, bytes) {
  if (mimeType === 'image/jpeg') {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === 'image/png') {
    return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'));
  }
  if (mimeType === 'image/webp') {
    return bytes.length >= 12 &&
      bytes.toString('ascii', 0, 4) === 'RIFF' &&
      bytes.toString('ascii', 8, 12) === 'WEBP';
  }
  return false;
}

function sanitizeFarmContext(context) {
  if (!context || typeof context !== 'object' || Array.isArray(context)) return null;
  const location = context.location && typeof context.location === 'object'
    ? context.location
    : {};
  const crops = Array.isArray(context.crops)
    ? context.crops.slice(0, 12).map((crop) => ({
        cropName: safeText(crop?.cropName, 100),
        growthStage: safeText(crop?.growthStage, 40),
      })).filter((crop) => crop.cropName)
    : [];
  const landArea = Number(context.landArea);
  return {
    location: {
      state: safeText(location.state, 80),
      district: safeText(location.district, 80),
      mandal: safeText(location.mandal, 80),
      village: safeText(location.village, 100),
      coordinatesApproximate: location.approximateCoords === true,
    },
    soilType: safeText(context.soilType, 80),
    landArea: Number.isFinite(landArea) && landArea > 0 ? landArea : null,
    irrigationMethod: safeText(context.irrigationMethod, 80),
    crops,
  };
}

function buildAnalysisPrompt({ cropName, growthStage, symptoms, imageType, farmContext, language }) {
  const languageName = language === 'te' ? 'natural, simple Telugu' : 'clear English';
  const labelImage = imageType === 'pesticide_label';
  return `Analyze the supplied agricultural image. Respond only in ${languageName} as a JSON object with exactly these keys:
{
  "imageSummary": "short summary of what is visible",
  "visibleObservations": ["only directly visible details"],
  "possibleIdentification": "cautious possibility, or state that it cannot be determined",
  "evidence": "what visible evidence supports the possibility, or explain uncertainty",
  "confidenceLevel": "low, moderate, or high",
  "safeNextSteps": "safe non-chemical steps only",
  "additionalInfoNeeded": "short follow-up information needed, or empty string",
  "needsClearerImage": true,
  "productName": "readable product name for label photos, otherwise empty string",
  "activeIngredient": "readable active ingredient for label photos, otherwise empty string",
  "visibleLabelInformation": ["verbatim readable label text only"]
}

Farmer-selected crop: ${cropName}
Growth stage: ${growthStage}
Farmer's optional symptom description: ${symptoms || 'Not provided'}
Image type selected by farmer: ${imageType}
Farm context supplied (missing fields are unknown): ${JSON.stringify(farmContext)}

Rules:
- Describe only pixels and text that are actually visible. Do not invent symptoms, crop details, product names, active ingredients, registrations, labels, or certainty.
- If the image is blurred, incomplete, or does not show enough evidence, use low confidence, say identification is not possible, and set needsClearerImage to true.
- Explain uncertainty and request a closer, well-lit photo or missing context where useful.
- Provide safe immediate non-chemical steps only; do not prescribe pesticide/fungicide products, chemical mixtures, dosage, schedules, or label instructions.
- Do not claim CIBRC/ANGRAU approval or that the image proves a product is registered.
- ${labelImage
    ? 'This is a pesticide product-label image. Do not diagnose crop disease. Transcribe product/ingredient/other label details only when clearly readable; do not infer missing text or advise use.'
    : 'This is not a pesticide-label verification task. Do not identify or recommend a pesticide product.'}
- Keep every string concise and return valid JSON without markdown fences.`;
}

function validateDiagnostics(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const textFields = [
    'imageSummary',
    'possibleIdentification',
    'evidence',
    'safeNextSteps',
    'additionalInfoNeeded',
    'productName',
    'activeIngredient',
  ];
  if (textFields.some((field) => typeof value[field] !== 'string')) return null;
  if (!Array.isArray(value.visibleObservations) || value.visibleObservations.length > 8) return null;
  if (!value.visibleObservations.every((item) => typeof item === 'string')) return null;
  if (!Array.isArray(value.visibleLabelInformation) || value.visibleLabelInformation.length > 8) return null;
  if (!value.visibleLabelInformation.every((item) => typeof item === 'string')) return null;
  if (!['low', 'moderate', 'high'].includes(value.confidenceLevel)) return null;
  if (typeof value.needsClearerImage !== 'boolean') return null;

  const visibleObservations = value.visibleObservations
    .map((item) => item.trim().slice(0, 300))
    .filter(Boolean);
  const visibleLabelInformation = value.visibleLabelInformation
    .map((item) => item.trim().slice(0, 300))
    .filter(Boolean);
  return {
    imageSummary: value.imageSummary.trim().slice(0, 500),
    visibleObservations,
    possibleIdentification: value.possibleIdentification.trim().slice(0, 500),
    evidence: value.evidence.trim().slice(0, 800),
    confidenceLevel: value.confidenceLevel,
    safeNextSteps: value.safeNextSteps.trim().slice(0, 1200),
    additionalInfoNeeded: value.additionalInfoNeeded.trim().slice(0, 500),
    needsClearerImage: value.needsClearerImage,
    productName: value.productName.trim().slice(0, 200),
    activeIngredient: value.activeIngredient.trim().slice(0, 200),
    visibleLabelInformation,
  };
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Request body must be a JSON object.' }, { status: 400 });
  }

  const language = body.language === 'en' ? 'en' : 'te';
  const cropName = safeText(body.cropName, 100);
  if (!cropName) {
    return inputError(language, 'CROP_REQUIRED');
  }
  if (typeof body.imageBase64 !== 'string' || body.imageBase64.length > MAX_DATA_URL_LENGTH) {
    return inputError(language, 'IMAGE_TOO_LARGE');
  }

  const imageMatch = body.imageBase64.match(
    /^data:(image\/(?:jpeg|png|webp));base64,((?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?)$/
  );
  if (!imageMatch || !ALLOWED_IMAGE_TYPES.has(imageMatch[1])) {
    return inputError(language, 'INVALID_IMAGE_DATA_URL');
  }

  const imageBytes = Buffer.from(imageMatch[2], 'base64');
  if (
    imageBytes.length === 0 ||
    imageBytes.length > MAX_IMAGE_BYTES ||
    !imageSignatureMatches(imageMatch[1], imageBytes)
  ) {
    return inputError(language, 'INVALID_IMAGE_CONTENT');
  }

  const growthStage = body.growthStage === undefined ? 'not_sure' : safeText(body.growthStage, 40);
  if (!ALLOWED_STAGES.has(growthStage)) {
    return inputError(language, 'INVALID_GROWTH_STAGE');
  }
  const imageType = body.imageType === undefined ? 'crop_disease' : safeText(body.imageType, 40);
  if (!ALLOWED_IMAGE_TYPES_BY_USER.has(imageType)) {
    return inputError(language, 'INVALID_IMAGE_TYPE');
  }
  const symptomDescription = safeText(body.symptomDescription, 1000);
  if (typeof body.symptomDescription === 'string' && body.symptomDescription.length > 1000) {
    return inputError(language, 'SYMPTOM_TOO_LONG');
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return errorResponse(language, 'AI_PROVIDER_UNAVAILABLE', 503);
  }

  const farmContext = sanitizeFarmContext(body.farmContext);
  try {
    const response = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [
            {
              text: buildAnalysisPrompt({
                cropName,
                growthStage,
                symptoms: symptomDescription,
                imageType,
                farmContext,
                language,
              }),
            },
            { inline_data: { mime_type: imageMatch[1], data: imageMatch[2] } },
          ],
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1200,
          responseMimeType: 'application/json',
        },
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (response.status === 401 || response.status === 403) {
      console.warn('Gemini image analysis rejected the configured API key.');
      return errorResponse(language, 'AI_PROVIDER_UNAUTHORIZED', 503);
    }
    if (response.status === 429) {
      return errorResponse(language, 'AI_PROVIDER_RATE_LIMITED', 429);
    }
    if (!response.ok) {
      console.warn('Gemini image analysis returned HTTP', response.status);
      return errorResponse(language, 'AI_PROVIDER_FAILED', 502);
    }

    const payload = await response.json();
    const responseText = payload.candidates?.[0]?.content?.parts
      ?.map((part) => typeof part.text === 'string' ? part.text : '')
      .join('')
      .trim();
    if (!responseText) {
      return errorResponse(language, 'AI_PROVIDER_INVALID_RESPONSE', 502);
    }

    let rawDiagnostics;
    try {
      rawDiagnostics = JSON.parse(responseText);
    } catch {
      return errorResponse(language, 'AI_PROVIDER_INVALID_RESPONSE', 502);
    }
    const analysis = validateDiagnostics(rawDiagnostics);
    if (!analysis) {
      return errorResponse(language, 'AI_PROVIDER_INVALID_RESPONSE', 502);
    }
    const userFacingAnalysis = [
      analysis.imageSummary,
      ...analysis.visibleObservations,
      analysis.possibleIdentification,
      analysis.evidence,
      analysis.safeNextSteps,
      analysis.additionalInfoNeeded,
    ].join('\n');
    if (containsActionableChemicalInstruction(userFacingAnalysis)) {
      console.warn('Gemini image analysis contained a chemical application instruction.');
      return errorResponse(language, 'AI_PROVIDER_INVALID_RESPONSE', 502);
    }

    const disclaimer = language === 'te'
      ? 'ఇవి AI రూపొందించిన దృశ్య పరిశీలనలు మాత్రమే; అధికారిక నిర్ధారణ లేదా పురుగుమందు ఆమోదం కాదు. చర్యకు ముందు నమోదిత లేబుల్‌ను పాటించి వ్యవసాయ అధికారి/KVKను సంప్రదించండి.'
      : 'These are AI-generated visual observations only, not an official diagnosis or pesticide approval. Follow the registered product label and consult an Agricultural Officer/KVK before acting.';
    const diagnostics = {
      ...analysis,
      symptomsIdentified: analysis.visibleObservations,
      possibleIssue: analysis.possibleIdentification,
      recommendation: analysis.safeNextSteps,
      disclaimer,
    };

    return NextResponse.json({
      success: true,
      cropName,
      growthStage,
      imageType,
      diagnostics,
      provider: GEMINI_MODEL,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return errorResponse(language, 'AI_PROVIDER_TIMEOUT', 504);
    }
    console.error('Image analysis request failed:', error.name);
    return errorResponse(language, 'AI_PROVIDER_FAILED', 502);
  }
}
