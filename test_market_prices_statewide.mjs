import assert from 'node:assert/strict';
import {
  buildStatewideCandidates,
  collectCandidateRecords,
  deduplicateAndSortRecords,
  paginateRecords,
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
  console.log('PASS bounded concurrent collection preserves successes after partial failure');

  let now = 100;
  const cache = new TtlCache(50, 2, () => now);
  const cachedValue = { records: [record('2026-11-20', 'Market A')] };
  cache.set('statewide', cachedValue);
  assert.equal(cache.get('statewide'), cachedValue);
  now = 151;
  assert.equal(cache.get('statewide'), null);
  console.log('PASS statewide result cache expires at its TTL');

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
