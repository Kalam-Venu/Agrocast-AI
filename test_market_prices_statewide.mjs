import assert from 'node:assert/strict';
import {
  buildStatewideResponse,
  buildStatewideCandidates,
  collectCandidateRecords,
  deduplicateAndSortRecords,
  paginateRecords,
  summarizeStatewideCollection,
  MAX_STATEWIDE_PRICE_REQUESTS,
  STATEWIDE_PRICE_CONCURRENCY,
  TtlCache,
} from './src/lib/market/agmarknetV2.mjs';

const filterData = {
  state_data: [
    { state_id: 2, state_name: 'Andhra Pradesh' },
    { state_id: 3, state_name: 'Other State' },
  ],
  district_data: [
    { id: 10, state_id: 2, district_name: 'District One' },
    { id: 11, state_id: 2, district_name: 'District Two' },
    { id: 20, state_id: 3, district_name: 'District One' },
  ],
  market_data: [
    { id: 100, state_id: 2, district_id: 10, mkt_name: 'Market A' },
    { id: 101, state_id: 2, district_id: 10, mkt_name: 'Market B' },
    { id: 102, state_id: 2, district_id: 11, mkt_name: 'Market A' },
    { id: 200, state_id: 3, district_id: 20, mkt_name: 'Market A' },
  ],
  cmdt_data: [
    { cmdt_id: 3, cmdt_name: 'Rice' },
    { cmdt_id: 15, cmdt_name: 'Cotton' },
    { cmdt_id: 999, cmdt_name: 'Other Commodity' },
  ],
};

const rotationFilterData = {
  state_data: [{ state_id: 2, state_name: 'Andhra Pradesh' }],
  district_data: Array.from({ length: 28 }, (_, index) => ({
    id: 100 + index,
    state_id: 2,
    district_name: index === 6 ? 'Kurnool' : `District ${index + 1}`,
  })),
  market_data: Array.from({ length: 28 }, (_, index) => {
    const districtId = 100 + index;
    if (index === 6) {
      return [929, 930, 931, 932, 933, 934, 935].map((id) => ({
        id,
        state_id: 2,
        district_id: districtId,
        mkt_name: id === 931 ? 'Kurnool APMC' : `Kurnool Market ${id}`,
      }));
    }
    return [{
      id: 2000 + index,
      state_id: 2,
      district_id: districtId,
      mkt_name: `Market ${index + 1}`,
    }];
  }).flat(),
  cmdt_data: [
    { cmdt_id: 3, cmdt_name: 'Rice' },
    { cmdt_id: 10, cmdt_name: 'Groundnut' },
    { cmdt_id: 15, cmdt_name: 'Cotton' },
    { cmdt_id: 4, cmdt_name: 'Maize' },
    { cmdt_id: 73, cmdt_name: 'GreenChilli' },
    { cmdt_id: 113, cmdt_name: 'DryChillies' },
    { cmdt_id: 45, cmdt_name: 'Red Gram' },
    { cmdt_id: 260, cmdt_name: 'Turmeric' },
  ],
};

function record(arrivalDate, marketName, commodity = 'Rice', variety = 'Local') {
  return {
    state: 'Andhra Pradesh',
    district: 'District One',
    marketName,
    commodity,
    variety,
    grade: null,
    arrivalDate,
    modalPrice: 1000,
    unit: '₹ / Quintal',
  };
}

