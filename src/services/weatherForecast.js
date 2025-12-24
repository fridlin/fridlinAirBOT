// src/services/weatherForecast.js

const axios = require("axios");
const { provider, providers } = require("../config/forecastProvider");
const { validateForecastPoint } = require("../utils/validateForecastPoint");

// ==================================================
// PUBLIC API
// ==================================================

async function getForecast(lat, lon) {
  console.log("[FORECAST][START]", { lat, lon, provider });

  const cfg = providers?.[provider];

  if (!cfg) {
    console.error("[FORECAST][PROVIDER][FAIL] Unknown provider", { provider });
    return null;
  }

  if (!cfg.supports?.forecast) {
    console.error("[FORECAST][PROVIDER][FAIL] Forecast not supported", {
      provider,
    });
    return null;
  }

  try {
    let points = null;

    if (cfg.type === "open_meteo") {
      points = await fetchOpenMeteoForecast(lat, lon, cfg.baseUrl);
    } else {
      console.error("[FORECAST][PROVIDER][FAIL] Unsupported provider type", {
        provider,
        type: cfg.type,
      });
      return null;
    }

    if (!Array.isArray(points) || points.length === 0) {
      console.error("[FORECAST][DATA][FAIL] Empty forecast array");
      return null;
    }

    const valid = [];
    let rejected = 0;

    for (const p of points) {
      const v = validateForecastPoint(p);
      if (!v.ok) {
        rejected++;
        console.error("[FORECAST][CONTRACT][FAIL]", v.reason, p);
        continue;
      }
      valid.push(p);
    }

    console.log("[FORECAST][DONE]", {
      total: points.length,
      valid: valid.length,
      rejected,
    });

    return valid;
  } catch (err) {
    console.error("[FORECAST][FAIL]", err.message || err);
    return null;
  }
}

// ==================================================
// PROVIDER: OPEN-METEO
// ==================================================

async function fetchOpenMeteoForecast(lat, lon, baseUrl) {
  console.log("[FORECAST][OPEN_METEO][FETCH]", { lat, lon });

  const url =
    `${baseUrl}` +
    `?latitude=${lat}` +
    `&longitude=${lon}` +
    `&hourly=` +
    [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "cloudcover",
      "windspeed_10m",
      "windgusts_10m",
      "precipitation",
    ].join(",");

  let response;
  try {
    response = await axios.get(url, { timeout: 10000 });
  } catch (err) {
    console.error("[FORECAST][OPEN_METEO][HTTP_FAIL]", err.message || err);
    return null;
  }

  const hourly = response?.data?.hourly;

  if (!hourly || !Array.isArray(hourly.time)) {
    console.error("[FORECAST][OPEN_METEO][DATA_FAIL] Missing hourly.time");
    return null;
  }

  console.log("[FORECAST][OPEN_METEO][DATA]", {
    points: hourly.time.length,
  });

  return hourly.time.map((t, i) => ({
    ts: Date.parse(t),

    temperature: hourly.temperature_2m?.[i] ?? null,
    feelsLike: hourly.apparent_temperature?.[i] ?? null,

    windSpeed: hourly.windspeed_10m?.[i] ?? null,
    windGusts: hourly.windgusts_10m?.[i] ?? null,

    humidity: hourly.relative_humidity_2m?.[i] ?? null,
    cloudCover: hourly.cloudcover?.[i] ?? null,

    precipitation: hourly.precipitation?.[i] ?? null,
    precipitationType: null,
  }));
}

module.exports = {
  getForecast,
};
