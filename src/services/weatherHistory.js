// src/services/weatherHistory.js

const fetch = require("node-fetch");
const { provider, providers } = require("../config/weatherProvider");
const { validateHistoryPoint } = require("../utils/validateHistoryPoint");

async function getYesterdayWeather(lat, lon, nowTs) {
  const cfg = providers?.[provider];

  if (!cfg) {
    console.error("[HISTORY][PROVIDER][FAIL] Unknown provider", { provider });
    return null;
  }

  if (!cfg.supports?.historical) {
    console.warn("[HISTORY][PROVIDER][SKIP] Historical not supported", {
      provider,
    });
    return null;
  }

  try {
    let point = null;

    if (cfg.type === "open_meteo") {
      point = await fetchOpenMeteo(lat, lon, nowTs, cfg.baseUrl);
    } else {
      console.error("[HISTORY][PROVIDER][FAIL] Unsupported provider type", {
        provider,
        type: cfg.type,
      });
      return null;
    }

    if (!point) {
      console.log("[HISTORY][FETCH][SKIP] No historical point returned");
      return null;
    }

    const v = validateHistoryPoint(point);
    if (!v.ok) {
      console.error("[HISTORY][CONTRACT][FAIL]", v.reason, point);
      return null;
    }

    return point;
  } catch (e) {
    console.error("[HISTORY][FETCH][FAIL]", e);
    return null;
  }
}

// ---------- Provider-specific mappers ----------

async function fetchOpenMeteo(lat, lon, nowTs, baseUrl) {
  // Target: yesterday at the same local time (UTC hour approximation)
  const yesterdayTs = nowTs - 24 * 60 * 60 * 1000;
  const date = new Date(yesterdayTs).toISOString().split("T")[0];
  const targetHour = new Date(yesterdayTs).getUTCHours();

  const url =
    `${baseUrl}` +
    `?latitude=${lat}` +
    `&longitude=${lon}` +
    `&start_date=${date}` +
    `&end_date=${date}` +
    `&hourly=` +
    `temperature_2m,apparent_temperature,relative_humidity_2m,` +
    `cloudcover,windspeed_10m`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error("[HISTORY][OPEN_METEO][HTTP_FAIL]", {
      status: res.status,
      statusText: res.statusText,
    });
    return null;
  }

  const data = await res.json();
  if (!data?.hourly?.time?.length) {
    console.error("[HISTORY][OPEN_METEO][DATA_FAIL] Missing hourly.time");
    return null;
  }

  const idx = data.hourly.time.findIndex(
    (t) => new Date(t).getUTCHours() === targetHour,
  );

  if (idx === -1) {
    console.error("[HISTORY][OPEN_METEO][DATA_FAIL] Target hour not found", {
      targetHour,
    });
    return null;
  }

  // Canonical contract
  return {
    ts: Date.parse(data.hourly.time[idx]),
    feelsLike: data.hourly.apparent_temperature?.[idx] ?? null,
    windSpeed: data.hourly.windspeed_10m?.[idx] ?? null,
    humidity: data.hourly.relative_humidity_2m?.[idx] ?? null,
    cloudCover: data.hourly.cloudcover?.[idx] ?? null,
  };
}

module.exports = { getYesterdayWeather };
