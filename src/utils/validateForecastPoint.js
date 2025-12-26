// src/utils/validateForecastPoint.js

function isNum(x) {
  return typeof x === "number" && Number.isFinite(x);
}

function inRange(x, min, max) {
  return isNum(x) && x >= min && x <= max;
}

function validateForecastPoint(p) {
  if (!p || !isNum(p.ts)) {
    return { ok: false, reason: "missing_ts" };
  }

  if (p.temperature != null && !inRange(p.temperature, -80, 80))
    return { ok: false, reason: "bad_temperature" };

  if (p.feelsLike != null && !inRange(p.feelsLike, -80, 80))
    return { ok: false, reason: "bad_feelsLike" };

  if (p.windSpeed != null && !inRange(p.windSpeed, 0, 200))
    return { ok: false, reason: "bad_windSpeed" };

  if (p.windGusts != null && !inRange(p.windGusts, 0, 300))
    return { ok: false, reason: "bad_windGusts" };

  if (p.humidity != null && !inRange(p.humidity, 0, 100))
    return { ok: false, reason: "bad_humidity" };

  if (p.cloudCover != null && !inRange(p.cloudCover, 0, 100))
    return { ok: false, reason: "bad_cloudCover" };

  if (p.precipitation != null && !inRange(p.precipitation, 0, 500))
    return { ok: false, reason: "bad_precipitation" };

  return { ok: true };
}

module.exports = { validateForecastPoint };
