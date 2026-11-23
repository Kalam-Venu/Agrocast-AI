export const MAX_STATEWIDE_PRICE_REQUESTS = 26;
export const STATEWIDE_PRICE_CONCURRENCY = 4;

const PRIORITY_COMMODITIES = [
  'Rice',
  'Groundnut',
  'Cotton',
  'Maize',
  'Green Chilli',
  'Dry Chillies',
  'Red gram/Arhar/Tur(whole)',
  'Turmeric(raw)',
];

export function normalizeOfficialFilter(value) {
  return String(value || '')
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('en');
}

export class TtlCache {
  constructor(ttlMs, maxEntries = 100, now = Date.now) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
    this.now = now;
    this.entries = new Map();
    this.pendingLoads = new Map();
  }

  get(key) {
    const entry = this.entries.get(key);
    if (!entry) return null;
    if (this.now() - entry.cachedAt > this.ttlMs) {
      this.entries.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value) {
    this.entries.delete(key);
    this.entries.set(key, { value, cachedAt: this.now() });
    if (this.entries.size > this.maxEntries) {
      this.entries.delete(this.entries.keys().next().value);
    }
  }

  async getOrLoad(key, loader, pendingKey = key) {
    const cached = this.get(key);
    if (cached !== null) return cached;

    const pending = this.pendingLoads.get(pendingKey);
    if (pending) return pending;

    const load = Promise.resolve().then(loader);
    this.pendingLoads.set(pendingKey, load);
    try {
      const value = await load;
      this.set(key, value);
      return value;
    } finally {
      if (this.pendingLoads.get(pendingKey) === load) {
        this.pendingLoads.delete(pendingKey);
      }
    }
  }
}

function findUniqueByName(items, name, key) {
  const normalizedName = normalizeOfficialFilter(name);
  const matches = items.filter(
    (item) => normalizeOfficialFilter(item[key]) === normalizedName
  );
  return matches.length === 1 ? matches[0] : null;
}

export function buildStatewideCandidates(
  filterData,
  filters,
  rotation = 0,
  maxRequests = MAX_STATEWIDE_PRICE_REQUESTS
) {
  const state = findUniqueByName(
    filterData.state_data,
    filters.state,
    'state_name'
  );
  if (!state) return { candidates: [], reason: 'state_not_found' };

  const districtMatches = filters.district
    ? filterData.district_data.filter(
        (item) =>
          Number(item.state_id) === Number(state.state_id) &&
          normalizeOfficialFilter(item.district_name) ===
            normalizeOfficialFilter(filters.district)
      )
    : [];
  if (filters.district && districtMatches.length !== 1) {
    return { candidates: [], reason: 'district_not_found' };
  }

  let markets = filterData.market_data.filter(
    (item) =>
      Number(item.state_id) === Number(state.state_id) &&
      (!filters.district ||
        Number(item.district_id) === Number(districtMatches[0].id))
  );
  if (filters.market) {
    const matchingMarkets = markets.filter(
      (item) =>
        normalizeOfficialFilter(item.mkt_name) ===
        normalizeOfficialFilter(filters.market)
    );
    if (matchingMarkets.length !== 1) {
      return {
        candidates: [],
        reason:
          matchingMarkets.length > 1
            ? 'market_ambiguous'
            : 'market_not_found',
      };
    }
    markets = matchingMarkets;
  }
  if (!markets.length) return { candidates: [], reason: 'markets_not_found' };

  let commodities;
  if (filters.commodity) {
    const commodity = findUniqueByName(
      filterData.cmdt_data,
      filters.commodity,
      'cmdt_name'
    );
    if (!commodity) {
      return { candidates: [], reason: 'commodity_not_found' };
    }
    commodities = [commodity];
  } else {
    commodities = PRIORITY_COMMODITIES.map((name) =>
      findUniqueByName(filterData.cmdt_data, name, 'cmdt_name')
    ).filter(Boolean);
    if (!commodities.length) {
      return { candidates: [], reason: 'commodities_not_found' };
    }
  }

  const limit = Math.max(0, Math.min(maxRequests, MAX_STATEWIDE_PRICE_REQUESTS));
  const candidates = [];
  const addPair = (market, commodity) => {
    if (
      candidates.length < limit &&
      !candidates.some(
        (candidate) =>
          Number(candidate.market.id) === Number(market.id) &&
          Number(candidate.commodity.cmdt_id) === Number(commodity.cmdt_id)
      )
    ) {
      candidates.push({ state, market, commodity });
    }
  };

  if (filters.market) {
    for (let index = 0; index < commodities.length; index += 1) {
      addPair(
        markets[0],
        commodities[(index + rotation) % commodities.length]
      );
    }
  } else if (filters.district) {
    const orderedMarkets = markets
      .slice()
      .sort((a, b) => Number(a.id) - Number(b.id));
    const start = rotation % orderedMarkets.length;
    for (let index = 0; index < orderedMarkets.length && candidates.length < limit; index += 1) {
      addPair(
        orderedMarkets[(start + index) % orderedMarkets.length],
        commodities[(index + rotation) % commodities.length]
      );
    }
  } else {
    const marketsByDistrict = new Map();
    for (const market of markets) {
      const districtMarkets = marketsByDistrict.get(market.district_id) || [];
      districtMarkets.push(market);
      marketsByDistrict.set(market.district_id, districtMarkets);
    }
    const districtIds = [...marketsByDistrict.keys()].sort(
      (a, b) => Number(a) - Number(b)
    );
    const start = rotation % districtIds.length;
    for (
      let index = 0;
      index < districtIds.length && candidates.length < limit;
      index += 1
    ) {
      const districtIndex = (start + index) % districtIds.length;
      const districtMarkets = marketsByDistrict
        .get(districtIds[districtIndex])
        .slice()
        .sort((a, b) => Number(a.id) - Number(b.id));
      const market = districtMarkets[
        (rotation + districtIndex) % districtMarkets.length
      ];
      const commodity =
        commodities[(districtIndex + rotation) % commodities.length];
      addPair(market, commodity);
    }
  }

  return {
    candidates,
    reason: candidates.length ? null : 'no_candidates',
    partial: true,
  };
}

