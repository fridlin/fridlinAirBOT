// src/services/weatherMicro.js

const axios = require("axios");
const { generateMicrogrid } = require("./geoGrid");

const DEV_LOG = true;
const HOUR_MS = 60 * 60 * 1000;

// ===========================
// API FETCH
// ===========================

async function getHourlyForMicrogrid(points) {
  if (DEV_LOG) {
    console.log("[DEV] Generating API requests for microgrid:", points);
  }

  const requests = points.map((p) => {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${p.lat}&longitude=${p.lon}` +
      `&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,cloudcover,precipitation` +
      `&forecast_days=1&timezone=auto`;

    return axios.get(url, { timeout: 10000 });
  });

  const responses = await Promise.all(requests);

  if (DEV_LOG) {
    console.log("[DEV] All microgrid responses received");
  }

  return responses.map((resp, i) => ({
    point: points[i].name,
    data: resp.data.hourly || {},
  }));
}

// ===========================
// MERGE MICROGRID (HOURLY RAW PHYSICS)
// ===========================

function mergeMicrogridData(gridData) {
  if (DEV_LOG) {
    console.log("[DEV] Merging hourly forecasts from microgrid…");
  }

  const ref = gridData[0]?.data || {};
  const temps = ref.temperature_2m || [];
  const hums = ref.relativehumidity_2m || [];
  const winds = ref.windspeed_10m || [];
  const clouds = ref.cloudcover || [];
  const prec = ref.precipitation || [];
  const times = Array.isArray(ref.time) ? ref.time : null;

  const hours = Math.min(
    temps.length,
    hums.length,
    winds.length,
    clouds.length,
    prec.length,
  );

  const result = [];
  const baseTs = Date.now();

  for (let i = 0; i < hours; i++) {
    let sumT = 0,
      sumH = 0,
      sumW = 0,
      sumC = 0,
      sumP = 0;

    for (const p of gridData) {
      sumT += p.data.temperature_2m?.[i] ?? 0;
      sumH += p.data.relativehumidity_2m?.[i] ?? 0;
      sumW += p.data.windspeed_10m?.[i] ?? 0;
      sumC += p.data.cloudcover?.[i] ?? 0;
      sumP += p.data.precipitation?.[i] ?? 0;
    }

    const temperature = sumT / gridData.length;
    const humidity = sumH / gridData.length;
    const windSpeed = sumW / gridData.length;
    const cloudCover = sumC / gridData.length;
    const precipitation = sumP / gridData.length;

    const time =
      times && typeof times[i] === "string"
        ? times[i]
        : new Date(baseTs + i * HOUR_MS).toISOString();

    result.push({
      ts: Date.parse(time),
      temperature,
      humidity,
      windSpeed,
      windGusts: null,
      cloudCover,
      precipitation,
      precipitationType: null,
      feelsLike: null,
    });
  }

  if (DEV_LOG) {
    console.log("[DEV] Merged hourly count:", result.length);
  }

  return result;
}

// ===========================
// MAIN
// ===========================

async function getMicroForecast(lat, lon) {
  if (DEV_LOG) {
    console.log("[DEV] Starting micro-forecast for:", lat, lon);
  }

  const grid = generateMicrogrid(lat, lon);

  if (DEV_LOG) {
    console.log("[DEV] Microgrid generated:", grid);
  }

  const gridData = await getHourlyForMicrogrid(grid);
  const hourly = mergeMicrogridData(gridData);

  if (DEV_LOG) {
    console.log(
      "[DEV] Micro-forecast completed. Hourly entries:",
      hourly.length,
    );
  }

  return hourly;
}

module.exports = {
  getHourlyForMicrogrid,
  mergeMicrogridData,
  getMicroForecast,
};
