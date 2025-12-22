// src/services/weather.js
// All comments in English, as agreed

const axios = require("axios");
const { getPlaceName } = require("./geocode");

/**
 * Get current weather by coordinates with place name
 * Provides raw weather inputs for display and further logic (warnings, feels-like, etc.)
 *
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<string>}
 */
async function getWeatherByCoords(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,relativehumidity_2m,windspeed_10m` +
    `&forecast_days=1&timezone=auto`;

  const { data } = await axios.get(url, { timeout: 10000 });

  // NOTE:
  // FeelsLike calculation will be added here later.
  // This service provides raw weather inputs (temperature, humidity, wind)
  // for both simple weather output and warning logic.

  const temperature = data.hourly.temperature_2m[0];
  const humidity = data.hourly.relativehumidity_2m[0];
  const windSpeed = data.hourly.windspeed_10m[0];

  const place = await getPlaceName(lat, lon);

  return (
    `🌤 Погода: ${place}\n` +
    `🌡 Температура: ${temperature.toFixed(1)}°C\n` +
    `💧 Влажность: ${humidity}%\n` +
    `💨 Ветер: ${windSpeed} м/с`
  );
}

module.exports = {
  getWeatherByCoords,
};
