// src/micro/interpolateForecast.js

// ==================================================
// INTERPOLATION (HOURLY → 15 MIN)
// ==================================================

/**
 * Interpolates hourly forecast into 15-minute steps.
 * Input forecast MUST be in canonical format and sorted by ts asc.
 *
 * @param {Array<Object>} hourlyForecast
 * @returns {Array<Object>} 15-min interpolated forecast (raw physics only)
 */
function interpolateForecast15min(hourlyForecast) {
  console.log("[MICRO][INTERPOLATE][START]");

  if (!Array.isArray(hourlyForecast) || hourlyForecast.length < 2) {
    console.error(
      "[MICRO][INTERPOLATE][FAIL] hourlyForecast must contain at least 2 points",
    );
    return null;
  }

  const result = [];

  for (let i = 0; i < hourlyForecast.length - 1; i++) {
    const cur = hourlyForecast[i];
    const next = hourlyForecast[i + 1];

    if (!isValidPoint(cur) || !isValidPoint(next)) {
      console.error("[MICRO][INTERPOLATE][SKIP] invalid points", {
        cur,
        next,
      });
      continue;
    }

    const dt = next.ts - cur.ts;
    if (dt <= 0) {
      console.error("[MICRO][INTERPOLATE][SKIP] non-increasing ts", {
        curTs: cur.ts,
        nextTs: next.ts,
      });
      continue;
    }

    // Push current hour point (raw)
    result.push(buildPoint(cur));

    // Interpolate 3 intermediate 15-min points
    for (let step = 1; step <= 3; step++) {
      const ratio = step / 4;
      const ts = cur.ts + ratio * dt;

      const interpolated = interpolatePoint(cur, next, ratio, ts);
      result.push(interpolated);
    }
  }

  console.log("[MICRO][INTERPOLATE][DONE] points:", result.length);

  return result;
}

// ==================================================
// HELPERS
// ==================================================

function isValidPoint(p) {
  return p && typeof p.ts === "number" && Number.isFinite(p.ts);
}

function buildPoint(p) {
  return {
    ...p,
    feelsLike: null,
  };
}

function interpolateValue(a, b, ratio) {
  if (typeof a !== "number" || typeof b !== "number") return null;
  return a + (b - a) * ratio;
}

function interpolatePoint(cur, next, ratio, ts) {
  return {
    ts,

    temperature: interpolateValue(cur.temperature, next.temperature, ratio),

    windSpeed: interpolateValue(cur.windSpeed, next.windSpeed, ratio),

    windGusts: interpolateValue(cur.windGusts, next.windGusts, ratio),

    humidity: interpolateValue(cur.humidity, next.humidity, ratio),

    cloudCover: interpolateValue(cur.cloudCover, next.cloudCover, ratio),

    precipitation: interpolateValue(
      cur.precipitation,
      next.precipitation,
      ratio,
    ),

    precipitationType: null,

    feelsLike: null,
  };
}

module.exports = {
  interpolateForecast15min,
};
