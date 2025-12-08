const axios = require("axios");

/*
  Raw version of micro-forecast:
  - fetch microgrid
  - fetch hourly for each point
  - merge hourly
  - interpolate 15m

  Returns all stages:
  {
    raw: [ { pointName, hourly } ],
    merged: [ hourly entries ],
    interpolated: [ 15m entries ]
  }
*/

function generateMicroGrid(lat, lon) {
  return [
    { name: "center", lat, lon },
    { name: "north", lat: lat + 0.01, lon },
    { name: "south", lat: lat - 0.01, lon },
    { name: "east", lat, lon: lon + 0.01 },
    { name: "west", lat, lon: lon - 0.01 },
  ];
}

async function fetchHourly(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,relativehumidity_2m,windspeed_10m` +
    `&forecast_days=1&timezone=auto`;

  const { data } = await axios.get(url, { timeout: 10000 });

  const result = [];
  for (let i = 0; i < data.hourly.time.length; i++) {
    result.push({
      time: data.hourly.time[i],
      temperature: data.hourly.temperature_2m[i],
      humidity: data.hourly.relativehumidity_2m[i],
      windspeed: data.hourly.windspeed_10m[i],
    });
  }
  return result;
}

function mergeHourlyData(raw) {
  // simple averaging
  const length = raw[0].hourly.length;
  const merged = [];

  for (let i = 0; i < length; i++) {
    let t = 0,
      h = 0,
      w = 0;

    for (const p of raw) {
      t += p.hourly[i].temperature;
      h += p.hourly[i].humidity;
      w += p.hourly[i].windspeed;
    }

    merged.push({
      time: raw[0].hourly[i].time,
      temperature: t / raw.length,
      humidity: h / raw.length,
      windspeed: w / raw.length,
    });
  }

  return merged;
}

function interpolate15m(merged) {
  const out = [];

  for (let i = 0; i < merged.length - 1; i++) {
    const A = merged[i];
    const B = merged[i + 1];

    const tA = new Date(A.time).getTime();
    const tB = new Date(B.time).getTime();
    const step = (tB - tA) / 4; // 15-minute steps

    for (let k = 0; k < 4; k++) {
      const ts = tA + k * step;
      const ratio = k / 4;

      out.push({
        time: new Date(ts).toISOString().slice(0, 16),
        temperature: A.temperature + (B.temperature - A.temperature) * ratio,
        humidity: A.humidity + (B.humidity - A.humidity) * ratio,
        windspeed: A.windspeed + (B.windspeed - A.windspeed) * ratio,
      });
    }
  }

  return out;
}

async function getMicroForecastRaw(lat, lon) {
  const grid = generateMicroGrid(lat, lon);

  const raw = [];
  for (const point of grid) {
    const hourly = await fetchHourly(point.lat, point.lon);
    raw.push({ point: point.name, hourly });
  }

  const merged = mergeHourlyData(raw);
  const interpolated = interpolate15m(merged);

  return { raw, merged, interpolated };
}

module.exports = {
  getMicroForecastRaw,
  generateMicroGrid,
};
