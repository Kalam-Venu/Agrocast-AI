import { NextResponse } from 'next/server';

const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const BASE_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;
const AGMARKNET_V2_BASE_URL = 'https://api.agmarknet.gov.in/v1';
const SOURCE =
  'AGMARKNET / Ministry of Agriculture & Farmers Welfare, Government of India';
const V2_SOURCE = 'AGMARKNET 2.0 / Ministry of Agriculture & Farmers Welfare, Government of India';
const SOURCE_URL = 'https://agmarknet.gov.in';
const CACHE_TTL_MS = 30 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;
const UPSTREAM_TIMEOUT_MS = 12000;
const ACCEPTED_V2_PRICE_UNITS = new Set([
  '₹/quintal',
  'rs./quintal',
  'inr/quintal',
]);
const responseCache = new Map();
let agmarknetV2FiltersCache = null;

function cleanNumber(value) {
  if (value == null || value === '') return null;
  const number = Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(number) ? number : null;
}

function firstDefined(record, names) {
  for (const name of names) {
    if (record[name] != null && record[name] !== '') return record[name];
  }
  return null;
}

function parseRecord(record) {
  const minPrice = cleanNumber(firstDefined(record, ['min_price', 'Min Price', 'Min_Price', 'minimum']));
  const maxPrice = cleanNumber(firstDefined(record, ['max_price', 'Max Price', 'Max_Price', 'maximum']));
  const modalPrice = cleanNumber(firstDefined(record, ['modal_price', 'Modal Price', 'Modal_Price', 'modal']));
  const arrivalDate = firstDefined(record, ['arrival_date', 'Arrival Date', 'arrivaldate', 'Arrival_Date']);
  const commodity = firstDefined(record, ['commodity', 'Commodity']);
  const variety = firstDefined(record, ['variety', 'Variety']);
  const grade = firstDefined(record, ['grade', 'Grade']);
  const marketName = firstDefined(record, ['market', 'Market', 'market_name', 'Market Name']);
  const district = firstDefined(record, ['district', 'District']);
  const state = firstDefined(record, ['state', 'State']);

  if (!commodity || !marketName || !district || modalPrice == null || !arrivalDate) return null;

  return {
    commodity: String(commodity).trim(),
    variety: variety ? String(variety).trim() : null,
    grade: grade ? String(grade).trim() : null,
    marketName: String(marketName).trim(),
    district: String(district).trim(),
    state: String(state).trim(),
    arrivalDate: String(arrivalDate).trim(),
    minPrice,
    maxPrice,
    modalPrice,
    unit: '₹ / Quintal',
    source: SOURCE,
    sourceUrl: SOURCE_URL,
  };
}

function matchesFilters(record, filters) {
  const matches = (value, filter) =>
    !filter || String(value || '').trim().toLowerCase() === filter.toLowerCase();
  return (
    matches(record.district, filters.district) &&
    matches(record.marketName, filters.market) &&
    matches(record.commodity, filters.commodity) &&
    matches(record.variety, filters.variety) &&
    matches(record.grade, filters.grade)
  );
}

