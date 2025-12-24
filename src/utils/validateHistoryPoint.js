// src/utils/validateHistoryPoint.js

function isNum(x) {
  return typeof x === "number" && Number.isFinite(x);
}

function inRange(x, min, max) {
  return isNum(x) && x >= min && x <= max;
}

function validateHistoryPoint(p) {
  if (!p || !isNum(p.ts)) return { ok: false, reason: "missing_ts" };

  // Allow nulls, but validate ranges when present
  if (p.feelsLike != null && !inRange(p.feelsLike, -80, 80)) {
    return { ok: false, reason: "bad_feelsLike" };
  }
  if (p.windSpeed != null && !inRange(p.windSpeed, 0, 200)) {
    return { ok: false, reason: "bad_windSpeed" };
  }
  if (p.humidity != null && !inRange(p.humidity, 0, 100)) {
    return { ok: false, reason: "bad_humidity" };
  }
  if (p.cloudCover != null && !inRange(p.cloudCover, 0, 100)) {
    return { ok: false, reason: "bad_cloudCover" };
  }

  return { ok: true };
}

module.exports = { validateHistoryPoint };
