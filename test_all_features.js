const http = require('http');
const { spawn } = require('child_process');

const BASE_URL = 'http://127.0.0.1:3000';

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
          json,
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(
        typeof options.body === 'string'
          ? options.body
          : JSON.stringify(options.body)
      );
    }
    req.end();
  });
}

async function waitForServer(maxRetries = 20) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetchUrl(`${BASE_URL}/api/health`);
      if (res.status === 200) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 600));
  }
  return false;
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🌱 AGROCAST AI — COMPREHENSIVE FULL-STACK TEST SUITE');
  console.log('======================================================\n');

  console.log('Starting Next.js Production Server...');
  const server = spawn(
    'node',
    ['node_modules/next/dist/bin/next', 'start', '-p', '3000'],
    {
      stdio: 'ignore',
      detached: false,
    }
  );

  const isUp = await waitForServer();
  if (!isUp) {
    console.error('❌ Server failed to start on http://127.0.0.1:3000');
    server.kill();
    process.exit(1);
  }
  await new Promise((r) => setTimeout(r, 1500));
  console.log('✅ Server online at http://127.0.0.1:3000\n');

  let passed = 0;
  let failed = 0;
  let geminiConfigured = false;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name} -> ${err.message}`);
      failed++;
    }
  }

  console.log('--- 1. FRONTEND PAGES TESTS ---');
  await test('Landing Page (/) renders in Telugu by default', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    if (!res.body.includes('ఆగ్రోకాస్ట్') && !res.body.includes('AgroCast')) {
      throw new Error('Title missing');
    }
  });

  await test('Farmer Dashboard (/dashboard) renders successfully', async () => {
    const res = await fetchUrl(`${BASE_URL}/dashboard`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });

  await test('Weather Intelligence Page (/weather) renders successfully', async () => {
    const res = await fetchUrl(`${BASE_URL}/weather`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });

  await test('My Farm & Profile Page (/my-farm) renders successfully', async () => {
    const res = await fetchUrl(`${BASE_URL}/my-farm`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });

  await test('AI Farming Advisor Page (/advisor) renders successfully', async () => {
    const res = await fetchUrl(`${BASE_URL}/advisor`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });

  await test('Pesticide Intelligence Page (/pesticides) renders successfully', async () => {
    const res = await fetchUrl(`${BASE_URL}/pesticides`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });

  await test('Farmer Community Page (/community) renders successfully', async () => {
    const res = await fetchUrl(`${BASE_URL}/community`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });

  await test('Smart Crop Selling & Markets Page (/markets) renders successfully', async () => {
    const res = await fetchUrl(`${BASE_URL}/markets`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });

  await test('User Profile & Settings Page (/profile) renders successfully', async () => {
    const res = await fetchUrl(`${BASE_URL}/profile`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });

  await test('Login Page (/login) renders with Demo login button', async () => {
    const res = await fetchUrl(`${BASE_URL}/login`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });

  await test('Registration Page (/register) renders successfully', async () => {
    const res = await fetchUrl(`${BASE_URL}/register`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });

  console.log('\n--- 2. BACKEND API TESTS ---');
  await test('GET /api/health -> confirms healthy status', async () => {
    const res = await fetchUrl(`${BASE_URL}/api/health`);
    if (res.status !== 200 || res.json?.status !== 'healthy') {
      throw new Error(`Unexpected response: ${res.body}`);
    }
    const geminiStatus = res.json?.integrations?.geminiAI;
    if (!['configured', 'not-configured'].includes(geminiStatus)) {
      throw new Error(
        `Unexpected Gemini configuration status: ${geminiStatus}`
      );
    }
    geminiConfigured = geminiStatus === 'configured';
  });

  await test('GET /api/locations/districts -> returns all 26 AP districts', async () => {
    const res = await fetchUrl(`${BASE_URL}/api/locations/districts`);
    if (res.status !== 200 || !res.json?.districts?.length) {
      throw new Error('No districts returned');
    }
  });

  await test('GET /api/locations/mandals?district=Guntur -> returns mandals', async () => {
    const res = await fetchUrl(
      `${BASE_URL}/api/locations/mandals?district=Guntur`
    );
    if (res.status !== 200 || !res.json?.mandals?.length) {
      throw new Error('Mandals missing');
    }
  });

  await test('GET /api/locations/villages?district=Guntur&mandal=Tenali -> returns villages', async () => {
    const res = await fetchUrl(
      `${BASE_URL}/api/locations/villages?district=Guntur&mandal=Tenali`
    );
    if (res.status !== 200 || !res.json?.villages?.length) {
      throw new Error('Villages missing');
    }
  });

  await test('GET /api/weather/current -> live Open-Meteo weather conditions', async () => {
    const res = await fetchUrl(
      `${BASE_URL}/api/weather/current?lat=16.3067&lon=80.4365&lang=te`
    );
    if (res.status !== 200 || typeof res.json?.temperature !== 'number') {
      throw new Error('Invalid weather payload');
    }
  });

  await test('GET /api/weather/forecast -> 7-day and 24-hr hourly forecast', async () => {
    const res = await fetchUrl(
      `${BASE_URL}/api/weather/forecast?lat=16.3067&lon=80.4365&lang=te`
    );
    if (res.status !== 200 || !res.json?.dailyForecast?.length) {
      throw new Error('Daily forecast missing');
    }
  });

  await test('GET /api/weather/alerts?district=Guntur -> weather alerts', async () => {
    const res = await fetchUrl(
      `${BASE_URL}/api/weather/alerts?district=Guntur`
    );
    if (res.status !== 200 || !Array.isArray(res.json?.alerts)) {
      throw new Error('Alerts missing');
    }
  });

  await test('GET /api/weather/history?district=Guntur -> normal vs actual rainfall baseline', async () => {
    const res = await fetchUrl(
      `${BASE_URL}/api/weather/history?district=Guntur`
    );
    if (
      res.status !== 200 ||
      !res.json?.rainfallIntelligence?.seasonalNormalMm
    ) {
      throw new Error('Rainfall intelligence missing');
    }
  });

  await test('GET /api/market-prices -> reports bounded AGMARKNET 2.0 statewide data', async () => {
    const res = await fetchUrl(`${BASE_URL}/api/market-prices?limit=10`);
    if (res.status === 200) {
      if (!Array.isArray(res.json?.records))
        throw new Error('Market records missing');
      if (!['live', 'cached', 'unavailable'].includes(res.json?.dataStatus)) {
        throw new Error('Market data status missing');
      }
      if (
        res.json?.source?.startsWith('AGMARKNET 2.0') !== true ||
        res.json?.partial !== true ||
        !Number.isInteger(res.json?.checkedCombinations) ||
        res.json.checkedCombinations > 26
      ) {
        throw new Error('Statewide source or bounded-sample metadata missing');
      }
      if (
        res.json.records.some(
          (record) =>
            !record.source ||
            !record.source.startsWith('AGMARKNET 2.0') ||
            record.state !== 'Andhra Pradesh' ||
            !record.commodity ||
            !record.marketName ||
            !record.district ||
            !record.arrivalDate ||
            !Number.isFinite(record.modalPrice)
        )
      ) {
        throw new Error('Market record source or state is invalid');
      }
      if (res.json.records.length && !res.json.latestArrivalDate) {
        throw new Error('Latest available arrival date is missing');
      }
      const cached = await fetchUrl(`${BASE_URL}/api/market-prices?limit=10`);
      if (
        cached.status !== 200 ||
        cached.json?.isCached !== true ||
        cached.json?.pagination?.total !== res.json?.pagination?.total
      ) {
        throw new Error('Statewide response was not cached consistently');
      }
    } else if (
      ![502, 503, 429].includes(res.status) ||
      res.json?.unavailable !== true
    ) {
      throw new Error(`Unexpected unavailable response: HTTP ${res.status}`);
    }
  });

  await test('Advisor intent detection -> English, Telugu, and Roman Telugu cases', async () => {
    const { classifyAdvisorIntent } =
      await import('./src/lib/advisor/intent.js');
    const { containsActionableChemicalInstruction } =
      await import('./src/lib/advisor/safety.js');
    const cases = [
      ['hello', 'greeting', null],
      [
        'Nenu Paidupadu Zaurugumalli lo senaga vedham anukuntunna',
        'sowing_recommendation',
        'chickpea',
      ],
      ['Ee season lo vari veyacha?', 'crop_suitability', 'paddy'],
      ['Mirapaku aaku muduchukuntundi', 'disease_identification', 'chilli'],
      ['Na cotton pantalo purugulu unnayi', 'pest_identification', 'cotton'],
      ['Which crop should I plant?', 'crop_selection', null],
    ];
    for (const [message, expectedIntent, expectedCrop] of cases) {
      const actual = classifyAdvisorIntent(message);
      if (actual.intent !== expectedIntent || actual.crop !== expectedCrop) {
        throw new Error(
          `Unexpected classification for "${message}": ${JSON.stringify(actual)}`
        );
      }
    }
    if (
      !containsActionableChemicalInstruction(
        'Apply imidacloprid at 0.3 ml per litre.'
      )
    ) {
      throw new Error('Chemical application rate was not detected');
    }
    if (
      containsActionableChemicalInstruction(
        'Do not spray pesticides; ask an Agriculture Officer.'
      )
    ) {
      throw new Error('A non-chemical safety warning was incorrectly rejected');
    }
  });

  await test('POST /api/advisor/chat -> local greeting in both languages', async () => {
    for (const language of ['en', 'te']) {
      const res = await fetchUrl(`${BASE_URL}/api/advisor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { message: 'hello', language },
      });
      if (
        res.status !== 200 ||
        res.json?.intent !== 'greeting' ||
        !res.json?.reply
      ) {
        throw new Error(`Greeting failed for ${language}: ${res.body}`);
      }
    }
  });

  if (!geminiConfigured) {
    await test('POST /api/advisor/chat -> reports missing Gemini configuration', async () => {
      const res = await fetchUrl(`${BASE_URL}/api/advisor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          message: 'How can I improve chilli crop health?',
          language: 'en',
          farmProfile: {
            location: { district: 'Guntur', mandal: 'Tenali' },
            crops: [{ cropName: 'Chilli', growthStage: 'flowering' }],
          },
        },
      });
      if (
        res.status !== 503 ||
        res.json?.code !== 'AI_PROVIDER_NOT_CONFIGURED' ||
        res.json?.intent !== 'general_conversation' ||
        res.json?.reply
      ) {
        throw new Error(`Expected explicit unavailable response: ${res.body}`);
      }
    });
  } else {
    console.log(
      '  ⏭️ Skipping provider-dependent chat checks; no external Gemini calls are made by this suite.'
    );
  }

  await test('POST /api/advisor/analyze-image -> rejects invalid image data without fabricated diagnosis', async () => {
    const res = await fetchUrl(`${BASE_URL}/api/advisor/analyze-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        imageBase64: 'data:image/png;base64,%%invalid%%',
        cropName: 'Paddy',
        language: 'te',
      },
    });
    if (res.status !== 400 || res.json?.diagnostics) {
      throw new Error('Invalid image data was not rejected');
    }
  });

  await test('POST /api/advisor/analyze-image -> requires the farmer-selected crop', async () => {
    const res = await fetchUrl(`${BASE_URL}/api/advisor/analyze-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { imageBase64: 'data:image/png;base64,c2FtcGxl', language: 'en' },
    });

    await test('POST /api/advisor/analyze-image -> rejects an image with a mismatched file signature', async () => {
      const res = await fetchUrl(`${BASE_URL}/api/advisor/analyze-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          imageBase64: 'data:image/png;base64,c2FtcGxl',
          cropName: 'Paddy',
          language: 'en',
        },
      });
      if (res.status !== 400 || res.json?.unavailable) {
        throw new Error('Mismatched image signature was not rejected');
      }
    });

    await test('POST /api/advisor/analyze-image -> rejects image payloads over 5 MB', async () => {
      const res = await fetchUrl(`${BASE_URL}/api/advisor/analyze-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          imageBase64: `data:image/png;base64,${'A'.repeat(7 * 1024 * 1024)}`,
          cropName: 'Paddy',
          language: 'en',
        },
      });
      if (res.status !== 400 || res.json?.unavailable) {
        throw new Error('Oversized image payload was not rejected');
      }
    });

    if (!geminiConfigured) {
      await test('POST /api/advisor/analyze-image -> validates image and reports missing provider', async () => {
        const res = await fetchUrl(`${BASE_URL}/api/advisor/analyze-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: {
            imageBase64:
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/rWQAAAAASUVORK5CYII=',
            cropName: 'Farmer-added crop',
            growthStage: 'flowering',
            symptomDescription: 'Leaf spots visible after rain.',
            imageType: 'crop_disease',
            language: 'te',
          },
        });
        if (
          res.status !== 503 ||
          res.json?.code !== 'AI_PROVIDER_UNAVAILABLE' ||
          res.json?.success !== false ||
          !res.json?.error
        ) {
          throw new Error(
            `Expected explicit image-analysis unavailability: ${res.body}`
          );
        }
      });
    } else {
      console.log(
        '  ⏭️ Skipping provider-dependent image checks; no external Gemini calls are made by this suite.'
      );
    }
    if (res.status !== 400 || !res.json?.error?.includes('crop name')) {
      throw new Error('Missing crop was not rejected');
    }
  });

  await test('GET /api/pesticides/search?q=coragen -> pesticide search filter', async () => {
    const res = await fetchUrl(`${BASE_URL}/api/pesticides/search?q=coragen`);
    if (res.status !== 200 || res.json?.count === 0) {
      throw new Error('Pesticide search failed');
    }
  });

  await test('GET /api/reviews -> farmer field reviews feed', async () => {
    const res = await fetchUrl(`${BASE_URL}/api/reviews`);
    if (res.status !== 200 || !res.json?.reviews?.length) {
      throw new Error('Reviews missing');
    }
  });

  await test('POST /api/reviews -> submit a new farmer field review', async () => {
    const res = await fetchUrl(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        pesticideName: 'Amistar Top',
        crop: 'Paddy',
        targetPest: 'Blast',
        rating: 5,
        reviewText: 'వరిలో అగ్గి తెగులు నివారణకు అద్భుతంగా పనిచేసింది.',
      },
    });
    if (res.status !== 201 || !res.json?.review?.id) {
      throw new Error('Review creation failed');
    }
  });

  await test('POST /api/reviews/rev-1/vote -> upvote a review as helpful', async () => {
    const res = await fetchUrl(`${BASE_URL}/api/reviews/rev-1/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {},
    });
    if (res.status !== 200 || typeof res.json?.helpfulVotes !== 'number') {
      throw new Error('Vote failed');
    }
  });

  await test('POST /api/reviews/rev-1/comments -> post community comment', async () => {
    const res = await fetchUrl(`${BASE_URL}/api/reviews/rev-1/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { farmerName: 'సుబ్బారావు', comment: 'మంచి సలహా అన్నా!' },
    });
    if (res.status !== 201 || !res.json?.comment?.comment) {
      throw new Error('Comment failed');
    }
  });

  await test('GET /api/markets -> list AP mandis and Rythu Bharosa Kendras', async () => {
    const res = await fetchUrl(`${BASE_URL}/api/markets`);
    if (res.status !== 200 || !res.json?.markets?.length) {
      throw new Error('Markets missing');
    }
  });

  await test('GET /api/market-prices -> applies commodity, district, market, variety, grade and pagination filters', async () => {
    const base = await fetchUrl(
      `${BASE_URL}/api/market-prices?limit=10&offset=0`
    );
    if (
      base.status !== 200 ||
      base.json?.unavailable ||
      !base.json?.records?.length
    )
      return;

    const sample = base.json.records[0];
    const filters = [
      ['commodity', sample.commodity, (record) => record.commodity],
      ['district', sample.district, (record) => record.district],
      ['market', sample.marketName, (record) => record.marketName],
      ['variety', sample.variety, (record) => record.variety],
      ['grade', sample.grade, (record) => record.grade],
    ].filter(([, value]) => value);

    for (const [filter, value, getValue] of filters) {
      const params = new URLSearchParams({ [filter]: value, limit: '10' });
      const response = await fetchUrl(
        `${BASE_URL}/api/market-prices?${params.toString()}`
      );
      if (response.status !== 200)
        throw new Error(`${filter} filter returned HTTP ${response.status}`);
      if (
        response.json.records.some(
          (record) => getValue(record)?.toLowerCase() !== value.toLowerCase()
        )
      ) {
        throw new Error(`${filter} filter returned a non-matching record`);
      }
    }

    for (const offset of [0, 1]) {
      const response = await fetchUrl(
        `${BASE_URL}/api/market-prices?limit=1&offset=${offset}`
      );
      if (response.status !== 200)
        throw new Error(`Pagination returned HTTP ${response.status}`);
      if (
        response.json.pagination?.limit !== 1 ||
        response.json.pagination?.offset !== offset
      ) {
        throw new Error('Pagination metadata does not match the request');
      }
      if (response.json.records.length > 1)
        throw new Error('Pagination returned more than one record');
    }
  });

  await test('GET /api/msp -> official Government Minimum Support Prices (MSP)', async () => {
    const res = await fetchUrl(`${BASE_URL}/api/msp`);
    if (res.status !== 200 || !res.json?.mspRates?.length) {
      throw new Error('MSP rates missing');
    }
  });

  await test('POST /api/markets/estimate -> net selling revenue calculator', async () => {
    const res = await fetchUrl(`${BASE_URL}/api/markets/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { quantity: 100, pricePerQuintal: 2350, transportPerQuintal: 50 },
    });
    if (
      res.status !== 200 ||
      res.json?.estimate?.netEstimatedIncome !== 230000
    ) {
      throw new Error(
        `Calculation mismatch: ${JSON.stringify(res.json?.estimate)}`
      );
    }
  });

  await test('GET /api/farm -> retrieve farm profile and crops', async () => {
    const res = await fetchUrl(`${BASE_URL}/api/farm`);
    if (res.status !== 200 || !res.json?.farmProfile?.location) {
      throw new Error('Farm profile missing');
    }
  });

  await test('POST & DELETE /api/farm/crops -> add and delete crop from tracker', async () => {
    const addRes = await fetchUrl(`${BASE_URL}/api/farm/crops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        cropName: 'Maize (మొక్కజొన్న)',
        sowingDate: '2026-09-01',
        growthStage: 'fruiting',
      },
    });
    if (addRes.status !== 201 || !addRes.json?.crop?.id) {
      throw new Error('Add crop failed');
    }
    const cropId = addRes.json.crop.id;
    const delRes = await fetchUrl(`${BASE_URL}/api/farm/crops/${cropId}`, {
      method: 'DELETE',
    });
    if (delRes.status !== 200) {
      throw new Error('Delete crop failed');
    }
  });

  await test('PUT /api/profile/language -> switch language to English and Telugu', async () => {
    const enRes = await fetchUrl(`${BASE_URL}/api/profile/language`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: { language: 'en' },
    });
    if (enRes.status !== 200 || enRes.json?.preferredLanguage !== 'en') {
      throw new Error('Failed to set English');
    }

    const teRes = await fetchUrl(`${BASE_URL}/api/profile/language`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: { language: 'te' },
    });
    if (teRes.status !== 200 || teRes.json?.preferredLanguage !== 'te') {
      throw new Error('Failed to restore Telugu');
    }
  });

  await test('GET /api/notifications -> fetch farmer notifications', async () => {
    const res = await fetchUrl(`${BASE_URL}/api/notifications`);
    if (res.status !== 200 || !Array.isArray(res.json?.notifications)) {
      throw new Error('Notifications missing');
    }
  });

  console.log('\n======================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================\n');

  server.kill();
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
