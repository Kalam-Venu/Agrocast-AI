const GEMINI_API_BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta/models';

class GeminiProviderError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'GeminiProviderError';
    this.code = code;
    this.httpStatus = details.httpStatus || null;
    this.providerStatus = details.providerStatus || null;
    this.providerCode = details.providerCode || null;
    this.providerMessage = details.providerMessage || null;
    this.attempts = details.attempts || 1;
  }
}

function isQuotaFailure(error) {
  const message = `${error?.status || ''} ${error?.message || ''}`;
  const quotaDetails = JSON.stringify(error?.details || []);
  return /billing|daily limit|per.?day|monthly|(?:exceed|exhaust).{0,40}quota|quota.{0,40}(?:exceed|exhaust)/i.test(
    `${message} ${quotaDetails}`
  );
}

function redactProviderMessage(message, apiKey) {
  if (typeof message !== 'string') return null;
  return message
    .replaceAll(apiKey, '[REDACTED]')
    .replace(/AIza[0-9A-Za-z_-]{20,}/g, '[REDACTED]')
    .replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[REDACTED]')
    .slice(0, 500);
}

function parseRetryAfter(response) {
  const value = response.headers?.get?.('retry-after');
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds))
    return Math.max(0, Math.min(seconds * 1000, 2000));
  const date = Date.parse(value);
  return Number.isNaN(date)
    ? null
    : Math.max(0, Math.min(date - Date.now(), 2000));
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function readResponseBody(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function createProviderError(error, httpStatus, apiKey, attempts) {
  const providerMessage = redactProviderMessage(error?.message, apiKey);
  const providerStatus =
    typeof error?.status === 'string' ? error.status : null;
  const providerCode = Number.isFinite(error?.code) ? error.code : httpStatus;
  const details = {
    httpStatus,
    providerStatus,
    providerCode,
    providerMessage,
    attempts,
  };

  if (httpStatus === 402 || (httpStatus === 429 && isQuotaFailure(error))) {
    return new GeminiProviderError(
      'AI_PROVIDER_QUOTA_EXCEEDED',
      'Gemini quota is exhausted.',
      details
    );
  }
  if (httpStatus === 429) {
    return new GeminiProviderError(
      'AI_PROVIDER_RATE_LIMITED',
      'Gemini rate limit persisted after retries.',
      details
    );
  }
  if (httpStatus === 503 || httpStatus === 502 || httpStatus === 504) {
    return new GeminiProviderError(
      'AI_PROVIDER_UNAVAILABLE',
      'Gemini is temporarily unavailable.',
      details
    );
  }
  if (httpStatus === 400 || httpStatus === 404) {
    return new GeminiProviderError(
      'AI_PROVIDER_INVALID_CONFIGURATION',
      'Gemini rejected the model or request configuration.',
      details
    );
  }
  if (httpStatus === 401 || httpStatus === 403) {
    return new GeminiProviderError(
      'AI_PROVIDER_INVALID_CONFIGURATION',
      'Gemini rejected the configured API key or permissions.',
      details
    );
  }
  return new GeminiProviderError(
    'AI_PROVIDER_FAILED',
    'Gemini returned an unexpected error.',
    details
  );
}

async function requestGemini({
  model,
  apiKey,
  requestBody,
  fetchImpl = fetch,
  timeoutMs = 25000,
  maxRetries = 2,
  maxTimeoutRetries = 1,
  sleepImpl = wait,
  random = Math.random,
}) {
  const url = `${GEMINI_API_BASE_URL}/${encodeURIComponent(model)}:generateContent`;
  let attempts = 0;
  let timeoutRetries = 0;

  while (attempts <= maxRetries) {
    attempts += 1;
    let response;
    try {
      response = await fetchImpl(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
        if (timeoutRetries < maxTimeoutRetries && attempts <= maxRetries) {
          timeoutRetries += 1;
          const delay = 300 * 2 ** (attempts - 1) + Math.floor(random() * 150);
          await sleepImpl(delay);
          continue;
        }
        throw new GeminiProviderError(
          'AI_PROVIDER_TIMEOUT',
          'Gemini request timed out.',
          { attempts }
        );
      }
      throw new GeminiProviderError(
        'AI_PROVIDER_FAILED',
        'Gemini request could not be completed.',
        { attempts }
      );
    }

    const payload = await readResponseBody(response);
    if (response.ok) return payload;

    const providerError = payload?.error || {};
    if (response.status === 429 && isQuotaFailure(providerError)) {
      throw createProviderError(
        providerError,
        response.status,
        apiKey,
        attempts
      );
    }

    if (
      (response.status === 503 || response.status === 429) &&
      attempts <= maxRetries
    ) {
      const exponentialDelay = 300 * 2 ** (attempts - 1);
      const jitter = Math.floor(random() * 150);
      const delay = parseRetryAfter(response) ?? exponentialDelay + jitter;
      await sleepImpl(delay);
      continue;
    }

    throw createProviderError(providerError, response.status, apiKey, attempts);
  }
}

module.exports = {
  GeminiProviderError,
  requestGemini,
};
