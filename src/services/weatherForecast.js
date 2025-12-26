// src/services/weatherForecast.js

const axios = require("axios");
const { provider, providers } = require("../config/forecastProvider");
const { validateForecastPoint } = require("../utils/validateForecastPoint");

async function getForecast(lat, lon) {
  console.log("[FORECAST][START]", { lat, lon, provider });

  const cfg = providers?.[provider];
  if (!cfg || !cfg.supports?.forecast) {
    console.error("[FORECAST][FAIL] provider invalid", { provider });
    return null;
  }

  try {
    if (cfg.type !== "open_meteo") return null;

    const url =
      `${cfg.baseUrl}` +
      `?latitude=${lat}` +
      `&longitude=${lon}` +
      `&hourly=` +
      [
        "temperature_2m",
        "relative_humidity_2m",
        "cloudcover",
        "windspeed_10m",
        "windgusts_10m",
        "precipitation",
      ].join(",");

    const { data } = await axios.get(url, { timeout: 10000 });
    const h = data?.hourly;
    if (!h || !Array.isArray(h.time)) return null;

    const points = h.time.map((t, i) => {
      const p = {
        ts: Date.parse(t),

        temperature: h.temperature_2m?.[i] ?? null,
        feelsLike: null,

        windSpeed: h.windspeed_10m?.[i] ?? null,
        windGusts: h.windgusts_10m?.[i] ?? null,

        humidity: h.relative_humidity_2m?.[i] ?? null,
        cloudCover: h.cloudcover?.[i] ?? null,

        precipitation: h.precipitation?.[i] ?? null,
        precipitationType: null,
      };

      return validateForecastPoint(p).ok ? p : null;
    });

    const valid = points.filter(Boolean);

    console.log("[FORECAST][DONE]", {
      total: points.length,
      valid: valid.length,
    });

    return valid;
  } catch (e) {
    console.error("[FORECAST][ERROR]", e.message);
    return null;
  }
}

module.exports = { getForecast };
