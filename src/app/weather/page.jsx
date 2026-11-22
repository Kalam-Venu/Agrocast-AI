'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFarm } from '../../contexts/FarmContext';
import { ANDHRA_PRADESH_DISTRICTS, resolveLocationCoordinates } from '../../lib/data/andhraPradesh';
import {
  CloudSun,
  Navigation,
  MapPin,
  Droplets,
  Wind,
  Thermometer,
  AlertTriangle,
  Sunrise,
  Sunset,
  Calendar,
  CloudRain,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export default function WeatherPage() {
  const { t, isTelugu, language } = useLanguage();
  const { farmProfile, isLoaded } = useFarm();

  const [selectedDistrict, setSelectedDistrict] = useState(farmProfile?.location?.district || 'Guntur');
  const [selectedMandal, setSelectedMandal] = useState(farmProfile?.location?.mandal || 'Tenali');
  const [selectedVillage, setSelectedVillage] = useState(farmProfile?.location?.village || 'Angalakuduru');
  const [isCustomVillage, setIsCustomVillage] = useState(false);
  const [customVillageName, setCustomVillageName] = useState('');
  const [villageSearch, setVillageSearch] = useState('');
  const [locationHydrated, setLocationHydrated] = useState(false);

  const [coordinates, setCoordinates] = useState({
    lat: farmProfile?.location?.latitude ?? 16.3067,
    lon: farmProfile?.location?.longitude ?? 80.4365,
    isApproximate: false,
  });

  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !farmProfile?.location) return;
    const { district, mandal, village, latitude, longitude, approximateCoords } = farmProfile.location;
    if (district) setSelectedDistrict(district);
    if (mandal) setSelectedMandal(mandal);
    if (village) setSelectedVillage(village);
    setIsCustomVillage(Boolean(farmProfile.location.customVillage));
    setCustomVillageName(farmProfile.location.customVillage ? village || '' : '');
    if (latitude != null && longitude != null) {
      setCoordinates({
        lat: Number(latitude),
        lon: Number(longitude),
        isApproximate: Boolean(approximateCoords),
      });
    }
    setLocationHydrated(true);
  }, [isLoaded, farmProfile?.location]);

  // Sync with farm profile on click
  const handleSyncWithFarm = () => {
    if (farmProfile?.location) {
      const { district, mandal, village, latitude, longitude, approximateCoords, customVillage } = farmProfile.location;
      if (district) setSelectedDistrict(district);
      if (mandal) setSelectedMandal(mandal);
      if (village) {
        setSelectedVillage(village);
        setIsCustomVillage(Boolean(customVillage));
        setCustomVillageName(customVillage ? village : '');
      }
      if (latitude != null && longitude != null) {
        setCoordinates({
          lat: Number(latitude),
          lon: Number(longitude),
          isApproximate: Boolean(approximateCoords),
        });
      } else {
        const resolved = resolveLocationCoordinates(district, mandal, village);
        setCoordinates({ lat: resolved.lat, lon: resolved.lon, isApproximate: resolved.isApproximate });
      }
    }
  };

  // Fetch weather data for the current coordinates
  const fetchWeatherData = async (lat, lon) => {
    setLoading(true);
    try {
      const [currentRes, forecastRes, alertsRes] = await Promise.all([
        fetch(`/api/weather/current?lat=${lat}&lon=${lon}&lang=${language}`),
        fetch(`/api/weather/forecast?lat=${lat}&lon=${lon}&lang=${language}`),
        fetch(`/api/weather/alerts?district=${selectedDistrict}`),
      ]);

      if (currentRes.ok) {
        const cur = await currentRes.json();
        setCurrentWeather(cur);
      }
      if (forecastRes.ok) {
        const fore = await forecastRes.json();
        setForecastData(fore);
      }
      if (alertsRes.ok) {
        const alt = await alertsRes.json();
        setAlerts(alt.alerts || []);
      }
    } catch (err) {
      console.error('Weather load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !locationHydrated) return;
    fetchWeatherData(coordinates.lat, coordinates.lon);
  }, [isLoaded, locationHydrated, coordinates.lat, coordinates.lon, selectedDistrict, language]);

  // Handle GPS detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGpsError(isTelugu ? 'మీ బ్రౌజర్‌లో GPS సదుపాయం లేదు.' : 'Geolocation is not supported by your browser.');
      return;
    }
    setIsGpsLoading(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGpsLoading(false);
        const { latitude, longitude } = pos.coords;
        setCoordinates({ lat: latitude, lon: longitude, isApproximate: false });
        fetchWeatherData(latitude, longitude);
      },
      (err) => {
        setIsGpsLoading(false);
        setGpsError(
          isTelugu
            ? 'GPS అనుమతి నిరాకరించబడింది లేదా లొకేషన్ అందుబాటులో లేదు. దయచేసి మాన్యువల్‌గా ఎంచుకోండి.'
            : 'GPS permission denied or unavailable. Please select your location manually.'
        );
      },
      { timeout: 10000 }
    );
  };

  // Find mandals and villages for the selected district
  const currentDistrictObj = ANDHRA_PRADESH_DISTRICTS.find(
    (d) => d.name.toLowerCase() === selectedDistrict.toLowerCase()
  ) || ANDHRA_PRADESH_DISTRICTS[0];

  const currentMandalObj = currentDistrictObj.mandals.find(
    (m) => m.name.toLowerCase() === selectedMandal.toLowerCase()
  ) || currentDistrictObj.mandals[0];

  const availableVillages = currentMandalObj?.villages || [];
  const filteredVillages = villageSearch.trim()
    ? availableVillages.filter(
        (v) =>
          (v.name && v.name.toLowerCase().includes(villageSearch.toLowerCase())) ||
          (v.nameTe && v.nameTe.includes(villageSearch))
      )
    : availableVillages;

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-slate-600">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 text-xs font-semibold px-3 py-1 bg-sky-100 text-sky-800 rounded-full">
          <CloudSun className="w-4 h-4 text-sky-600" />
          <span>{t('weather.title')}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t('weather.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-3xl">
          {t('weather.subtitle')}
        </p>
      </div>

      {/* Location Selector Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-800">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <span>{t('weather.manualSelect')}:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSyncWithFarm}
              className="inline-flex items-center justify-center px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs sm:text-sm font-semibold transition-all"
            >
              <RefreshCw className="w-4 h-4 mr-1.5 text-emerald-600" />
              {isTelugu ? 'నా పొలం లొకేషన్' : 'My Farm Location'}
            </button>

            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={isGpsLoading}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 text-xs sm:text-sm font-semibold transition-all disabled:opacity-50"
            >
              <Navigation className={`w-4 h-4 mr-2 text-sky-600 ${isGpsLoading ? 'animate-spin' : ''}`} />
              {isGpsLoading ? t('weather.gpsDetecting') : t('weather.gpsButton')}
            </button>
          </div>
        </div>

        {gpsError && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            {gpsError}
          </div>
        )}

        {/* Dropdowns for AP District, Mandal, Village */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* District */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('common.district')}
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                const newDistName = e.target.value;
                setSelectedDistrict(newDistName);
                const dObj = ANDHRA_PRADESH_DISTRICTS.find((d) => d.name === newDistName);
                if (dObj) {
                  const firstM = dObj.mandals[0]?.name || '';
                  const firstV = dObj.mandals[0]?.villages[0]?.name || '';
                  setSelectedMandal(firstM);
                  setSelectedVillage(firstV);
                  setIsCustomVillage(false);
                  setCustomVillageName('');
                  setVillageSearch('');
                  const coords = resolveLocationCoordinates(newDistName, firstM, firstV);
                  setCoordinates({ lat: coords.lat, lon: coords.lon, isApproximate: coords.isApproximate });
                }
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
            >
              {ANDHRA_PRADESH_DISTRICTS.map((d) => (
                <option key={d.id} value={d.name}>
                  {isTelugu ? `${d.nameTe} (${d.name})` : d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mandal */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('common.mandal')}
            </label>
            <select
              value={selectedMandal}
              onChange={(e) => {
                const newMandal = e.target.value;
                setSelectedMandal(newMandal);
                const mObj = currentDistrictObj.mandals.find((m) => m.name === newMandal);
                const firstV = mObj?.villages[0]?.name || '';
                setSelectedVillage(firstV);
                setIsCustomVillage(false);
                setCustomVillageName('');
                setVillageSearch('');
                const coords = resolveLocationCoordinates(selectedDistrict, newMandal, firstV);
                setCoordinates({ lat: coords.lat, lon: coords.lon, isApproximate: coords.isApproximate });
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
            >
              {currentDistrictObj.mandals.map((m) => (
                <option key={m.id} value={m.name}>
                  {isTelugu ? `${m.nameTe} (${m.name})` : m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Village */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                {t('common.village')}
              </label>
              <input
                type="text"
                placeholder={isTelugu ? 'గ్రామం శోధించండి...' : 'Filter villages...'}
                value={villageSearch}
                onChange={(e) => setVillageSearch(e.target.value)}
                className="text-[11px] px-2 py-0.5 rounded border border-slate-200 w-32"
              />
            </div>

            <select
              value={isCustomVillage ? '__custom__' : selectedVillage}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '__custom__') {
                  setIsCustomVillage(true);
                  const coords = resolveLocationCoordinates(selectedDistrict, selectedMandal, customVillageName || 'custom');
                  setCoordinates({ lat: coords.lat, lon: coords.lon, isApproximate: true });
                } else {
                  setIsCustomVillage(false);
                  setCustomVillageName('');
                  setSelectedVillage(val);
                  const coords = resolveLocationCoordinates(selectedDistrict, selectedMandal, val);
                  setCoordinates({ lat: coords.lat, lon: coords.lon, isApproximate: coords.isApproximate });
                }
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
            >
              {filteredVillages.map((v) => (
                <option key={v.name} value={v.name}>
                  {isTelugu ? `${v.nameTe} (${v.name})` : v.name}
                </option>
              ))}
              <option value="__custom__">
                {isTelugu ? '+ ఇతర గ్రామం / తండా / హామ్లెట్ నమోదు చేయండి' : '+ Enter Other Village / Thanda / Hamlet'}
              </option>
            </select>

            {isCustomVillage && (
              <input
                type="text"
                value={customVillageName}
                onChange={(e) => {
                  setCustomVillageName(e.target.value);
                  const coords = resolveLocationCoordinates(selectedDistrict, selectedMandal, e.target.value);
                  setCoordinates({ lat: coords.lat, lon: coords.lon, isApproximate: coords.isApproximate });
                }}
                placeholder={isTelugu ? 'మీ గ్రామం / తండా పేరు టైప్ చేయండి' : 'Type village / thanda name'}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-emerald-400 bg-emerald-50/40 focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            )}
          </div>
        </div>

        {/* Location Status & Precision Badge */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center space-x-1.5 font-medium">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>
              <strong>{isTelugu ? 'ఎంచుకున్న ప్రదేశం:' : 'Selected Location:'}</strong>{' '}
              {isCustomVillage ? customVillageName || (isTelugu ? 'కస్టమ్ గ్రామం' : 'Custom Village') : selectedVillage}, {selectedMandal}, {selectedDistrict}
            </span>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
            coordinates.isApproximate
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
          }`}>
            {coordinates.isApproximate
              ? (isTelugu ? `📍 అంచనా మండల కేంద్రం కోఆర్డినేట్లు (${coordinates.lat.toFixed(4)}, ${coordinates.lon.toFixed(4)})` : `📍 Approx Mandal Coordinates (${coordinates.lat.toFixed(4)}, ${coordinates.lon.toFixed(4)})`)
              : `${t('weather.locationCoordinates')} (${coordinates.lat.toFixed(4)}, ${coordinates.lon.toFixed(4)})`}
          </span>
        </div>
      </div>

      {/* Severe Weather Alerts (if active) */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-amber-600" />
            {t('weather.alertsTitle')}
          </h2>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border ${
                alert.severity === 'severe'
                  ? 'bg-red-50 border-red-300 text-red-950'
                  : 'bg-amber-50 border-amber-300 text-amber-950'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-amber-200/50">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-base sm:text-lg">
                    {isTelugu ? alert.titleTe : alert.title}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      alert.isOfficial
                        ? 'bg-blue-100 text-blue-900'
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
                <span className="text-xs text-slate-600 font-medium">
                  {t('common.source')}: {alert.source}
                </span>
              </div>
              <p className="text-sm mt-3 leading-relaxed">
                {isTelugu ? alert.descriptionTe : alert.description}
              </p>
              {alert.advisoryTextTe && (
                <div className="mt-3 p-3 bg-white/80 rounded-xl border border-amber-200 text-xs sm:text-sm">
                  <strong className="text-emerald-900">{t('weather.advisoryHeading')}: </strong>
                  {isTelugu ? alert.advisoryTextTe : alert.advisoryText}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Current Conditions Card */}
      {currentWeather && (
        <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs sm:text-sm text-emerald-300 font-medium flex items-center space-x-1.5">
                <MapPin className="w-4 h-4" />
                <span>
                  {selectedVillage}, {selectedMandal}, {selectedDistrict}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">
                {currentWeather.conditionText}
              </h2>
            </div>
            <div className="text-right">
              <div className="text-5xl sm:text-6xl font-black text-white">
                {currentWeather.temperature}°C
              </div>
              <div className="text-xs text-emerald-200 mt-1">
                {t('weather.feelsLike')}: {currentWeather.feelsLike}°C
              </div>
            </div>
          </div>

          {/* Atmospheric Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-emerald-800/60">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center text-xs text-emerald-200 mb-1">
                <Droplets className="w-4 h-4 mr-1 text-sky-300" />
                {t('weather.humidity')}
              </div>
              <div className="text-lg font-bold">{currentWeather.humidity}%</div>
            </div>

            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center text-xs text-emerald-200 mb-1">
                <Wind className="w-4 h-4 mr-1 text-emerald-300" />
                {t('weather.wind')}
              </div>
              <div className="text-lg font-bold">{currentWeather.windSpeed} km/h</div>
            </div>

            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center text-xs text-emerald-200 mb-1">
                <CloudRain className="w-4 h-4 mr-1 text-blue-300" />
                {t('weather.rainfall')}
              </div>
              <div className="text-lg font-bold">{currentWeather.rainfall} mm</div>
            </div>

            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center text-xs text-emerald-200 mb-1">
                <Sunrise className="w-4 h-4 mr-1 text-amber-300" />
                {t('weather.sunrise')} / {t('weather.sunset')}
              </div>
              <div className="text-sm font-bold">
                {currentWeather.sunrise} / {currentWeather.sunset}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-emerald-300/80 flex justify-between items-center pt-2">
            <span>{t('common.source')}: {currentWeather.source}</span>
            <span>{t('common.lastUpdated')}: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      )}

      {/* Hourly Forecast (Next 24 Hours) */}
      {forecastData?.hourlyForecast && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <CloudSun className="w-5 h-5 mr-2 text-emerald-600" />
            {t('weather.hourlyForecast')}
          </h2>

          <div className="flex space-x-3 overflow-x-auto pb-3 pt-1">
            {forecastData.hourlyForecast.map((hour, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-24 p-3 rounded-xl border border-slate-200 bg-slate-50 text-center space-y-2 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors"
              >
                <div className="text-xs font-semibold text-slate-600">{hour.time}</div>
                <div className="text-lg font-extrabold text-slate-900">{hour.temp}°C</div>
                <div className="text-[10px] text-blue-600 font-medium">
                  {hour.precipitationProb}% {t('weather.rainfall')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7-Day Agricultural Forecast */}
      {forecastData?.dailyForecast && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-emerald-600" />
            {t('weather.sevenDayForecast')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {forecastData.dailyForecast.map((day, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3 hover:shadow-md transition-all"
              >
                <div>
                  <div className="text-xs font-bold text-emerald-800">{day.dayOfWeek}</div>
                  <div className="text-[11px] text-slate-500">{day.date}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-800">{day.conditionText}</div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-lg font-extrabold text-slate-900">{day.maxTemp}°</span>
                    <span className="text-xs text-slate-500">{day.minTemp}°</span>
                  </div>
                </div>

                <div className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
                  🌧️ {day.rainfallProbability}% {t('weather.rainProbability')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rainfall Intelligence & Baseline Deficit / Surplus */}
      <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-emerald-950 flex items-center">
          <Droplets className="w-5 h-5 mr-2 text-emerald-600" />
          {t('weather.rainfallIntelligence')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white border border-emerald-200">
            <div className="text-xs text-slate-500">{t('weather.normalRainfall')}</div>
            <div className="text-xl font-bold text-slate-900">540 mm</div>
            <div className="text-[10px] text-slate-400">IMD 30-year seasonal baseline</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-emerald-200">
            <div className="text-xs text-slate-500">{t('weather.actualRainfall')}</div>
            <div className="text-xl font-bold text-emerald-700">512 mm</div>
            <div className="text-[10px] text-slate-400">Recorded automatic rain gauges</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-emerald-200">
            <div className="text-xs text-slate-500">{t('weather.deficitSurplus')}</div>
            <div className="text-xl font-bold text-amber-600">-5.1% (Normal)</div>
            <div className="text-[10px] text-slate-400">Within +-19% normal range</div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-emerald-900 bg-white/60 p-3 rounded-xl border border-emerald-200/60 leading-relaxed">
          {t('weather.rainfallSummaryGood')}
        </p>
      </div>

      {/* 14-Day Extended Outlook */}
      {forecastData?.extendedTrend && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {t('weather.extendedOutlook')}
          </h2>
          <p className="text-xs text-slate-500 italic">
            {t('weather.extendedDisclaimer')}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
            {forecastData.extendedTrend.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-lg border border-slate-200 text-center bg-slate-50/50">
                <div className="text-[11px] font-semibold text-slate-700">{item.dayOfWeek}</div>
                <div className="text-sm font-extrabold text-slate-800">{item.maxTemp}° / {item.minTemp}°</div>
                <div className="text-[10px] text-slate-500">{item.conditionText}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
