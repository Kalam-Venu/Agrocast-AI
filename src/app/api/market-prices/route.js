import { NextResponse } from 'next/server';
import {
  buildStatewideResponse,
  buildStatewideCandidates,
  collectCandidateRecords,
  normalizeOfficialFilter,
  STATEWIDE_PRICE_CONCURRENCY,
  summarizeStatewideCollection,
  TtlCache,
} from '../../../lib/market/agmarknetV2.mjs';

const AGMARKNET_V2_BASE_URL = 'https://api.agmarknet.gov.in/v1';
const V2_SOURCE =
  'AGMARKNET 2.0 / Ministry of Agriculture & Farmers Welfare, Government of India';
const SOURCE_URL = 'https://agmarknet.gov.in';
const CACHE_TTL_MS = 30 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;
const UPSTREAM_TIMEOUT_MS = 12000;
const STATEWIDE_TIMEOUT_MS = 4000;
const STATEWIDE_FILTER_TIMEOUT_MS = 4000;
const FILTER_CACHE_TTL_MS = 60 * 60 * 1000;
const ACCEPTED_V2_PRICE_UNITS = new Set([
  '₹/quintal',
  'rs./quintal',
  'inr/quintal',
]);
const responseCache = new Map();
const statewideResponseCache = new TtlCache(CACHE_TTL_MS, MAX_CACHE_ENTRIES);
const agmarknetV2FiltersCache = new TtlCache(FILTER_CACHE_TTL_MS, 1);

function cleanNumber(value) {
  if (value == null || value === '') return null;
  const number = Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(number) ? number : null;
}

function matchesFilters(record, filters) {
  const matches = (value, filter) =>
    !filter ||
    normalizeOfficialFilter(value) === normalizeOfficialFilter(filter);
  return (
    matches(record.district, filters.district) &&
    matches(record.marketName, filters.market) &&
    matches(record.commodity, filters.commodity) &&
    matches(record.variety, filters.variety) &&
    matches(record.grade, filters.grade)
  );
}

function getLatestArrivalDate(records) {
  const dateValue = (value) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const isoDate = Date.parse(value);
      return Number.isFinite(isoDate) ? isoDate : null;
    }
    const parts = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (parts) return Date.UTC(Number(parts[3]), Number(parts[2]) - 1, Number(parts[1]));
    const parsedDate = Date.parse(value);
    return Number.isFinite(parsedDate) ? parsedDate : null;
  };

  return records.reduce((latest, record) => {
    const currentValue = dateValue(record.arrivalDate);
    const latestValue = latest ? dateValue(latest) : null;
    return currentValue != null && (latestValue == null || currentValue > latestValue)
      ? record.arrivalDate
      : latest;
  }, null);
}

function getCachedResponse(cacheKey) {
  const cached = responseCache.get(cacheKey);
  if (!cached) return null;
  if (Date.now() - cached.cachedAt > CACHE_TTL_MS) {
    responseCache.delete(cacheKey);
    return null;
  }
  return cached;
}

function cacheResponse(cacheKey, payload) {
  responseCache.delete(cacheKey);
  responseCache.set(cacheKey, { payload, cachedAt: Date.now() });
  if (responseCache.size > MAX_CACHE_ENTRIES) {
    responseCache.delete(responseCache.keys().next().value);
  }
}

function unavailableResponse(
  reason,
  status = 503,
  cached = null,
  source = V2_SOURCE
) {
  if (cached) {
    return NextResponse.json({
      ...cached.payload,
      dataStatus: 'cached',
      isCached: true,
      stale: true,
      reason,
    });
  }
  return NextResponse.json(
    {
      unavailable: true,
      dataStatus: 'unavailable',
      reason,
      records: [],
      count: 0,
      source,
      sourceUrl: SOURCE_URL,
    },
    { status }
  );
}

function sanitizeErrorMessage(message, apiKey) {
  if (typeof message !== 'string') return null;

  const keys = [apiKey, encodeURIComponent(apiKey)].filter(Boolean);
  let sanitized = message;
  for (const key of keys) {
    sanitized = sanitized.replaceAll(key, '[REDACTED]');
  }

  return sanitized
    .replace(/https?:\/\/[^\s"'<>?]+(?:\?[^\s"'<>]*)?/gi, (url) => {
      const queryIndex = url.indexOf('?');
      return queryIndex === -1
        ? url
        : `${url.slice(0, queryIndex)}?[REDACTED]`;
    })
    .replace(/AIza[0-9A-Za-z_-]{20,}/g, '[REDACTED]')
    .replace(
      /\b(api[-_]?key|authorization|token|password)(\s*[=:]\s*)[^\s,;]+/gi,
      '$1$2[REDACTED]'
    )
    .slice(0, 300);
}

