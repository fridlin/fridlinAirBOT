// src/micro/microGridAggregator.js

// ==================================================
// MICROGRID AGGREGATION
// Responsibility:
// - merge multiple forecast points (microgrid)
// - average values for each timestamp
// - NO API calls
// - NO interpolation
// - NO feels-like calculation
// ==================================================

/**
 * Aggregates forecast points from multiple microgrid locations.
 * All input points MUST be already in canonical forecast format.
 *
 * @param {Array<Array<Object>>} gridForecasts
 *   Example:
 *   [
 *     [ { ts, temperature, windSpeed, ... }, ... ], // center
 *     [ { ts, temperature, windSpeed, ... }, ... ], // north
 *     ...
 *   ]
 *
 * @returns {Array<Object>} averaged forecast points
 */
function aggregateMicrogridForecast(gridForecasts) {
  console.log("[MICRO][GRID][START]");

  if (!Array.isArray(gridForecasts) || gridForecasts.length === 0) {
    console.error("[MICRO][GRID][FAIL] gridForecasts is empty");
    return null;
  }

  const pointsCount = gridForecasts.length;
  console.log("[MICRO][GRID][INFO] grid points:", pointsCount);

  // Use first grid point as time reference
  const reference = gridForecasts[0];

  if (!Array.isArray(reference) || reference.length === 0) {
    console.error("[MICRO][GRID][FAIL] reference forecast is empty");
    return null;
  }

  const result = [];

  for (let i = 0; i < reference.length; i++) {
    const ts = reference[i].ts;

    let sum = {
      temperature: 0,
      feelsLike: 0,
      windSpeed: 0,
      windGusts: 0,
      humidity: 0,
      cloudCover: 0,
      precipitation: 0,
    };

    let count = {
      temperature: 0,
      feelsLike: 0,
      windSpeed: 0,
      windGusts: 0,
      humidity: 0,
      cloudCover: 0,
      precipitation: 0,
    };

    for (const grid of gridForecasts) {
      const p = grid[i];
      if (!p || p.ts !== ts) continue;

      if (typeof p.temperature === "number") {
        sum.temperature += p.temperature;
        count.temperature++;
      }

      if (typeof p.feelsLike === "number") {
        sum.feelsLike += p.feelsLike;
        count.feelsLike++;
      }

      if (typeof p.windSpeed === "number") {
        sum.windSpeed += p.windSpeed;
        count.windSpeed++;
      }

      if (typeof p.windGusts === "number") {
        sum.windGusts += p.windGusts;
        count.windGusts++;
      }

      if (typeof p.humidity === "number") {
        sum.humidity += p.humidity;
        count.humidity++;
      }

      if (typeof p.cloudCover === "number") {
        sum.cloudCover += p.cloudCover;
        count.cloudCover++;
      }

      if (typeof p.precipitation === "number") {
        sum.precipitation += p.precipitation;
        count.precipitation++;
      }
    }

    result.push({
      ts,

      temperature:
        count.temperature > 0 ? sum.temperature / count.temperature : null,

      feelsLike: count.feelsLike > 0 ? sum.feelsLike / count.feelsLike : null,

      windSpeed: count.windSpeed > 0 ? sum.windSpeed / count.windSpeed : null,

      windGusts: count.windGusts > 0 ? sum.windGusts / count.windGusts : null,

      humidity: count.humidity > 0 ? sum.humidity / count.humidity : null,

      cloudCover:
        count.cloudCover > 0 ? sum.cloudCover / count.cloudCover : null,

      precipitation:
        count.precipitation > 0
          ? sum.precipitation / count.precipitation
          : null,

      precipitationType: null,
    });
  }

  console.log("[MICRO][GRID][DONE] points:", result.length);
  console.warn("[MICRO][GRID][ASSUME] all grids aligned by ts");

  return result;
}

module.exports = {
  aggregateMicrogridForecast,
};
