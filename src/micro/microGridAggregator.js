// src/micro/microGridAggregator.js

/**
 * Aggregate aligned microgrid forecasts by averaging values.
 *
 * Input:
 * - Array of arrays of forecast points
 * - All points MUST be aligned by ts
 */

function avg(values) {
  const nums = values.filter((v) => typeof v === "number");
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function aggregateMicrogridForecast(gridForecasts) {
  if (!Array.isArray(gridForecasts) || gridForecasts.length === 0) {
    return null;
  }

  const base = gridForecasts[0];
  if (!Array.isArray(base)) return null;

  return base
    .map((_, i) => {
      const slice = gridForecasts.map((g) => g[i]).filter(Boolean);
      if (slice.length === 0) return null;

      return {
        ts: slice[0].ts,

        temperature: avg(slice.map((p) => p.temperature)),
        feelsLike: null,

        windSpeed: avg(slice.map((p) => p.windSpeed)),
        windGusts: avg(slice.map((p) => p.windGusts)),

        humidity: avg(slice.map((p) => p.humidity)),
        cloudCover: avg(slice.map((p) => p.cloudCover)),

        precipitation: avg(slice.map((p) => p.precipitation)),
        precipitationType: null,
      };
    })
    .filter(Boolean);
}

module.exports = {
  aggregateMicrogridForecast,
};