export async function collectCandidateRecords(
  candidates,
  fetchRecords,
  concurrency = STATEWIDE_PRICE_CONCURRENCY,
  { signal } = {}
) {
  const results = [];
  const failures = [];
  let nextIndex = 0;
  let attempted = 0;
  const workerCount = Math.min(
    Math.max(1, concurrency),
    candidates.length
  );

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (nextIndex < candidates.length && !signal?.aborted) {
        const index = nextIndex;
        nextIndex += 1;
        attempted += 1;
        const candidate = candidates[index];
        try {
          const records = await fetchRecords(candidate);
          if (Array.isArray(records)) results.push(...records);
        } catch (error) {
          failures.push({ candidate, error });
        }
      }
    })
  );

  return { records: results, failures, attempted };
}

export function deduplicateAndSortRecords(records) {
  const unique = new Map();
  for (const record of records) {
    const key = [
      record.state,
      record.district,
      record.marketName,
      record.commodity,
      record.variety,
      record.grade,
      record.arrivalDate,
    ]
      .map(normalizeOfficialFilter)
      .join('|');
    if (!unique.has(key)) unique.set(key, record);
  }

  return [...unique.values()].sort(
    (a, b) =>
      b.arrivalDate.localeCompare(a.arrivalDate) ||
      a.district.localeCompare(b.district) ||
      a.marketName.localeCompare(b.marketName) ||
      a.commodity.localeCompare(b.commodity) ||
      String(a.variety || '').localeCompare(String(b.variety || ''))
  );
}

export function paginateRecords(records, limit, offset) {
  return records.slice(offset, offset + limit);
}

export function summarizeStatewideCollection(
  collected,
  candidateCount,
  fetchedAt = new Date().toISOString()
) {
  const records = deduplicateAndSortRecords(collected.records);
  const failedCombinations = collected.failures.length;
  const attemptedCombinations = collected.attempted;
  const unattemptedCombinations = Math.max(
    0,
    candidateCount - attemptedCombinations
  );
  let reason;

  if (!records.length) {
    reason =
      failedCombinations || unattemptedCombinations
        ? `No genuine AGMARKNET 2.0 prices were retrieved. ${failedCombinations} of ${attemptedCombinations} attempted market/commodity checks failed; ${unattemptedCombinations} of ${candidateCount} selected checks were not attempted.`
        : `No current AGMARKNET 2.0 prices were returned from ${attemptedCombinations} official market/commodity checks.`;
  } else if (failedCombinations || unattemptedCombinations) {
    reason = `Showing genuine prices from a bounded statewide sample; ${failedCombinations} of ${attemptedCombinations} attempted checks failed and ${unattemptedCombinations} of ${candidateCount} selected checks were not attempted. Results are incomplete.`;
  } else {
    reason =
      'Showing genuine prices from a bounded statewide sample of official markets and major commodities; this is not a complete statewide listing.';
  }

  return {
    records,
    reason,
    unavailable: records.length === 0,
    checkedCombinations: candidateCount,
    attemptedCombinations,
    failedCombinations,
    fetchedAt,
  };
}

export function buildStatewideResponse(
  snapshot,
  { limit, offset, cached, latestArrivalDate, source, sourceUrl }
) {
  const records = paginateRecords(snapshot.records, limit, offset);
  const hasRecords = snapshot.records.length > 0;
  return {
    status:
      !hasRecords && snapshot.failedCombinations > 0 ? 503 : 200,
    body: {
      unavailable: !hasRecords,
      dataStatus: hasRecords ? (cached ? 'cached' : 'live') : 'unavailable',
      records,
      count: records.length,
      source,
      sourceUrl,
      fetchedAt: snapshot.fetchedAt,
      isCached: cached,
      latestArrivalDate,
      partial: true,
      reason: snapshot.reason,
      checkedCombinations: snapshot.checkedCombinations,
      failedCombinations: snapshot.failedCombinations,
      attemptedCombinations: snapshot.attemptedCombinations,
      pagination: {
        limit,
        offset,
        total: snapshot.records.length,
        hasMore: offset + records.length < snapshot.records.length,
      },
    },
  };
}
