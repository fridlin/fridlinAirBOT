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
 * INPUT = factual weather values
 * OUTPUT = boolean (storm or not)
 *
 * Storm is a RARE, SEVERE condition.
 */

const STORM_THRESHOLDS = {
  // Wind
  WIND_STRONG: 40, // km/h — strong sustained wind
  WIND_GUST: 60, // km/h — dangerous gusts

  // Precipitation
  RAIN_HEAVY: 10, // mm/h — heavy rain
  RAIN_PRESENT: 0.1, // any factual rain

  // Snow / hail flags (future-proof)
  SNOW_PRESENT: true,
  HAIL_PRESENT: true,
};

/**
 * @param {Object} params
 * @param {number|null} params.windSpeed      // km/h
 * @param {number|null} params.windGusts       // km/h
 * @param {number|null} params.precipitation  // mm/h
 * @param {string|null} params.precipitationType // "rain" | "snow" | "hail"
 *
 * @returns {boolean}
 */
function isStorm({ windSpeed, windGusts, precipitation, precipitationType }) {
  // ---------- SNOW / HAIL ----------
  if (precipitationType === "snow" && STORM_THRESHOLDS.SNOW_PRESENT) {
    return true;
  }

  if (precipitationType === "hail" && STORM_THRESHOLDS.HAIL_PRESENT) {
    return true;
  }

  // ---------- WIND + RAIN ----------
  const hasRain =
    typeof precipitation === "number" &&
    precipitation >= STORM_THRESHOLDS.RAIN_PRESENT;

  const strongWind =
    typeof windSpeed === "number" && windSpeed >= STORM_THRESHOLDS.WIND_STRONG;

  const strongGusts =
    typeof windGusts === "number" && windGusts >= STORM_THRESHOLDS.WIND_GUST;

  // Heavy rain + wind
  if (
    typeof precipitation === "number" &&
    precipitation >= STORM_THRESHOLDS.RAIN_HEAVY &&
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
  STORM_THRESHOLDS,
};