async function run() {
  assert.equal(MAX_STATEWIDE_PRICE_REQUESTS, 26);
  assert.equal(STATEWIDE_PRICE_CONCURRENCY, 4);
  const statewideAtRotation3 = buildStatewideCandidates(
    rotationFilterData,
    { state: 'Andhra Pradesh', district: '', market: '', commodity: '' },
    3,
    100
  );
  const statewideAtRotation4 = buildStatewideCandidates(
    rotationFilterData,
    { state: 'Andhra Pradesh', district: '', market: '', commodity: '' },
    4,
    100
  );
  assert.equal(statewideAtRotation3.candidates.length, 26);
  assert.equal(statewideAtRotation4.candidates.length, 26);
  const kurnoolAtRotation3 = statewideAtRotation3.candidates.find(
    ({ market }) => market.id === 931
  );
  const kurnoolAtRotation4 = statewideAtRotation4.candidates.find(
    ({ market }) => market.district_id === 106
  );
  assert.equal(kurnoolAtRotation3.market.mkt_name, 'Kurnool APMC');
  assert.equal(kurnoolAtRotation3.commodity.cmdt_name, 'Groundnut');
  assert.notEqual(kurnoolAtRotation3.market.id, kurnoolAtRotation4.market.id);
  assert.equal(
    new Set(
      statewideAtRotation3.candidates.map(
        ({ market, commodity }) => `${market.id}:${commodity.cmdt_id}`
      )
    ).size,
    statewideAtRotation3.candidates.length
  );
  console.log('PASS statewide rotations reach Kurnool APMC, vary official markets, and stay capped/deduplicated');

  const statewide = buildStatewideCandidates(
    filterData,
    {
      state: 'Andhra Pradesh',
      district: '',
      market: '',
      commodity: '',
    },
    0,
    2
  );
  assert.equal(statewide.candidates.length, 2);
  assert.equal(statewide.candidates.every((item) => item.state.state_id === 2), true);
  assert.equal(
    new Set(
      statewide.candidates.map(
        ({ market, commodity }) => `${market.id}:${commodity.cmdt_id}`
      )
    ).size,
    statewide.candidates.length
  );
  const statewideRecords = await collectCandidateRecords(
    statewide.candidates,
    async ({ market, commodity }) => [
      record('2026-11-20', market.mkt_name, commodity.cmdt_name),
    ],
    2
  );
  assert.equal(statewideRecords.records.length, 2);
  console.log('PASS statewide candidate sampling stays bounded and uses official AP IDs');

  const districtFilter = buildStatewideCandidates(filterData, {
    state: 'Andhra Pradesh',
    district: 'District One',
    market: '',
    commodity: 'Cotton',
  });
  assert.equal(districtFilter.candidates.length, 2);
  assert.equal(
    districtFilter.candidates.every(
      ({ market, commodity }) =>
        market.district_id === 10 && commodity.cmdt_id === 15
    ),
    true
  );
  const wrongState = buildStatewideCandidates(filterData, {
    state: 'Andhra Pradesh',
    district: '',
    market: 'Market A',
    commodity: '',
  });
  assert.equal(wrongState.candidates.length, 0);
  assert.equal(wrongState.reason, 'market_ambiguous');
  console.log('PASS district and ambiguous-market filters cannot cross state boundaries');

  let activeRequests = 0;
  let maxActiveRequests = 0;
  const collected = await collectCandidateRecords(
    [{ id: 1 }, { id: 2 }, { id: 3 }],
    async (candidate) => {
      activeRequests += 1;
      maxActiveRequests = Math.max(maxActiveRequests, activeRequests);
      await new Promise((resolve) => setTimeout(resolve, 2));
      activeRequests -= 1;
      if (candidate.id === 2) throw new Error('simulated upstream failure');
      return [record('2026-11-20', `Market ${candidate.id}`)];
    },
    2
  );
  assert.equal(maxActiveRequests, 2);
  assert.equal(collected.records.length, 2);
  assert.equal(collected.failures.length, 1);
  assert.equal(collected.attempted, 3);
  const partialSnapshot = summarizeStatewideCollection(
    collected,
    3,
    '2026-11-20T00:00:00.000Z'
  );
  assert.equal(partialSnapshot.unavailable, false);
  assert.equal(partialSnapshot.failedCombinations, 1);
  assert.match(partialSnapshot.reason, /Results are incomplete/);
  console.log('PASS bounded concurrent collection preserves successes after partial failure');

  const allFailed = await collectCandidateRecords(
    [{ id: 1 }, { id: 2 }],
    async () => {
      throw new Error('simulated upstream outage');
    },
    2
  );
  const unavailableSnapshot = summarizeStatewideCollection(
    allFailed,
    2,
    '2026-11-20T00:00:00.000Z'
  );
  assert.deepEqual(unavailableSnapshot.records, []);
  assert.equal(unavailableSnapshot.unavailable, true);
  assert.equal(unavailableSnapshot.failedCombinations, 2);
  assert.match(unavailableSnapshot.reason, /No genuine AGMARKNET 2\.0 prices/);
  assert.doesNotMatch(unavailableSnapshot.reason, /Showing genuine prices/);
  console.log('PASS all failed upstream checks produce an honest unavailable snapshot');

  const abortController = new AbortController();
  const stopped = await collectCandidateRecords(
    [{ id: 1 }, { id: 2 }, { id: 3 }],
    async () => {
      abortController.abort();
      throw new Error('simulated deadline');
    },
    1,
    { signal: abortController.signal }
  );
  assert.equal(stopped.attempted, 1);
  assert.equal(stopped.failures.length, 1);
  console.log('PASS collection stops scheduling requests after its deadline');

  let now = 100;
  const cache = new TtlCache(50, 2, () => now);
  const cachedValue = { records: [record('2026-11-20', 'Market A')] };
  cache.set('statewide', cachedValue);
  assert.equal(cache.get('statewide'), cachedValue);
  now = 151;
  assert.equal(cache.get('statewide'), null);
  console.log('PASS statewide result cache expires at its TTL');

  let filterLoads = 0;
  const filterCache = new TtlCache(50, 1, () => now);
  const loadFilters = () =>
    filterCache.getOrLoad('official-filters', async () => {
      filterLoads += 1;
      await new Promise((resolve) => setTimeout(resolve, 2));
      return filterData;
    });
  const concurrentFilters = await Promise.all([
    loadFilters(),
    loadFilters(),
    loadFilters(),
  ]);
  assert.equal(filterLoads, 1);
  assert.equal(concurrentFilters.every((item) => item === filterData), true);
  await loadFilters();
  assert.equal(filterLoads, 1);
  now += 51;
  await loadFilters();
  assert.equal(filterLoads, 2);
  console.log('PASS filter metadata loads are coalesced and cached until TTL expiry');

  const responseOptions = {
    limit: 20,
    offset: 0,
    cached: false,
    latestArrivalDate: null,
    source: 'AGMARKNET 2.0',
    sourceUrl: 'https://agmarknet.gov.in',
  };
  const failedResponse = buildStatewideResponse(
    unavailableSnapshot,
    responseOptions
  );
  assert.equal(failedResponse.status, 503);
  assert.equal(failedResponse.body.unavailable, true);
  assert.equal(failedResponse.body.dataStatus, 'unavailable');
  assert.equal(failedResponse.body.count, 0);
  assert.equal(failedResponse.body.failedCombinations, 2);
  console.log('PASS all failed price requests return HTTP 503 and unavailable body');

  const successfulEmpty = await collectCandidateRecords(
    [{ id: 1 }],
    async () => [],
    1
  );
  const emptySnapshot = summarizeStatewideCollection(
    successfulEmpty,
    1,
    '2026-11-20T00:00:00.000Z'
  );
  const emptyResponse = buildStatewideResponse(emptySnapshot, responseOptions);
  assert.equal(emptyResponse.status, 200);
  assert.equal(emptyResponse.body.unavailable, true);
  assert.equal(emptyResponse.body.dataStatus, 'unavailable');
  assert.equal(emptyResponse.body.count, 0);
  assert.equal(emptyResponse.body.failedCombinations, 0);
  console.log('PASS successful requests with no matching prices return HTTP 200');

  const partialResponse = buildStatewideResponse(
    partialSnapshot,
    { ...responseOptions, limit: 1 }
  );
  assert.equal(partialResponse.status, 200);
  assert.equal(partialResponse.body.unavailable, false);
  assert.equal(partialResponse.body.dataStatus, 'live');
  assert.equal(partialResponse.body.partial, true);
  assert.equal(partialResponse.body.records.length, 1);
  assert.equal(partialResponse.body.count, 1);
  assert.equal(partialResponse.body.failedCombinations, 1);
  console.log('PASS genuine partial results return HTTP 200 with records');

  const merged = deduplicateAndSortRecords([
    record('2026-11-19', 'Market A'),
    record('2026-11-20', 'Market B'),
    record('2026-11-19', 'Market A'),
  ]);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].arrivalDate, '2026-11-20');
  const firstPage = paginateRecords(merged, 1, 0);
  const secondPage = paginateRecords(merged, 1, 1);
  assert.equal(firstPage.length, 1);
  assert.equal(secondPage.length, 1);
  assert.notEqual(firstPage[0].marketName, secondPage[0].marketName);
  console.log('PASS statewide results are deduplicated, sorted, and paginated');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