function normalizeOfficialFilter(value) {
  return String(value || '')
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('en');
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

function unavailableResponse(reason, status = 503, cached = null) {
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
      source: SOURCE,
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

async function getAgmarknetV2Filters() {
  if (
    agmarknetV2FiltersCache &&
    Date.now() - agmarknetV2FiltersCache.cachedAt < CACHE_TTL_MS
  ) {
    return agmarknetV2FiltersCache.data;
  }

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
      cache: 'no-store',
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
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

  agmarknetV2FiltersCache = { data, cachedAt: Date.now() };
  return data;
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
        state: filters.state_name,
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
        cache: 'no-store',
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

    const cacheKey = JSON.stringify({ ...filters, limit, offset });
    if (filters.market && filters.commodity) {
      return getSpecificAgmarknetV2Prices(
        filters,
        limit,
        offset,
        cacheKey
      );
    }

    const cached = getCachedResponse(cacheKey);
    const apiKey = process.env.DATA_GOV_IN_API_KEY?.trim();
    if (!apiKey) {
      return unavailableResponse('DATA_GOV_IN_API_KEY is not configured.', 503, cached);
    }

    const params = new URLSearchParams({
      'api-key': apiKey,
      format: 'json',
      limit: String(limit),
      offset: String(offset),
    });
    params.set('filters[state]', filters.state);
    if (filters.district) params.set('filters[district]', filters.district);
    if (filters.market) params.set('filters[market]', filters.market);
    if (filters.commodity) params.set('filters[commodity]', filters.commodity);
    if (filters.variety) params.set('filters[variety]', filters.variety);
    if (filters.grade) params.set('filters[grade]', filters.grade);

    let response;
    try {
      response = await fetch(`${BASE_URL}?${params.toString()}`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      });
    } catch (error) {
      const diagnostics = getFetchErrorDiagnostics(error, apiKey);
      console.warn('AGMARKNET market request failed.', diagnostics);
      const cached = getCachedResponse(cacheKey);
      return unavailableResponse(
        diagnostics.failureType === 'timeout'
          ? 'AGMARKNET data source timed out.'
          : 'Could not connect to the AGMARKNET data source.',
        502,
        cached
      );
    }

    if (!response.ok) {
      console.warn('AGMARKNET market upstream returned an error.', {
        failureType: 'http',
        httpStatus: response.status,
      });
      return unavailableResponse(`AGMARKNET returned HTTP ${response.status}.`, response.status === 429 ? 429 : 502, cached);
    }

    const payload = await response.json().catch(() => null);
    if (!payload || !Array.isArray(payload.records)) {
      return unavailableResponse('AGMARKNET returned an invalid response.', 502, cached);
    }

    const rawRecords = payload.records;
    const records = rawRecords
      .filter((record) => {
        const state = firstDefined(record, ['state', 'State']);
        return state && String(state).trim().toLowerCase() === 'andhra pradesh';
      })
      .map(parseRecord)
      .filter(Boolean)
      .filter((record) => matchesFilters(record, filters));

    if (records.length === 0) {
      return NextResponse.json({
        unavailable: true,
        dataStatus: 'unavailable',
        reason: 'No Andhra Pradesh market records matched these filters.',
        records: [],
        count: 0,
        source: SOURCE,
        sourceUrl: SOURCE_URL,
        fetchedAt: new Date().toISOString(),
        pagination: {
          limit,
          offset,
          total: Number(payload.total) || Number(payload.count) || rawRecords.length,
        },
      });
    }

    const result = {
      unavailable: false,
      dataStatus: 'live',
      records,
      count: records.length,
      source: SOURCE,
      sourceUrl: SOURCE_URL,
      fetchedAt: new Date().toISOString(),
      isCached: false,
      latestArrivalDate: getLatestArrivalDate(records),
      pagination: {
        limit,
        offset,
        total: Number(payload.total) || Number(payload.count) || rawRecords.length,
        hasMore: offset + records.length < (Number(payload.total) || Number(payload.count) || rawRecords.length),
      },
    };
    cacheResponse(cacheKey, result);
    return NextResponse.json(result);
  } catch (error) {
    console.warn('AGMARKNET market route failed.', {
      name: error?.name || 'UnknownError',
      code: error?.code || null,
    });
    const { searchParams } = new URL(request.url);
    const cacheKey = JSON.stringify({
      state: searchParams.get('state')?.trim() || 'Andhra Pradesh',
      district: searchParams.get('district')?.trim() || '',
      market: searchParams.get('market')?.trim() || '',
      commodity: (searchParams.get('commodity') || searchParams.get('crop') || '').trim(),
      variety: searchParams.get('variety')?.trim() || '',
      grade: searchParams.get('grade')?.trim() || '',
      limit: Number(searchParams.get('limit') || 20),
      offset: Number(searchParams.get('offset') || 0),
    });
    return unavailableResponse('Could not connect to the AGMARKNET data source.', 502, getCachedResponse(cacheKey));
  }
}
