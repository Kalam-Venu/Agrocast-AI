import { NextResponse } from 'next/server';

const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const BASE_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;
const SOURCE = 'AGMARKNET / Ministry of Agriculture & Farmers Welfare, Government of India';
const SOURCE_URL = 'https://agmarknet.gov.in';
const CACHE_TTL_MS = 30 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;
const UPSTREAM_TIMEOUT_MS = 12000;
const responseCache = new Map();

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
      console.warn('AGMARKNET market request failed.', {
        name: error?.name || 'UnknownError',
        code: error?.code || null,
        timeout: error?.name === 'TimeoutError' || error?.name === 'AbortError',
      });
      const cached = getCachedResponse(cacheKey);
      return unavailableResponse(
        error?.name === 'TimeoutError' || error?.name === 'AbortError'
          ? 'AGMARKNET data source timed out.'
          : 'Could not connect to the AGMARKNET data source.',
        502,
        cached
      );
    }

    if (!response.ok) {
      console.warn('AGMARKNET market upstream returned an error.', {
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
