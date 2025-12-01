// src/services/weather.js
const axios = require("axios");
const { getPlaceName } = require("./geocode");

// Погода по координатам с названием места
async function getWeatherByCoords(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,relativehumidity_2m,windspeed_10m` +
    `&forecast_days=1&timezone=auto`;

  const { data } = await axios.get(url, { timeout: 10000 });

  const t = data.hourly.temperature_2m[0];
  const h = data.hourly.relativehumidity_2m[0];
  const w = data.hourly.windspeed_10m[0];

  const place = await getPlaceName(lat, lon);

  return (
    `🌤 Погода: ${place}\n` +
    `🌡 Температура: ${t.toFixed(1)}°C\n` +
    `💧 Влажность: ${h}%\n` +
    `💨 Ветер: ${w} м/с`
  );
}

module.exports = { getWeatherByCoords };