function getFetchErrorDiagnostics(error, apiKey) {
  const causes = [];
  let cause = error?.cause;
  while (cause && causes.length < 3) {
    causes.push(cause);
    cause = cause.cause;
  }

  const normalizedCodes = [error?.code, ...causes.map((item) => item?.code)]
    .filter(Boolean)
    .map((code) => String(code).toUpperCase());
  const causeMessages = causes.map((item) => item?.message || '').join(' ');
  const normalizedMessages = `${causeMessages} ${error?.message || ''}`.toUpperCase();
  let failureType = 'network';

  if (
    [error?.name, ...causes.map((item) => item?.name)].some((name) =>
      ['TimeoutError', 'AbortError'].includes(name)
    ) ||
    normalizedCodes.some(
      (code) => code.includes('TIMEOUT') || code === 'ETIMEDOUT'
    )
  ) {
    failureType = 'timeout';
  } else if (
    normalizedCodes.some((code) =>
      ['ENOTFOUND', 'EAI_AGAIN', 'EAI_FAIL', 'ENODATA'].includes(code)
    )
  ) {
    failureType = 'dns';
  } else if (
    normalizedCodes.some(
      (code) =>
        code.includes('CERT') ||
        code.includes('TLS') ||
        code.includes('SSL') ||
        code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE'
    ) ||
    /CERTIFICATE|TLS|SSL/.test(normalizedMessages)
  ) {
    failureType = 'tls';
  } else if (normalizedCodes.includes('ECONNRESET')) {
    failureType = 'connection_reset';
  } else if (normalizedCodes.includes('ECONNREFUSED')) {
    failureType = 'connection_refused';
  }

  return {
    name: error?.name || 'UnknownError',
    code: error?.code || null,
    failureType,
    causeName: causes[0]?.name || null,
    causeCode: causes[0]?.code || null,
    causeMessage: sanitizeErrorMessage(causes[0]?.message, apiKey),
  };
}

async function getAgmarknetV2Filters(timeoutMs = UPSTREAM_TIMEOUT_MS) {
  return agmarknetV2FiltersCache.getOrLoad(
    'official-filters',
    async () => {
      const response = await fetch(
        `${AGMARKNET_V2_BASE_URL}/daily-price-arrival/filters`,
        {
          headers: {
            Accept: 'application/json, text/plain, */*',
            Origin: 'https://agmarknet.gov.in',
            Referer: 'https://agmarknet.gov.in/',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          },
          next: { revalidate: FILTER_CACHE_TTL_MS / 1000 },
          signal: AbortSignal.timeout(timeoutMs),
        }
      );
      if (!response.ok) {
        const error = new Error('AGMARKNET 2.0 filter request failed.');
        error.httpStatus = response.status;
        throw error;
      }

      const payload = await response.json();
      const data = payload?.data;
      if (
        payload?.status !== true ||
        !Array.isArray(data?.state_data) ||
        !Array.isArray(data?.district_data) ||
        !Array.isArray(data?.market_data) ||
        !Array.isArray(data?.cmdt_data)
      ) {
        throw new Error('AGMARKNET 2.0 returned invalid market filters.');
      }
      return data;
    },
    `official-filters:${timeoutMs}`
  );
}

