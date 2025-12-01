// src/services/geocode.js
const axios = require("axios");

// Возвращает название места по координатам или "это место" при ошибке
async function getPlaceName(lat, lon) {
  console.log("getPlaceName called with:", lat, lon);

  const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}`;

  try {
    const { data } = await axios.get(url, { timeout: 10000 });

    if (data && data.results && data.results.length > 0) {
      return data.results[0].name; // Haifa, Tel Aviv, Carmel Beach и т.п.
    }

    return "это место";
  } catch (error) {
    console.error("Reverse geocoding error:", error.message || error);
    // Не роняем бота, просто даём дефолтное название
    return "это место";
  }
}

module.exports = { getPlaceName };
