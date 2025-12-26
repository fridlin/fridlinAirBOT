// src/ui/recommendations.js

/**
 * UX recommendations only
 *
 * RULES:
 * - No logic thresholds
 * - No i18n
 * - Static mapping from reason.type → advice lines
 */

const MAP = {
  feelslike_noticeable: ["Dress according to how it feels, not the number"],

  wind_noticeable: ["Consider a windproof jacket"],

  rain_now: ["Umbrella or waterproof shoes recommended"],

  humidity_high: ["Light clothing and water recommended"],

  humidity_low: ["Dry air – lip balm may help"],

  // Future keys (when enabled in checkWarnings):
  rain_future: ["Umbrella might be needed soon"],
  wind_future: ["Wind may increase soon – consider an extra layer"],
  humidity_future: ["Humidity may change soon – sensitive people may notice"],
};

function getRecommendations(reasons = []) {
  if (!Array.isArray(reasons) || reasons.length === 0) return [];

  const out = [];
  const seen = new Set();

  for (const r of reasons) {
    const type = r?.type;
    if (!type) continue;

    const list = MAP[type];
    if (!Array.isArray(list)) continue;

    for (const line of list) {
      if (typeof line !== "string") continue;
      if (seen.has(line)) continue;
      seen.add(line);
      out.push(line);
    }
  }

  return out;
}

module.exports = { getRecommendations };
