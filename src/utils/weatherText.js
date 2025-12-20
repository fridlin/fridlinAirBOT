// src/utils/weatherText.js

const RAIN_THRESHOLD = 40;
const CLOUD_THRESHOLD = 60;

function getWeatherText(point) {
  if ((point.precipitation?.probability ?? 0) >= RAIN_THRESHOLD) {
    return "rain";
  }

  if ((point.cloudCover ?? 0) >= CLOUD_THRESHOLD) {
    return "cloudy";
  }

  return "clear";
}

module.exports = { getWeatherText };