function getAgmarknetV2Records(payload, filters, market, district, commodity) {
  if (payload?.success !== true || !Array.isArray(payload.data)) return [];

  const records = [];
  for (const item of payload.data) {
    if (!item || typeof item.variety !== 'string') continue;
    const varietyPrefix = `${market.mkt_name} - `;
    const variety = item.variety.startsWith(varietyPrefix)
      ? item.variety.slice(varietyPrefix.length).trim()
      : item.variety.trim();
    const unit = String(item.unitOfPrice || '')
      .normalize('NFKC')
      .trim()
      .toLocaleLowerCase('en')
      .replace(/\s+/g, '');
    if (!ACCEPTED_V2_PRICE_UNITS.has(unit)) {
      continue;
    }

    for (const [arrivalDate, value] of Object.entries(item)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(arrivalDate)) continue;
      const modalPrice = cleanNumber(value);
      if (modalPrice == null || modalPrice <= 0) continue;

      const record = {
        commodity: commodity.cmdt_name,
        variety: variety || null,
        grade: null,
        marketName: market.mkt_name,
        district: district.district_name,
        state: filters.state_name || filters.state,
        arrivalDate,
        minPrice: null,
        maxPrice: null,
        modalPrice,
        unit: '₹ / Quintal',
        source: V2_SOURCE,
        sourceUrl: SOURCE_URL,
      };
      if (matchesFilters(record, filters)) records.push(record);
    }
  }
  return records.sort((a, b) => b.arrivalDate.localeCompare(a.arrivalDate));
}

async function getSpecificAgmarknetV2Prices(
  filters,
  limit,
  offset,
  cacheKey
) {
  let upstreamStatus = null;
  try {
    const filterData = await getAgmarknetV2Filters();
    const state = filterData.state_data.find(
      (item) =>
        normalizeOfficialFilter(item.state_name) ===
        normalizeOfficialFilter(filters.state)
    );
    const matchingDistricts = filterData.district_data.filter(
      (item) =>
        Number(item.state_id) === Number(state?.state_id) &&
        normalizeOfficialFilter(item.district_name) ===
          normalizeOfficialFilter(filters.district)
    );
    const matchingMarkets = filterData.market_data.filter(
      (item) =>
        Number(item.state_id) === Number(state?.state_id) &&
        normalizeOfficialFilter(item.mkt_name) ===
          normalizeOfficialFilter(filters.market) &&
        (!filters.district ||
          matchingDistricts.some(
            (district) => Number(district.id) === Number(item.district_id)
          ))
    );
    const matchingCommodities = filterData.cmdt_data.filter(
      (item) =>
        normalizeOfficialFilter(item.cmdt_name) ===
        normalizeOfficialFilter(filters.commodity)
    );
    const market = matchingMarkets.length === 1 ? matchingMarkets[0] : null;
    const district = filterData.district_data.find(
      (item) =>
        Number(item.id) === Number(market?.district_id) &&
        Number(item.state_id) === Number(state?.state_id)
    );
    const commodity =
      matchingCommodities.length === 1 ? matchingCommodities[0] : null;

    if (!state || !market || !commodity || !district) {
      return NextResponse.json({
        unavailable: true,
        dataStatus: 'unavailable',
        reason:
          matchingMarkets.length > 1 && !filters.district
            ? 'Multiple AGMARKNET 2.0 markets have this name; specify a district.'
            : 'No unique matching AGMARKNET 2.0 market or commodity was found.',
        records: [],
        count: 0,
        source: V2_SOURCE,
        sourceUrl: SOURCE_URL,
        pagination: { limit, offset, total: 0, hasMore: false },
      });
    }

    const params = new URLSearchParams({
      marketId: String(market.id),
      stateId: String(state.state_id),
      commodityId: String(commodity.cmdt_id),
      includeExcel: 'false',
    });
    const response = await fetch(
      `${AGMARKNET_V2_BASE_URL}/prices-and-arrivals/market-price/lastweek?${params}`,
      {
        headers: {
          Accept: 'application/json, text/plain, */*',
          Origin: 'https://agmarknet.gov.in',
          Referer: 'https://agmarknet.gov.in/',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        },
        next: { revalidate: CACHE_TTL_MS / 1000 },
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      }
    );
    upstreamStatus = response.status;
    if (!response.ok) {
      console.warn('AGMARKNET 2.0 market request returned an error.', {
        failureType: 'http',
        httpStatus: response.status,
      });
      return unavailableResponse(
        `AGMARKNET 2.0 returned HTTP ${response.status}.`,
        response.status === 429 ? 429 : 502,
        getCachedResponse(cacheKey)
      );
    }

    const payload = await response.json();
    const allRecords = getAgmarknetV2Records(
      payload,
      filters,
      market,
      district,
      commodity
    );
    const records = allRecords.slice(offset, offset + limit);
    if (records.length === 0) {
      return NextResponse.json({
        unavailable: true,
        dataStatus: 'unavailable',
        reason: 'No recent AGMARKNET 2.0 prices matched these filters.',
        records: [],
        count: 0,
        source: V2_SOURCE,
        sourceUrl: SOURCE_URL,
        fetchedAt: new Date().toISOString(),
        pagination: {
          limit,
          offset,
          total: allRecords.length,
          hasMore: false,
        },
      });
    }

    const result = {
      unavailable: false,
      dataStatus: 'live',
      records,
      count: records.length,
      source: V2_SOURCE,
      sourceUrl: SOURCE_URL,
      fetchedAt: new Date().toISOString(),
      isCached: false,
      latestArrivalDate: allRecords[0].arrivalDate,
      pagination: {
        limit,
        offset,
        total: allRecords.length,
        hasMore: offset + records.length < allRecords.length,
      },
    };
    cacheResponse(cacheKey, result);
    return NextResponse.json(result);
  } catch (error) {
    const diagnostics = getFetchErrorDiagnostics(error, '');
    if (error?.httpStatus) {
      diagnostics.failureType = 'http';
      diagnostics.httpStatus = error.httpStatus;
    }
    console.warn('AGMARKNET 2.0 market request failed.', diagnostics);
    return unavailableResponse(
      diagnostics.failureType === 'timeout'
        ? 'AGMARKNET 2.0 data source timed out.'
        : 'Could not connect to the AGMARKNET 2.0 data source.',
      (upstreamStatus || error?.httpStatus) === 429 ? 429 : 502,
      getCachedResponse(cacheKey)
    );
  }
}

