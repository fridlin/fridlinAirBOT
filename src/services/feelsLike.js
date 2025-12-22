// src/services/feelsLike.js
// All comments in English, as agreed

/**
 * Calculate perceived (feels-like) temperature based on approved inputs.
 * This function does NOT create alarms and does NOT format output.
 *
 * Inputs are aligned with thresholds.md v1.
 *
 * @param {Object} params
 * @param {number} params.temperature - air temperature (°C)
 * @param {number} params.humidity - relative humidity (%)
 * @param {number} params.windSpeed - wind speed (km/h)
 * @param {number|null} [params.windGusts] - wind gusts (km/h), optional
 * @param {boolean} params.clouds - cloud presence
 * @param {string} params.precipitation - none | light | rain | heavy
 *
 * @returns {number} feelsLike temperature (°C)
 */

// DEBUG flag: force noticeable feels-like difference for testing
// Must remain FALSE in production
const DEBUG_FORCE_FEELSLIKE = false;

function calculateFeelsLike({
  temperature,
  humidity,
  windSpeed,
  windGusts = null,
  clouds,
  precipitation,
}) {
  let feelsLike = temperature;

  // Wind effect (cooling)
  if (windSpeed >= 6) {
    feelsLike -= Math.min(3, windSpeed / 10);
  }

  // Gusts amplify wind effect
  if (windGusts !== null && windGusts > windSpeed) {
    feelsLike -= 0.5;
  }

  // High humidity increases perceived heat
  if (humidity >= 70 && temperature >= 20) {
    feelsLike += 1;
  }

  // Very dry air (hamasin-like effect)
  if (humidity < 25 && temperature >= 20) {
    feelsLike += 0.5;
  }

  // Cloud cover reduces solar heating
  if (clouds === true && temperature >= 20) {
    feelsLike -= 0.5;
  }

  // Precipitation increases discomfort
  if (precipitation !== "none") {
    feelsLike -= 0.5;
  }

  // DEBUG: force noticeable difference (disabled by default)
  if (DEBUG_FORCE_FEELSLIKE === true) {
    feelsLike -= 4;
  }

  return Math.round(feelsLike * 10) / 10;
}

module.exports = {
  calculateFeelsLike,
};
