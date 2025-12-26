// src/micro/applySensitivityLayer.js

/**
 * Applies Sensitivity Layer to raw forecast points.
 *
 * RULES:
 * - Single place where feelsLike is calculated
 * - No formatting
 * - No UI
 */

const { calculateFeelsLike } = require("./calculateFeelsLike");

/**
 * @param {Array<Object>} points
 * @returns {Array<Object>|null}
 */
function applySensitivityLayer(points) {
  if (!Array.isArray(points) || points.length === 0) {
    console.error("[SENSITIVITY][FAIL] points must be non-empty array");
    return null;
  }

  const out = [];

  for (const p of points) {
    if (!p || typeof p.ts !== "number" || !Number.isFinite(p.ts)) {
      console.error("[SENSITIVITY][SKIP] invalid point.ts", p);
      continue;
    }

    const feelsLike = calculateFeelsLike({
      temperature: p.temperature,
      humidity: p.humidity,
      windSpeed: p.windSpeed,
      windGusts: p.windGusts ?? null,
      clouds: typeof p.cloudCover === "number" ? p.cloudCover > 50 : false,
      precipitation:
        typeof p.precipitation === "number" && p.precipitation > 0
          ? "rain"
          : "none",
    });

    out.push({
      ...p,
      feelsLike,
    });
  }

  if (out.length === 0) {
    console.error("[SENSITIVITY][FAIL] all points rejected");
    return null;
  }

  return out;
}

module.exports = {
  applySensitivityLayer,
};