function formatStatewideResponse(snapshot, filters, limit, offset, cached) {
  const { status, body } = buildStatewideResponse(snapshot, {
    limit,
    offset,
    cached,
    latestArrivalDate: getLatestArrivalDate(snapshot.records),
    source: V2_SOURCE,
    sourceUrl: SOURCE_URL,
  });
  return NextResponse.json(body, { status });
}

async function getStatewideAgmarknetV2Prices(filters, limit, offset) {
  const rotation = Math.floor(Date.now() / CACHE_TTL_MS);
  const cacheKey = JSON.stringify({ ...filters, rotation });
  const cachedSnapshot = statewideResponseCache.get(cacheKey);
  if (cachedSnapshot) {
    return formatStatewideResponse(
      cachedSnapshot,
      filters,
      limit,
      offset,
      true
    );
  }

  let filterData;
  try {
    filterData = await getAgmarknetV2Filters(STATEWIDE_FILTER_TIMEOUT_MS);
  } catch (error) {
    const diagnostics = getFetchErrorDiagnostics(error, '');
    if (error?.httpStatus) {
      diagnostics.failureType = 'http';
      diagnostics.httpStatus = error.httpStatus;
    }
    console.warn('AGMARKNET 2.0 statewide filters failed.', diagnostics);
    if (diagnostics.failureType === 'timeout') {
      console.warn('AGMARKNET 2.0 filter timeout was locally configured.', {
        timeoutMs: STATEWIDE_FILTER_TIMEOUT_MS,
      });
    }
    return unavailableResponse(
      diagnostics.failureType === 'timeout'
        ? 'AGMARKNET 2.0 filter data timed out.'
        : 'Could not load official AGMARKNET 2.0 market filters.',
      error?.httpStatus === 429 ? 429 : 502,
      null,
      V2_SOURCE
    );
  }

  const selection = buildStatewideCandidates(
    filterData,
    filters,
    rotation
  );
  if (!selection.candidates.length) {
    const reason =
      selection.reason === 'market_ambiguous'
        ? 'Multiple official markets have this name. Select its district and retry.'
        : 'No official market and commodity combinations matched these filters.';
    return NextResponse.json({
      unavailable: true,
      dataStatus: 'unavailable',
      records: [],
      count: 0,
      source: V2_SOURCE,
      sourceUrl: SOURCE_URL,
      reason,
      partial: true,
      checkedCombinations: 0,
      failedCombinations: 0,
      pagination: { limit, offset, total: 0, hasMore: false },
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    STATEWIDE_TIMEOUT_MS
  );
  let collected;
  try {
    collected = await collectCandidateRecords(
      selection.candidates,
      async ({ state, market, commodity }) => {
        const district = filterData.district_data.find(
          (item) =>
            Number(item.id) === Number(market.district_id) &&
            Number(item.state_id) === Number(state.state_id)
        );
        if (!district) throw new Error('Official market district is missing.');

        const params = new URLSearchParams({
          marketId: String(market.id),
          stateId: String(state.state_id),
          commodityId: String(commodity.cmdt_id),
          includeExcel: 'false',
        });
        const response = await fetch(
          `${AGMARKNET_V2_BASE_URL}/prices-and-arrivals/market-price/lastweek?${params}`,
          {
            headers: {
              Accept: 'application/json, text/plain, */*',
              Origin: 'https://agmarknet.gov.in',
              Referer: 'https://agmarknet.gov.in/',
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            },
            next: { revalidate: CACHE_TTL_MS / 1000 },
            signal: AbortSignal.any([
              controller.signal,
              AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
            ]),
          }
        );
        if (!response.ok) {
          const error = new Error(
            'AGMARKNET 2.0 weekly-price request failed.'
          );
          error.httpStatus = response.status;
          throw error;
        }

        const payload = await response.json();
        if (payload?.success !== true || !Array.isArray(payload.data)) {
          throw new Error('AGMARKNET 2.0 returned an invalid price report.');
        }
        return getAgmarknetV2Records(
          payload,
          filters,
          market,
          district,
          commodity
        );
      },
      STATEWIDE_PRICE_CONCURRENCY,
      { signal: controller.signal }
    );
  } finally {
    clearTimeout(timeout);
  }

  const snapshot = summarizeStatewideCollection(
    collected,
    selection.candidates.length
  );
  const { failedCombinations } = snapshot;

  if (failedCombinations) {
    const failuresByType = {};
    for (const { error } of collected.failures) {
      const diagnostics = getFetchErrorDiagnostics(error, '');
      const failureType = error?.httpStatus ? 'http' : diagnostics.failureType;
      failuresByType[failureType] = (failuresByType[failureType] || 0) + 1;
    }
    console.warn('AGMARKNET 2.0 statewide results are partial.', {
      checkedCombinations: selection.candidates.length,
      failedCombinations,
      failuresByType,
    });
  }

  if (snapshot.records.length) {
    statewideResponseCache.set(cacheKey, snapshot);
  }
  return formatStatewideResponse(snapshot, filters, limit, offset, false);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      state: searchParams.get('state')?.trim() || 'Andhra Pradesh',
      district: searchParams.get('district')?.trim() || '',
      market: searchParams.get('market')?.trim() || '',
      commodity: (searchParams.get('commodity') || searchParams.get('crop') || '').trim(),
      variety: searchParams.get('variety')?.trim() || '',
      grade: searchParams.get('grade')?.trim() || '',
    };
    if (filters.state.toLowerCase() !== 'andhra pradesh') {
      return NextResponse.json({ error: 'Only Andhra Pradesh market records are supported' }, { status: 400 });
    }
    const rawLimit = searchParams.get('limit');
    const rawOffset = searchParams.get('offset');
    const limit = rawLimit == null ? 20 : Number(rawLimit);
    const offset = rawOffset == null ? 0 : Number(rawOffset);

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return NextResponse.json({ error: 'limit must be an integer between 1 and 100' }, { status: 400 });
    }
    if (!Number.isInteger(offset) || offset < 0) {
      return NextResponse.json({ error: 'offset must be a non-negative integer' }, { status: 400 });
    }

    if (filters.grade) {
      return NextResponse.json({
        unavailable: true,
        dataStatus: 'unavailable',
        records: [],
        count: 0,
        source: V2_SOURCE,
        sourceUrl: SOURCE_URL,
        reason:
          'AGMARKNET 2.0 weekly market-price records do not include grade, so this filter cannot be verified.',
        partial: true,
        checkedCombinations: 0,
        failedCombinations: 0,
        pagination: { limit, offset, total: 0, hasMore: false },
      });
    }

    const cacheKey = JSON.stringify({ ...filters, limit, offset });
    if (filters.market && filters.commodity) {
      return getSpecificAgmarknetV2Prices(
        filters,
        limit,
        offset,
        cacheKey
      );
    }
    return getStatewideAgmarknetV2Prices(filters, limit, offset);
  } catch (error) {
    console.warn('AGMARKNET market route failed.', {
      name: error?.name || 'UnknownError',
      code: error?.code || null,
    });
    return unavailableResponse(
      'Could not connect to the AGMARKNET 2.0 data source.',
      502,
      null,
      V2_SOURCE
    );
  }
}
