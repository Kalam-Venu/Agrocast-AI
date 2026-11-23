'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFarm } from '../../contexts/FarmContext';
import { OFFICIAL_MSP_RATES, PRICE_TREND_DATA } from '../../lib/data/markets';
import { getMarketsWithDistance } from '../../lib/services/marketService';
import {
  Store,
  Calculator,
  TrendingUp,
  Landmark,
  Scale,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

const PRICE_PAGE_SIZE = 20;

function cropCommodityName(cropName = '') {
  return cropName.split('(')[0].trim();
}

function priceRecordKey(record) {
  return [
    record.marketName,
    record.commodity,
    record.variety || '',
    record.grade || '',
    record.arrivalDate,
    record.modalPrice,
  ].join('|');
}

export default function MarketsPage() {
  const { t, isTelugu } = useLanguage();
  const { farmProfile, isLoaded } = useFarm();

  const [activeTab, setActiveTab] = useState('prices'); // 'prices' | 'markets' | 'msp' | 'estimator' | 'comparison'

  // Estimator States
  const [estCrop, setEstCrop] = useState('');
  const [estQuantity, setEstQuantity] = useState('');
  const [estPrice, setEstPrice] = useState('');
  const [estTransport, setEstTransport] = useState('');
  const [otherDeductions, setOtherDeductions] = useState('');
  const [selectedPriceKey, setSelectedPriceKey] = useState('');

  // Comparison State
  const [selectedCropComparison, setSelectedCropComparison] = useState('');
  const [comparisonRecords, setComparisonRecords] = useState([]);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [liveMarketPrices, setLiveMarketPrices] = useState([]);
  const [farmCropPrices, setFarmCropPrices] = useState([]);
  const [farmCropPriceStatus, setFarmCropPriceStatus] = useState('loading');
  const [marketPriceStatus, setMarketPriceStatus] = useState({
    loading: true,
    dataStatus: 'loading',
    unavailable: false,
    partial: false,
    message: '',
    pagination: { total: 0, limit: PRICE_PAGE_SIZE, offset: 0, hasMore: false },
  });
  const [priceFilters, setPriceFilters] = useState({
    state: 'Andhra Pradesh',
    district: '',
    market: '',
    commodity: '',
    variety: '',
    grade: '',
  });
  const [appliedPriceFilters, setAppliedPriceFilters] = useState(priceFilters);
  const [priceOffset, setPriceOffset] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const loadPrices = async () => {
      try {
        const params = new URLSearchParams({
          limit: String(PRICE_PAGE_SIZE),
          offset: String(priceOffset),
        });
        Object.entries(appliedPriceFilters).forEach(([key, value]) => {
          if (value.trim()) params.set(key, value.trim());
        });
        const response = await fetch(`/api/market-prices?${params.toString()}`);
        const payload = await response.json();
        if (cancelled) return;
        if (response.ok) {
          setLiveMarketPrices(payload.records || []);
          setMarketPriceStatus({
            loading: false,
            unavailable: Boolean(payload.unavailable),
            partial: Boolean(payload.partial),
            dataStatus: payload.dataStatus || (payload.unavailable ? 'unavailable' : 'live'),
            message: payload.unavailable || payload.partial
              ? payload.reason || (isTelugu ? 'ధరలు అందుబాటులో లేవు.' : 'Prices are unavailable.')
              : '',
            latestArrivalDate: payload.latestArrivalDate || null,
            pagination: payload.pagination || { total: payload.records?.length || 0, limit: PRICE_PAGE_SIZE, offset: priceOffset, hasMore: false },
          });
        } else {
          setLiveMarketPrices([]);
          setMarketPriceStatus({
            loading: false,
            unavailable: true,
            partial: false,
            dataStatus: payload.dataStatus || 'unavailable',
            message: payload.reason || (isTelugu ? 'అధికారిక ధర సేవ అందుబాటులో లేదు.' : 'Official price service is unavailable.'),
            pagination: payload.pagination || { total: 0, limit: PRICE_PAGE_SIZE, offset: priceOffset, hasMore: false },
          });
        }
      } catch (error) {
        if (cancelled) return;
        setLiveMarketPrices([]);
        setMarketPriceStatus({
          loading: false,
          unavailable: true,
          partial: false,
          dataStatus: 'unavailable',
          message: isTelugu ? 'అధికారిక ధర సేవకు కనెక్ట్ కాలేదు.' : 'Could not connect to the official price service.',
          pagination: { total: 0, limit: PRICE_PAGE_SIZE, offset: priceOffset, hasMore: false },
        });
      }
    };
    loadPrices();
    return () => {
      cancelled = true;
    };
  }, [isTelugu, appliedPriceFilters, priceOffset]);

  useEffect(() => {
    if (!isLoaded) return;
    const cropNames = (farmProfile.crops || []).map((crop) => crop.cropName);
    const firstCrop = cropNames[0] || '';
    if (!cropNames.includes(estCrop)) setEstCrop(firstCrop);
    if (!cropNames.includes(selectedCropComparison)) setSelectedCropComparison(firstCrop);
  }, [isLoaded, farmProfile.crops, estCrop, selectedCropComparison]);

  useEffect(() => {
    let cancelled = false;
    const loadFarmCropPrice = async () => {
      if (!isLoaded || !estCrop) {
        setFarmCropPrices([]);
        setFarmCropPriceStatus('unavailable');
        return;
      }
      setFarmCropPriceStatus('loading');
      try {
        const params = new URLSearchParams({
          commodity: cropCommodityName(estCrop),
          limit: '100',
          offset: '0',
        });
        const response = await fetch(`/api/market-prices?${params.toString()}`);
        const payload = await response.json();
        if (cancelled) return;
        const exactCommodity = cropCommodityName(estCrop).toLowerCase();
        const matchingRecords = (payload.records || []).filter(
          (record) => record.commodity.trim().toLowerCase() === exactCommodity
        );
        setFarmCropPrices(matchingRecords);
        setFarmCropPriceStatus(payload.unavailable || !response.ok ? 'unavailable' : payload.dataStatus || 'live');
      } catch {
        if (!cancelled) {
          setFarmCropPrices([]);
          setFarmCropPriceStatus('unavailable');
        }
      }
    };
    loadFarmCropPrice();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, estCrop]);

  useEffect(() => {
    let cancelled = false;
    const loadComparisonPrices = async () => {
      if (activeTab !== 'comparison' || !selectedCropComparison) return;
      setComparisonLoading(true);
      try {
        const params = new URLSearchParams({
          commodity: cropCommodityName(selectedCropComparison),
          limit: '100',
          offset: '0',
        });
        const response = await fetch(`/api/market-prices?${params.toString()}`);
        const payload = await response.json();
        if (cancelled) return;
        setComparisonRecords(response.ok && !payload.unavailable ? payload.records || [] : []);
      } catch {
        if (!cancelled) setComparisonRecords([]);
      } finally {
        if (!cancelled) setComparisonLoading(false);
      }
    };
    loadComparisonPrices();
    return () => {
      cancelled = true;
    };
  }, [activeTab, selectedCropComparison]);

  const numericPrice = Number(estPrice);
  const numericQuantity = Number(estQuantity) || 0;
  const numericTransport = Number(estTransport);
  const numericOtherDeductions = Number(otherDeductions) || 0;
  const hasEstimatorPrice = estPrice !== '' && Number.isFinite(numericPrice);
  const hasTransportCost = estTransport !== '' && Number.isFinite(numericTransport);
  const grossValue = hasEstimatorPrice && numericQuantity > 0 ? numericQuantity * numericPrice : null;
  const transportTotal = hasTransportCost ? numericQuantity * numericTransport : null;
  const netValue = grossValue == null || !hasTransportCost
    ? null
    : grossValue - transportTotal - numericOtherDeductions;

  const matchingFarmCropPrices = farmCropPrices.filter(
    (record) => record.commodity.trim().toLowerCase() === cropCommodityName(estCrop).toLowerCase()
  );
  const comparisonCommodity = cropCommodityName(selectedCropComparison).toLowerCase();
  const exactComparisonRecords = comparisonRecords.filter(
    (record) => record.commodity.trim().toLowerCase() === comparisonCommodity
  );
  const comparisonReference = exactComparisonRecords[0];
  const comparableRecords = comparisonReference?.variety && comparisonReference?.arrivalDate
    ? exactComparisonRecords.filter(
        (record) =>
          record.variety?.trim().toLowerCase() === comparisonReference.variety.trim().toLowerCase() &&
          (record.grade || '').trim().toLowerCase() === (comparisonReference.grade || '').trim().toLowerCase() &&
          record.arrivalDate === comparisonReference.arrivalDate
      )
    : [];

  // Farm coordinates from user's saved farm profile
  const farmLat = Number(farmProfile?.location?.latitude);
  const farmLon = Number(farmProfile?.location?.longitude);

  // Calculate dynamic distances to all AP Mandis
  const nearbyMarkets = useMemo(() => {
    return getMarketsWithDistance(farmLat, farmLon);
  }, [farmLat, farmLon]);

  const applyPriceFilters = (event) => {
    event.preventDefault();
    setPriceOffset(0);
    setAppliedPriceFilters({ ...priceFilters });
  };

  const clearPriceFilters = () => {
    const emptyFilters = { state: 'Andhra Pradesh', district: '', market: '', commodity: '', variety: '', grade: '' };
    setPriceFilters(emptyFilters);
    setAppliedPriceFilters(emptyFilters);
    setPriceOffset(0);
  };

  const selectedEstimatorRecord = matchingFarmCropPrices.find(
    (record) => priceRecordKey(record) === selectedPriceKey
  );

  useEffect(() => {
    if (selectedEstimatorRecord) setEstPrice(String(selectedEstimatorRecord.modalPrice));
  }, [selectedPriceKey, selectedEstimatorRecord]);

  useEffect(() => {
    setSelectedPriceKey('');
    setEstPrice('');
  }, [estCrop]);

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-slate-600">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 text-xs font-semibold px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
          <Store className="w-4 h-4 text-amber-600" />
          <span>{t('markets.title')}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t('markets.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-3xl">
          {t('markets.subtitle')}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { id: 'prices', label: t('markets.tabPrices'), icon: TrendingUp },
          { id: 'markets', label: t('markets.tabNearbyMarkets'), icon: Store },
          { id: 'msp', label: t('markets.tabMSP'), icon: Landmark },
          { id: 'estimator', label: t('markets.tabEstimator'), icon: Calculator },
          { id: 'comparison', label: t('markets.tabComparison'), icon: Scale },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-4 py-3 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Official Daily Mandi Prices & Recharts Price Trends */}
      {activeTab === 'prices' && (
        <div className="space-y-8">
          <form onSubmit={applyPriceFilters} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800">{t('markets.filters')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                ['state', t('common.state')],
                ['district', t('markets.district')],
                ['market', t('markets.marketFilter')],
                ['commodity', t('markets.commodityFilter')],
                ['variety', t('markets.variety')],
                ['grade', t('markets.grade')],
              ].map(([key, label]) => (
                <label key={key} className="text-xs font-semibold text-slate-700">
                  {label}
                  <input
                    value={priceFilters[key]}
                    onChange={(e) => setPriceFilters({ ...priceFilters, [key]: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal"
                  />
                </label>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white">
                {t('markets.applyFilters')}
              </button>
              <button type="button" onClick={clearPriceFilters} className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700">
                {t('markets.clearFilters')}
              </button>
            </div>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
            <div>
              <strong>{t('common.source')}:</strong> {liveMarketPrices[0]?.source || 'AGMARKNET / data.gov.in'}
              {marketPriceStatus.latestArrivalDate && (
                <span className="ml-2">{t('markets.lastAvailableDate')}: {marketPriceStatus.latestArrivalDate}</span>
              )}
            </div>
            <span className={`rounded-full border px-2.5 py-1 font-bold ${
              marketPriceStatus.dataStatus === 'live'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : marketPriceStatus.dataStatus === 'cached'
                  ? 'border-sky-200 bg-sky-50 text-sky-800'
                  : 'border-amber-200 bg-amber-50 text-amber-900'
            }`}>
              {marketPriceStatus.dataStatus === 'live'
                ? t('markets.liveData')
                : marketPriceStatus.dataStatus === 'cached'
                  ? t('markets.cachedData')
                  : marketPriceStatus.dataStatus === 'loading'
                    ? t('common.loading')
                    : t('markets.unavailableData')}
            </span>
          </div>

          {marketPriceStatus.partial && liveMarketPrices.length > 0 && (
            <div
              role="status"
              className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"
            >
              {isTelugu
                ? 'ఇవి AGMARKNET 2.0 నుంచి అందిన వాస్తవ ధరలు. పరిమిత మార్కెట్/పంట కలయికలను మాత్రమే పరిశీలించాం; ఇది రాష్ట్రంలోని అన్ని మార్కెట్ల పూర్తి జాబితా కాదు.'
                : marketPriceStatus.message}
            </div>
          )}

          {marketPriceStatus.loading ? (
            <div className="p-5 rounded-xl border border-slate-200 bg-white text-sm text-slate-600">
              {isTelugu ? 'అధికారిక మార్కెట్ ధరలను లోడ్ చేస్తున్నాం...' : 'Loading official market prices...'}
            </div>
          ) : liveMarketPrices.length === 0 ? (
            <div className="p-5 rounded-xl border border-amber-200 bg-amber-50 text-sm text-amber-900">
              <strong>{t('markets.unavailableData')}:</strong>{' '}
              {marketPriceStatus.message || t('markets.noMarketRecords')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveMarketPrices.map((item, index) => (
                <div
                  key={`${item.marketName}-${item.commodity}-${item.arrivalDate}-${index}`}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 font-medium">{item.marketName} - {item.district}</div>
                    <h3 className="text-base font-extrabold text-slate-900">{item.commodity}{item.variety ? ` - ${item.variety}` : ''}{item.grade ? ` (${item.grade})` : ''}</h3>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="text-xs text-emerald-800 font-bold">{t('markets.modalPrice')}</div>
                    <div className="text-xl font-black text-emerald-900">
                      ₹{item.modalPrice.toLocaleString('en-IN')} <span className="text-xs font-normal">/ quintal</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      {t('markets.minPrice')}: ₹{item.minPrice?.toLocaleString('en-IN') ?? '-'} | {t('markets.maxPrice')}: ₹{item.maxPrice?.toLocaleString('en-IN') ?? '-'}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 space-y-1">
                    <div>{t('markets.priceDate')}: {item.arrivalDate}</div>
                    <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-emerald-700 underline">{item.source}</a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!marketPriceStatus.loading && liveMarketPrices.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-600">
                {t('markets.page')} {Math.floor(priceOffset / PRICE_PAGE_SIZE) + 1}
                {' · '}{marketPriceStatus.pagination.total} {t('markets.records')}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={priceOffset === 0}
                  onClick={() => setPriceOffset(Math.max(0, priceOffset - PRICE_PAGE_SIZE))}
                  className="rounded-lg border border-slate-300 px-3 py-2 font-semibold disabled:opacity-40"
                >
                  {t('markets.previousPage')}
                </button>
                <button
                  type="button"
                  disabled={!marketPriceStatus.pagination.hasMore}
                  onClick={() => setPriceOffset(priceOffset + PRICE_PAGE_SIZE)}
                  className="rounded-lg border border-slate-300 px-3 py-2 font-semibold disabled:opacity-40"
                >
                  {t('markets.nextPage')}
                </button>
              </div>
            </div>
          )}

          {/* Historical Price Trends Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
                  {t('markets.priceTrendsTitle')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('markets.demoData')}
                </p>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={PRICE_TREND_DATA} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="chilli" name={isTelugu ? 'మిరప (Chilli)' : 'Chilli'} stroke="#ef4444" strokeWidth={2} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="cotton" name={isTelugu ? 'పత్తి (Cotton)' : 'Cotton'} stroke="#8b5cf6" strokeWidth={2} />
                  <Line type="monotone" dataKey="paddy" name={isTelugu ? 'వరి (Paddy)' : 'Paddy'} stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Nearby Mandis & Procurement Centers */}
      {activeTab === 'markets' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm text-emerald-950">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>{isTelugu ? 'లెక్కింపు స్థానం (మీ పొలం):' : 'Distance Reference (Your Farm):'}</strong>{' '}
                {farmProfile?.location?.village || t('common.noData')}, {farmProfile?.location?.mandal || t('common.noData')}, {farmProfile?.location?.district || t('common.noData')}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 self-start sm:self-auto">
              {t('markets.distanceUnavailable')}
            </span>
          </div>

          {nearbyMarkets.every((market) => market.distanceKm == null) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              {t('markets.distanceUnavailable')}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {nearbyMarkets.filter((market) => market.distanceKm != null).slice(0, 5).map((mkt) => (
              <div
                key={mkt.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {isTelugu ? mkt.categoryTe : mkt.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">
                      {isTelugu ? mkt.nameTe : mkt.name}
                    </h3>
                    <div className="text-xs text-slate-500 flex items-center mt-1">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {mkt.location}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                  <div>
                    <strong>{t('markets.district')}:</strong> {mkt.district}
                  </div>
                  <div>
                    <strong>{t('markets.contact')}:</strong> {mkt.contact}
                  </div>
                  <div>
                    <strong>{isTelugu ? 'కొనుగోలు చేసే పంటలు' : 'Accepted Crops'}:</strong>{' '}
                    <span className="text-emerald-800 font-semibold">{mkt.acceptedCrops.join(', ')}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>{mkt.source}</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    📍 {mkt.distanceKm} km {isTelugu ? 'దూరం' : 'away'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Official MSP Benchmarks */}
      {activeTab === 'msp' && (
        <div className="space-y-6">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>{t('markets.mspDisclaimer')}</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-4 font-bold">{t('markets.cropName')}</th>
                    <th className="p-4 font-bold">{isTelugu ? 'రకం (Variety)' : 'Variety'}</th>
                    <th className="p-4 font-bold">{isTelugu ? 'సీజన్' : 'Season'}</th>
                    <th className="p-4 font-bold text-right">{t('markets.mspAmount')}</th>
                    <th className="p-4 font-bold">{t('markets.officialSource')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {OFFICIAL_MSP_RATES.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-bold text-slate-900">
                        {isTelugu ? item.cropNameTe : item.cropName}
                      </td>
                      <td className="p-4 text-slate-600">{item.variety || '-'}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">
                          {item.season}
                        </span>
                      </td>
                      <td className="p-4 font-black text-right text-emerald-800 text-base">
                        ₹{item.mspAmount.toLocaleString('en-IN')}{' '}
                        <span className="text-xs font-normal text-slate-500">/{item.unit.split('/')[1]}</span>
                      </td>
                      <td className="p-4 text-xs text-slate-500">{item.officialSource}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Net Profit & Selling Value Estimator */}
      {activeTab === 'estimator' && (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-emerald-600" />
              {t('markets.estimatorTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {t('markets.estimatorSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('markets.selectCropToEstimate')}
              </label>
              <select
                value={estCrop}
                onChange={(e) => setEstCrop(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
              >
                <option value="">{t('dashboard.noCropsAdded')}</option>
                {[...new Set((farmProfile.crops || []).map((crop) => crop.cropName))].map((cropName) => (
                  <option key={cropName} value={cropName}>{cropName}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('markets.selectPriceRecord')}
              </label>
              <select
                value={selectedPriceKey}
                onChange={(e) => setSelectedPriceKey(e.target.value)}
                disabled={!matchingFarmCropPrices.length}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white disabled:bg-slate-100"
              >
                <option value="">{t('common.noData')}</option>
                {matchingFarmCropPrices.map((record) => (
                  <option key={priceRecordKey(record)} value={priceRecordKey(record)}>
                    {record.marketName} · {record.variety || t('common.noData')} · {record.arrivalDate} · ₹{record.modalPrice}
                  </option>
                ))}
              </select>
              {farmCropPriceStatus === 'unavailable' && (
                <p className="mt-1 text-xs text-amber-800">{t('markets.noMatchingPrice')}</p>
              )}
              {farmCropPriceStatus === 'cached' && (
                <p className="mt-1 text-xs text-sky-800">{t('markets.cachedData')}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('markets.quantityQuintals')}
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={estQuantity}
                onChange={(e) => setEstQuantity(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('markets.modalPrice')} (₹/Qtl)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={estPrice}
                onChange={(e) => {
                  setSelectedPriceKey('');
                  setEstPrice(e.target.value);
                }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
              <p className="mt-1 text-[11px] text-slate-500">{t('markets.manualPrice')}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('markets.transportCostPerQuintal')}
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={estTransport}
                onChange={(e) => setEstTransport(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
              <p className="mt-1 text-[11px] text-slate-500">{t('markets.transportRateMeaning')}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('markets.otherDeductions')}
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={otherDeductions}
                onChange={(e) => setOtherDeductions(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>
          </div>

          {/* Calculations Summary Card */}
          <div className="p-5 bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl border border-emerald-200 space-y-3">
            <div className="flex justify-between items-center text-sm text-slate-700">
              <span>{t('markets.grossIncome')}:</span>
              <span className="font-bold text-slate-900">{grossValue == null ? '—' : `₹${grossValue.toLocaleString('en-IN')}`}</span>
            </div>

            <div className="flex justify-between items-center text-sm text-red-700">
              <span>{t('markets.totalTransportCost')} (-):</span>
              <span className="font-semibold">
                {transportTotal == null ? '—' : `- ₹${transportTotal.toLocaleString('en-IN')}`}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm text-red-700">
              <span>{t('markets.otherDeductions')} (-):</span>
              <span className="font-semibold">- ₹{numericOtherDeductions.toLocaleString('en-IN')}</span>
            </div>

            <div className="border-t border-emerald-200 pt-3 flex justify-between items-center text-base sm:text-lg">
              <span className="font-extrabold text-emerald-950">{t('markets.netEstimatedIncome')}:</span>
              <span className="font-black text-emerald-800 text-xl sm:text-2xl">
                {netValue == null ? '—' : `₹${netValue.toLocaleString('en-IN')}`}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            {t('markets.estimatorDisclaimer')}
          </p>
        </div>
      )}

      {/* TAB 5: Mandi Comparison Matrix */}
      {activeTab === 'comparison' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <Scale className="w-5 h-5 mr-2 text-emerald-600" />
                {t('markets.tabComparison')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('markets.comparableRecords')}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-xs font-semibold text-slate-700">
                {isTelugu ? 'పంట:' : 'Crop:'}
              </label>
              <select
                value={selectedCropComparison}
                onChange={(e) => setSelectedCropComparison(e.target.value)}
                className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 font-medium"
              >
                <option value="">{t('dashboard.noCropsAdded')}</option>
                {[...new Set((farmProfile.crops || []).map((crop) => crop.cropName))].map((cropName) => (
                  <option key={cropName} value={cropName}>{cropName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="p-3 font-bold">{t('markets.marketName')}</th>
                  <th className="p-3 font-bold">{t('markets.district')}</th>
                  <th className="p-3 font-bold">{t('markets.variety')}</th>
                  <th className="p-3 font-bold">{t('markets.grade')}</th>
                  <th className="p-3 font-bold text-right">{t('markets.modalPrice')}</th>
                  <th className="p-3 font-bold">{t('markets.priceDate')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparisonLoading ? (
                  <tr><td colSpan={6} className="p-6 text-center text-slate-500">{t('common.loading')}</td></tr>
                ) : comparableRecords.length > 0 ? (
                  comparableRecords.map((record) => (
                    <tr key={priceRecordKey(record)} className="hover:bg-slate-50/60">
                      <td className="p-3 font-bold text-slate-900">{record.marketName}</td>
                      <td className="p-3 text-slate-600">{record.district}</td>
                      <td className="p-3 text-slate-600">{record.variety}</td>
                      <td className="p-3 text-slate-600">{record.grade || t('common.noData')}</td>
                      <td className="p-3 font-extrabold text-emerald-800 text-right">
                        ₹{record.modalPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-slate-600">{record.arrivalDate}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500">
                      {t('markets.comparisonUnavailable')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
