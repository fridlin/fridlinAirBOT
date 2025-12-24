/**
 * Storm detector.
 *
 * PURPOSE:
 * Determines whether current or future conditions qualify as a STORM.
 *
 * IMPORTANT:
 * - No UI
 * - No emojis
 * - No translations
 * - No API access
 *
 * INPUT  = factual weather values
 * OUTPUT = boolean (storm or not)
 *
 * Storm is a RARE, SEVERE condition.
 */

const WEATHER_THRESHOLDS = require("../config/weatherThresholds");

const STORM = WEATHER_THRESHOLDS.storm;

/**
 * @param {Object} params
 * @param {number|null} params.windSpeed           // km/h
 * @param {number|null} params.windGusts           // km/h
 * @param {number|null} params.precipitation       // mm/h
 * @param {string|null} params.precipitationType   // "rain" | "snow" | "hail"
 *
 * @returns {boolean}
 */
function isStorm({ windSpeed, windGusts, precipitation, precipitationType }) {
  // ---------- SOLID PRECIPITATION ----------
  if (precipitationType === "snow" && STORM.snow === true) {
    return true;
  }

  if (precipitationType === "hail" && STORM.hail === true) {
    return true;
  }

  // ---------- WIND + RAIN ----------
  const hasRain =
    typeof precipitation === "number" && precipitation >= STORM.rainPresent;

  const strongWind =
    typeof windSpeed === "number" && windSpeed >= STORM.windStrong;

  const strongGusts =
    typeof windGusts === "number" && windGusts >= STORM.windGust;

  // Heavy rain + strong wind or gusts
  if (
    typeof precipitation === "number" &&
    precipitation >= STORM.rainHeavy &&
    (strongWind || strongGusts)
  ) {
    return true;
  }

  // Any rain + dangerous gusts
  if (hasRain && strongGusts) {
    return true;
  }

  return false;
}

module.exports = {
  isStorm,
};
