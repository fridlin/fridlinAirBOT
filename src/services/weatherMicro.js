const axios = require("axios");
const { generateMicrogrid } = require("./geoGrid");

// Enable detailed debug logs (true/false)
const DEV_LOG = true;

// Get hourly forecasts for all 5 points in the microgrid
async function getHourlyForMicrogrid(points) {
  if (DEV_LOG)
    console.log("[DEV] Generating API requests for microgrid:", points);

  const requests = points.map((p) => {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${p.lat}&longitude=${p.lon}` +
      `&hourly=temperature_2m,relativehumidity_2m,windspeed_10m` +
      `&forecast_days=1&timezone=auto`;

    return axios.get(url, { timeout: 10000 });
  });

  const responses = await Promise.all(requests);

  if (DEV_LOG) console.log("[DEV] All microgrid responses received");

  return responses.map((resp, i) => ({
    point: points[i].name,
    data: resp.data.hourly,
  }));
}

// Merge (average) the 5 microgrid forecasts into a single hourly forecast
function mergeMicrogridData(gridData) {
  if (DEV_LOG) console.log("[DEV] Merging hourly forecasts from microgrid…");

  const hours = gridData[0].data.time.length;
  const result = [];

  for (let i = 0; i < hours; i++) {
    let sumT = 0,
      sumH = 0,
      sumW = 0;

    for (const p of gridData) {
      sumT += p.data.temperature_2m[i];
      sumH += p.data.relativehumidity_2m[i];
      sumW += p.data.windspeed_10m[i];
    }

    result.push({
      time: gridData[0].data.time[i],
      temperature: sumT / gridData.length,
      humidity: sumH / gridData.length,
      windspeed: sumW / gridData.length,
    });
  }

  if (DEV_LOG) console.log("[DEV] Merged hourly count:", result.length);

  return result;
}

// Turn hourly forecast into 15-minute forecast with linear interpolation
function interpolate15min(hourlyData) {
  if (DEV_LOG) console.log("[DEV] Interpolating 15-min forecast…");

  const result = [];

  for (let i = 0; i < hourlyData.length - 1; i++) {
    const cur = hourlyData[i];
    const next = hourlyData[i + 1];

    result.push({
      time: cur.time,
      temperature: cur.temperature,
      humidity: cur.humidity,
      windspeed: cur.windspeed,
    });

    const dT = (next.temperature - cur.temperature) / 4;
    const dH = (next.humidity - cur.humidity) / 4;
    const dW = (next.windspeed - cur.windspeed) / 4;

    for (let step = 1; step < 4; step++) {
      result.push({
        time: addMinutes(cur.time, 15 * step),
        temperature: cur.temperature + dT * step,
        humidity: cur.humidity + dH * step,
        windspeed: cur.windspeed + dW * step,
      });
    }
  }

  if (DEV_LOG) console.log("[DEV] Interpolated 15-min count:", result.length);

  return result;
}

// Add minutes to ISO time string
function addMinutes(timeStr, minutes) {
  const date = new Date(timeStr);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}

// Main micro-forecast function
async function getMicroForecast(lat, lon) {
  if (DEV_LOG) console.log("[DEV] Starting micro-forecast for:", lat, lon);

  const grid = generateMicrogrid(lat, lon);

  if (DEV_LOG) console.log("[DEV] Microgrid generated:", grid);

  const gridData = await getHourlyForMicrogrid(grid);
  const hourly = mergeMicrogridData(gridData);
  const forecast15 = interpolate15min(hourly);

  if (DEV_LOG)
    console.log(
      "[DEV] Micro-forecast completed. Total entries:",
      forecast15.length,
    );

  return forecast15;
}

module.exports = {
  getHourlyForMicrogrid,
  mergeMicrogridData,
  interpolate15min,
  getMicroForecast,
};
