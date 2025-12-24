// src/services/weatherMicro.js

const axios = require("axios");
const { generateMicrogrid } = require("./geoGrid");
const { calculateFeelsLike } = require("./feelsLike");

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
      `&hourly=temperature_2m,relativehumidity_2m,windspeed_10m` +
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
// MERGE MICROGRID
// ===========================

function mergeMicrogridData(gridData) {
  if (DEV_LOG) {
    console.log("[DEV] Merging hourly forecasts from microgrid…");
  }

  const ref = gridData[0]?.data || {};
  const temps = ref.temperature_2m || [];
  const hums = ref.relativehumidity_2m || [];
  const winds = ref.windspeed_10m || [];
  const times = Array.isArray(ref.time) ? ref.time : null;

  const hours = Math.min(temps.length, hums.length, winds.length);
  const result = [];

  const baseTs = Date.now();

  for (let i = 0; i < hours; i++) {
    let sumT = 0;
    let sumH = 0;
    let sumW = 0;

    for (const p of gridData) {
      sumT += p.data.temperature_2m?.[i] ?? 0;
      sumH += p.data.relativehumidity_2m?.[i] ?? 0;
      sumW += p.data.windspeed_10m?.[i] ?? 0;
    }

    const temperature = sumT / gridData.length;
    const humidity = sumH / gridData.length;
    const windspeed = sumW / gridData.length;

    const time =
      times && typeof times[i] === "string"
        ? times[i]
        : new Date(baseTs + i * HOUR_MS).toISOString();

    result.push({
      time,
      temperature,
      humidity,
      windspeed,
      feelsLike: calculateFeelsLike({
        temperature,
        humidity,
        windSpeed: windspeed,
        windGusts: null,
        clouds: false,
        precipitation: "none",
      }),
    });
  }

  if (DEV_LOG) {
    console.log("[DEV] Merged hourly count:", result.length);
  }

  return result;
}

// ===========================
// INTERPOLATION (15 MIN)
// ===========================

function interpolate15min(hourlyData) {
  if (DEV_LOG) {
    console.log("[DEV] Interpolating 15-min forecast…");
  }

  const result = [];

  for (let i = 0; i < hourlyData.length - 1; i++) {
    const cur = hourlyData[i];
    const next = hourlyData[i + 1];

    const curTs = new Date(cur.time).getTime();
    const nextTs = new Date(next.time).getTime();

    if (!Number.isFinite(curTs) || !Number.isFinite(nextTs)) {
      continue;
    }

    result.push({
      time: new Date(curTs).toISOString(),
      temperature: cur.temperature,
      humidity: cur.humidity,
      windspeed: cur.windspeed,
      feelsLike: cur.feelsLike,
    });

    const dT = (next.temperature - cur.temperature) / 4;
    const dH = (next.humidity - cur.humidity) / 4;
    const dW = (next.windspeed - cur.windspeed) / 4;

    for (let step = 1; step < 4; step++) {
      const ts = curTs + step * 15 * 60 * 1000;

      result.push({
        time: new Date(ts).toISOString(),
        temperature: cur.temperature + dT * step,
        humidity: cur.humidity + dH * step,
        windspeed: cur.windspeed + dW * step,
        feelsLike: calculateFeelsLike({
          temperature: cur.temperature + dT * step,
          humidity: cur.humidity + dH * step,
          windSpeed: cur.windspeed + dW * step,
          windGusts: null,
          clouds: false,
          precipitation: "none",
        }),
      });
    }
  }

  if (DEV_LOG) {
    console.log("[DEV] Interpolated 15-min count:", result.length);
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
  const forecast15 = interpolate15min(hourly);

  if (DEV_LOG) {
    console.log(
      "[DEV] Micro-forecast completed. Total entries:",
      forecast15.length,
    );
  }

  return forecast15;
}

module.exports = {
  getHourlyForMicrogrid,
  mergeMicrogridData,
  interpolate15min,
  getMicroForecast,
};
