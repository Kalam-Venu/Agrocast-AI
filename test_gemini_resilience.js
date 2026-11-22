const assert = require('node:assert/strict');
const {
  GeminiProviderError,
  requestGemini,
} = require('./src/lib/advisor/geminiClient.cjs');

const request = {
  model: 'gemini-3.5-flash',
  apiKey: 'test-secret-key',
  maxRetries: 1,
  requestBody: {
    contents: [{ role: 'user', parts: [{ text: 'test question' }] }],
  },
};

function response(status, body, retryAfter = null) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => (name === 'retry-after' ? retryAfter : null) },
    json: async () => body,
  };
}

async function run() {
  let successUrl;
  let successOptions;
  const successfulPayload = {
    candidates: [{ content: { parts: [{ text: 'A helpful answer.' }] } }],
  };
  const success = await requestGemini({
    ...request,
    fetchImpl: async (url, options) => {
      successUrl = url;
      successOptions = options;
      return response(200, successfulPayload);
    },
  });
  assert.equal(success, successfulPayload);
  assert.equal(successOptions.headers['x-goog-api-key'], request.apiKey);
  assert.equal(successUrl.includes(request.apiKey), false);
  console.log('PASS Gemini success and API-key header handling');

  let attempts = 0;
  const delays = [];
  const recovered = await requestGemini({
    ...request,
    fetchImpl: async () => {
      attempts += 1;
      return attempts === 1
        ? response(503, {
            error: { code: 503, status: 'UNAVAILABLE', message: 'Overloaded' },
          })
        : response(200, successfulPayload);
    },
    sleepImpl: async (delay) => delays.push(delay),
    random: () => 0,
  });
  assert.equal(recovered, successfulPayload);
  assert.equal(attempts, 2);
  assert.deepEqual(delays, [300]);
  console.log('PASS transient upstream 503 retry');

  attempts = 0;
  let exhausted503;
  try {
    await requestGemini({
      ...request,
      fetchImpl: async () => {
        attempts += 1;
        return response(503, {
          error: {
            code: 503,
            status: 'UNAVAILABLE',
            message: `Overloaded; key ${request.apiKey}`,
          },
        });
      },
      sleepImpl: async () => {},
      random: () => 0,
    });
  } catch (error) {
    exhausted503 = error;
  }
  assert.ok(exhausted503 instanceof GeminiProviderError);
  assert.equal(exhausted503.code, 'AI_PROVIDER_UNAVAILABLE');
  assert.equal(exhausted503.attempts, 2);
  assert.equal(exhausted503.providerMessage.includes(request.apiKey), false);
  console.log('PASS bounded upstream 503 retries and redacted diagnostics');

  attempts = 0;
  const recovered429 = await requestGemini({
    ...request,
    fetchImpl: async () => {
      attempts += 1;
      return attempts === 1
        ? response(
            429,
            {
              error: {
                code: 429,
                status: 'RESOURCE_EXHAUSTED',
                message: 'Too many requests',
              },
            },
            '0'
          )
        : response(200, successfulPayload);
    },
    sleepImpl: async () => {},
    random: () => 0,
  });
  assert.equal(recovered429, successfulPayload);
  assert.equal(attempts, 2);
  console.log('PASS transient upstream 429 retry');

  attempts = 0;
  let quotaError;
  try {
    await requestGemini({
      ...request,
      fetchImpl: async () => {
        attempts += 1;
        return response(429, {
          error: {
            code: 429,
            status: 'RESOURCE_EXHAUSTED',
            message: 'You exceeded your current quota; check billing.',
          },
        });
      },
      sleepImpl: async () => {},
    });
  } catch (error) {
    quotaError = error;
  }
  assert.equal(quotaError.code, 'AI_PROVIDER_QUOTA_EXCEEDED');
  assert.equal(attempts, 1);
  let paymentError;
  try {
    await requestGemini({
      ...request,
      fetchImpl: async () =>
        response(402, {
          error: {
            code: 402,
            status: 'PAYMENT_REQUIRED',
            message: 'Prepay credits are depleted.',
          },
        }),
    });
  } catch (error) {
    paymentError = error;
  }
  assert.equal(paymentError.code, 'AI_PROVIDER_QUOTA_EXCEEDED');
  console.log(
    'PASS quota exhaustion is not retried as transient rate limiting'
  );

  attempts = 0;
  const timeoutRecovered = await requestGemini({
    ...request,
    fetchImpl: async () => {
      attempts += 1;
      if (attempts === 1) {
        const error = new Error('request timeout');
        error.name = 'TimeoutError';
        throw error;
      }
      return response(200, successfulPayload);
    },
    sleepImpl: async () => {},
  });
  assert.equal(timeoutRecovered, successfulPayload);
  assert.equal(attempts, 2);
  console.log('PASS one bounded network-level timeout retry');

  attempts = 0;
  let timeoutError;
  try {
    await requestGemini({
      ...request,
      fetchImpl: async () => {
        attempts += 1;
        const error = new Error('request timeout');
        error.name = 'TimeoutError';
        throw error;
      },
      sleepImpl: async () => {},
    });
  } catch (error) {
    timeoutError = error;
  }
  assert.equal(timeoutError.code, 'AI_PROVIDER_TIMEOUT');
  assert.equal(timeoutError.attempts, 2);
  assert.equal(attempts, 2);
  console.log('PASS timeout classification after one retry');

  attempts = 0;
  let invalidKeyError;
  try {
    await requestGemini({
      ...request,
      fetchImpl: async () => {
        attempts += 1;
        return response(403, {
          error: {
            code: 403,
            status: 'PERMISSION_DENIED',
            message: 'API key is invalid.',
          },
        });
      },
    });
  } catch (error) {
    invalidKeyError = error;
  }
  assert.equal(invalidKeyError.code, 'AI_PROVIDER_INVALID_CONFIGURATION');
  assert.equal(attempts, 1);
  console.log('PASS invalid API-key errors are not retried');

  let configurationError;
  try {
    await requestGemini({
      ...request,
      fetchImpl: async () =>
        response(404, {
          error: { code: 404, status: 'NOT_FOUND', message: 'Model not found' },
        }),
    });
  } catch (error) {
    configurationError = error;
  }
  assert.equal(configurationError.code, 'AI_PROVIDER_INVALID_CONFIGURATION');
  console.log('PASS invalid model/configuration classification');

  const { withLoadingState } =
    await import('./src/lib/advisor/withLoadingState.mjs');
  const loadingStates = [];
  assert.equal(
    await withLoadingState(
      (value) => loadingStates.push(value),
      async () => 'done'
    ),
    'done'
  );
  assert.deepEqual(loadingStates, [true, false]);
  loadingStates.length = 0;
  await assert.rejects(
    withLoadingState(
      (value) => loadingStates.push(value),
      async () => {
        throw new Error('simulated request failure');
      }
    ),
    /simulated request failure/
  );
  assert.deepEqual(loadingStates, [true, false]);
  loadingStates.length = 0;
  await assert.rejects(
    withLoadingState(
      (value) => loadingStates.push(value),
      async () => {
        const error = new Error('simulated timeout');
        error.name = 'TimeoutError';
        throw error;
      }
    ),
    /simulated timeout/
  );
  assert.deepEqual(loadingStates, [true, false]);
  console.log('PASS UI loading state clears after success and failure');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
