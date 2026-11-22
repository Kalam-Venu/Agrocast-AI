import { db } from '../../lib/supabase/db';

export const weatherService = {
  getCurrentWeather: async (lat, lon, lang = 'te') => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m&daily=sunrise,sunset&timezone=Asia%2FKolkata`;
      const res = await fetch(url, { next: { revalidate: 300 } });
      if (res.ok) {
        const data = await res.json();
        const current = data.current || {};
        const daily = data.daily || {};
        return {
          temperature: Math.round(current.temperature_2m ?? 31),
          feelsLike: Math.round(current.apparent_temperature ?? 33),
          humidity: current.relative_humidity_2m ?? 65,
          weatherCode: current.weather_code ?? 0,
          rainfall: current.rain ?? current.precipitation ?? 0,
          precipitationProbability: current.relative_humidity_2m > 80 ? 60 : 15,
          windSpeed: Math.round(current.wind_speed_10m ?? 12),
          windDirection: `${current.wind_direction_10m ?? 180}°`,
          sunrise: daily.sunrise?.[0] ? daily.sunrise[0].split('T')[1].slice(0, 5) : '06:12',
          sunset: daily.sunset?.[0] ? daily.sunset[0].split('T')[1].slice(0, 5) : '17:48',
          source: 'Open-Meteo High-Resolution API',
          timestamp: current.time || new Date().toISOString(),
        };
      }
    } catch (e) {
      console.warn('Live weather service failed, using baseline:', e.message);
    }

    return {
      temperature: 31,
      feelsLike: 33,
      humidity: 68,
      weatherCode: 2,
      rainfall: 0,
      precipitationProbability: 20,
      windSpeed: 14,
      windDirection: '160°',
      sunrise: '06:14',
      sunset: '17:50',
      source: 'AgroCast Weather Baseline (Fallback)',
      timestamp: new Date().toISOString(),
    };
  },

  getAlerts: async (district) => {
    const alerts = await db.getWeatherAlerts();
    if (!district) return alerts;
    return alerts.filter(
      (a) => a.affectedLocations.includes('All') || a.affectedLocations.some((loc) => loc.toLowerCase() === district.toLowerCase())
    );
  },

  getHistoricalRainfall: async (district = 'Guntur') => {
    return {
      district,
      seasonalNormalMm: 540,
      actualReceivedMm: 512,
      variancePercentage: -5.1,
      status: 'Normal',
      interpretationTe: 'వర్షపాతం సాధారణ స్థాయిలో ఉంది (-19% నుండి +19% పరిధిలో ఉంది). పంటల పెరుగుదలకు అనుకూలం.',
      interpretationEn: 'Rainfall is in the normal range (-19% to +19%). Suitable for vegetative growth.',
    };
  },
};
