'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFarm } from '../../contexts/FarmContext';
import {
  CloudSun,
  Bot,
  AlertTriangle,
  Sprout,
  Store,
  FlaskConical,
  Users,
  ArrowRight,
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  TrendingUp,
  Plus,
  Send,
} from 'lucide-react';

export default function DashboardPage() {
  const { t, isTelugu, language } = useLanguage();
  const { user } = useAuth();
  const { farmProfile, isLoaded } = useFarm();

  const [weather, setWeather] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiQuestion, setAiQuestion] = useState('');

  useEffect(() => {
    async function loadDashboardData() {
      if (!isLoaded) return;
      try {
        const lat = Number(farmProfile?.location?.latitude);
        const lon = Number(farmProfile?.location?.longitude);
        const cropNames = [...new Set((farmProfile?.crops || []).map((crop) =>
          crop.cropName.split('(')[0].trim()
        ))];

        const [wRes, aRes, marketResponses] = await Promise.all([
          Number.isFinite(lat) && Number.isFinite(lon)
            ? fetch(`/api/weather/current?lat=${lat}&lon=${lon}&lang=${language}`)
            : Promise.resolve(null),
          farmProfile?.location?.district
            ? fetch(`/api/weather/alerts?district=${encodeURIComponent(farmProfile.location.district)}`)
            : Promise.resolve(null),
          Promise.all(cropNames.map((cropName) => {
            const params = new URLSearchParams({ commodity: cropName, limit: '4', offset: '0' });
            return fetch(`/api/market-prices?${params.toString()}`);
          })),
        ]);

        if (wRes?.ok) {
          const wData = await wRes.json();
          setWeather(wData);
        }
        if (aRes?.ok) {
          const aData = await aRes.json();
          setAlerts(aData.alerts || []);
        }
        const pricePayloads = await Promise.all(marketResponses.map(async (response) => {
          if (!response.ok) return [];
          const payload = await response.json();
          if (payload.unavailable) return [];
          return (payload.records || []).filter((record) =>
            cropNames.some((cropName) => record.commodity.trim().toLowerCase() === cropName.toLowerCase())
          );
        }));
        const seenRecords = new Set();
        const officialRecords = pricePayloads.flat().filter((record) => {
          const key = `${record.marketName}|${record.commodity}|${record.variety || ''}|${record.arrivalDate}`;
          if (seenRecords.has(key)) return false;
          seenRecords.add(key);
          return true;
        });
        setMarketPrices(officialRecords.slice(0, 4));
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [farmProfile, isLoaded, language]);

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-slate-600">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-700 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1 bg-emerald-900/40 rounded-full border border-emerald-400/30">
            <MapPin className="w-3.5 h-3.5 text-emerald-300" />
            <span>
              {farmProfile.location.village}, {farmProfile.location.mandal} ({farmProfile.location.district})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('dashboard.welcome')}, {user?.fullName || 'రైతు మిత్రుడు'}!
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-xl">
            {t('dashboard.welcomeSub')}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/my-farm"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold transition-all inline-flex items-center"
          >
            <Sprout className="w-4 h-4 mr-2 text-emerald-300" />
            {t('nav.myFarm')}
          </Link>
          <Link
            href="/advisor"
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-sm font-bold shadow-md transition-all inline-flex items-center"
          >
            <Bot className="w-4 h-4 mr-2" />
            {t('dashboard.askAIAdvisor')}
          </Link>
        </div>
      </div>

      {/* Active Weather Warnings Banner (if any) */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                alert.severity === 'severe'
                  ? 'bg-red-50 border-red-300 text-red-950'
                  : 'bg-amber-50 border-amber-300 text-amber-950'
              }`}
            >
              <div className="flex items-start space-x-3">
                <AlertTriangle
                  className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                    alert.severity === 'severe' ? 'text-red-600' : 'text-amber-600'
                  }`}
                />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm sm:text-base">
                      {isTelugu ? alert.titleTe : alert.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        alert.isOfficial
                          ? 'bg-blue-100 text-blue-800'
                          : alert.isSample
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {alert.isOfficial
                        ? t('weather.officialBadge')
                        : alert.isSample
                          ? (isTelugu ? 'నమూనా / ప్రదర్శన హెచ్చరిక' : 'SAMPLE / DEMONSTRATION ALERT')
                          : t('weather.appRiskBadge')}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700">
                    {isTelugu ? alert.descriptionTe : alert.description}
                  </p>
                </div>
              </div>

              <Link
                href="/weather"
                className="whitespace-nowrap inline-flex items-center text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950"
              >
                <span>{t('weather.advisoryHeading')}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Grid: Weather Card & Crops Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Summary Card */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <CloudSun className="w-5 h-5 mr-2 text-emerald-600" />
                {t('dashboard.weatherOverview')}
              </h2>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                {farmProfile.location.district}
              </span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-sm text-slate-500">{t('common.loading')}</div>
            ) : weather ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-4xl font-extrabold text-slate-900">
                      {weather.temperature}°
                    </span>
                    <span className="text-sm font-medium text-slate-500">C</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-800">{weather.conditionText}</div>
                    <div className="text-xs text-slate-500">
                      {t('weather.feelsLike')}: {weather.feelsLike}°C
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <Droplets className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                    <div className="text-xs text-slate-500">{t('weather.humidity')}</div>
                    <div className="text-sm font-bold text-slate-800">{weather.humidity}%</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <Wind className="w-4 h-4 mx-auto text-emerald-600 mb-1" />
                    <div className="text-xs text-slate-500">{t('weather.wind')}</div>
                    <div className="text-sm font-bold text-slate-800">{weather.windSpeed} km/h</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <CloudSun className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                    <div className="text-xs text-slate-500">{t('weather.rainfall')}</div>
                    <div className="text-sm font-bold text-slate-800">{weather.rainfall} mm</div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link
              href="/weather"
              className="inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-900"
            >
              <span>{t('dashboard.viewFullWeather')}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Crops & Progress Tracker Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <Sprout className="w-5 h-5 mr-2 text-emerald-600" />
                {t('dashboard.cropStatus')}
              </h2>
              <Link
                href="/my-farm"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                {t('dashboard.addCrop')}
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {farmProfile.crops.map((crop) => (
                <div
                  key={crop.id}
                  className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 space-y-2 hover:bg-emerald-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-base">{crop.cropName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 uppercase">
                      {t(`farm.stages.${crop.growthStage}`)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-[11px] text-emerald-800 font-medium">
                    <MapPin className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                    <span>
                      {crop.location?.village || farmProfile.location.village}, {crop.location?.mandal || farmProfile.location.mandal} ({crop.location?.district || farmProfile.location.district})
                    </span>
                  </div>

                  <div className="text-xs text-slate-600">
                    <span className="font-medium text-slate-700">{t('farm.sowingDate')}: </span>
                    {crop.sowingDate}
                  </div>

                  {crop.notes && (
                    <p className="text-xs text-slate-700 italic line-clamp-2 bg-white/70 p-2 rounded border border-emerald-100/60">
                      &quot;{crop.notes}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex justify-between items-center text-xs">
            <span className="text-slate-500">
              {t('common.acres')}: {farmProfile.landArea} | {t('farm.soilStep')}: {farmProfile.soilType}
            </span>
            <Link
              href="/my-farm"
              className="font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center"
            >
              <span>{t('farm.cropTrackerTitle')}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* AI Quick Query Box */}
      <div className="bg-gradient-to-br from-emerald-50 via-white to-green-50 rounded-2xl border border-emerald-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {t('dashboard.askAIAdvisor')}
              </h3>
              <p className="text-xs text-slate-500">
                {isTelugu ? 'మీ పొలం నేల మరియు పంట దశ ఆధారంగా సమాధానం' : 'Context-aware agricultural advice'}
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (aiQuestion.trim()) {
              window.location.href = `/advisor?q=${encodeURIComponent(aiQuestion)}`;
            }
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <input
            type="text"
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            placeholder={t('dashboard.aiPlaceholder')}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow transition-all inline-flex items-center justify-center"
          >
            <span>{t('advisor.send')}</span>
            <Send className="w-4 h-4 ml-2" />
          </button>
        </form>
      </div>

      {/* Market Prices Snapshot & Quick Access Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Rates Preview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
              {t('dashboard.marketPricesPreview')}
            </h2>
            <Link
              href="/markets"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center"
            >
              <span>{t('dashboard.viewMarkets')}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {marketPrices.map((item) => (
              <div
                key={`${item.marketName}-${item.commodity}-${item.arrivalDate}`}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {item.commodity}{item.variety ? ` · ${item.variety}` : ''}
                  </div>
                  <div className="text-[11px] text-slate-500">{item.marketName} · {item.arrivalDate}</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-extrabold text-emerald-700">
                    ₹{Number(item.modalPrice).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-500">₹ / Quintal · AGMARKNET</div>
                </div>
              </div>
            ))}
            {!marketPrices.length && (
              <p className="sm:col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                {farmProfile.crops?.length ? t('markets.noMatchingPrice') : t('dashboard.noCropsAdded')}
              </p>
            )}
          </div>
        </div>

        {/* Quick Module Navigation Links */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            {t('dashboard.quickLinks')}
          </h2>

          <Link
            href="/pesticides"
            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <FlaskConical className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold text-slate-800">
                {t('dashboard.viewPesticides')}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-700 transition-colors" />
          </Link>

          <Link
            href="/community"
            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-slate-800">
                {t('dashboard.viewCommunity')}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 transition-colors" />
          </Link>

          <Link
            href="/markets"
            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <Store className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-semibold text-slate-800">
                {t('dashboard.viewMarkets')}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
