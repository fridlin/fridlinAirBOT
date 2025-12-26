// src/utils/analyzeForecastWindow.js

/**
 * Analyze forecast window for trends and alerts.
 *
 * INPUT:
 * - Array of forecast points
 * - Each point MUST have: ts (number)
 *
 * OUTPUT:
 * - Same array length
 * - Enriched with:
 *   - trend
 *   - alerts
 */

function trendFromNow(now, value, eps = 0.01) {
  if (typeof value !== "number") return "stable";
  if (Math.abs(value - now) <= eps) return "stable";
  return value > now ? "up" : "down";
}

function pctDelta(prev, curr) {
  if (typeof prev !== "number" || typeof curr !== "number") return 0;
  if (prev === 0) return 0;
  return Math.abs((curr - prev) / prev);
}

const JUMP_THRESHOLDS = {
  temperature: 0.15,
  feelsLike: 0.2,
  wind: 0.3,
};

module.exports = function analyzeForecastWindow(points) {
  if (!Array.isArray(points) || points.length === 0) {
    return null;
  }

  // HARD VALIDATION
  if (!points.every((p) => typeof p.ts === "number")) {
    console.error("[ANALYZE][FAIL] invalid ts in points");
    return null;
  }

  const now = points[0];

  return points.map((p, i) => {
    const prev = points[i - 1] || p;

    const trend = {
      temperature: trendFromNow(now.temperature, p.temperature),
      feelsLike: trendFromNow(now.feelsLike, p.feelsLike),
      wind: trendFromNow(now.windSpeed ?? 0, p.windSpeed ?? 0),
    };

    const reasons = [];

    if (
      pctDelta(prev.temperature, p.temperature) >= JUMP_THRESHOLDS.temperature
    ) {
      reasons.push("temperature_jump");
    }

    if (pctDelta(prev.feelsLike, p.feelsLike) >= JUMP_THRESHOLDS.feelsLike) {
      reasons.push("feelslike_jump");
    }

    if (
      pctDelta(prev.windSpeed ?? 0, p.windSpeed ?? 0) >= JUMP_THRESHOLDS.wind
    ) {
      reasons.push("wind_spike");
    }

    return {
      ...p,
      trend,
      alerts: {
        warning: reasons.length > 0,
        reasons,
      },
    };
  });
};
