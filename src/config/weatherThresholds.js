// src/config/weatherThresholds.js

/**
 * Centralized weather thresholds.
 *
 * PURPOSE:
 * - Single source of truth for all numeric limits
 * - Easy tuning without touching logic
 *
 * IMPORTANT:
 * - No logic
 * - No UI
 * - No units conversion
 *
 * Units:
 * - Temperature: °C
 * - Wind speed / gusts: km/h
 * - Precipitation: mm/h
 */

module.exports = {
  // ===========================
  // WIND
  // ===========================
  wind: {
    noticeable: 6, // below this → wind is not felt
    strong: 25, // strong wind (warnings)
    dangerous: 40, // dangerous sustained wind
    gustDangerous: 60, // dangerous gusts
  },

  // ===========================
  // HUMIDITY
  // ===========================
  humidity: {
    low: 30, // too dry
    high: 80, // too humid
    changeNoticeable: 10, // % change considered noticeable
  },

  // ===========================
  // FEELS LIKE
  // ===========================
  feelsLike: {
    noticeableDelta: 3, // |feelsLike - temperature| > 3°C
  },

  // ===========================
  // PRECIPITATION
  // ===========================
  precipitation: {
    rainPresent: 0.1, // any measurable rain
    rainHeavy: 5, // heavy rain (mm/h)
  },

  // ===========================
  // STORM (RARE / SEVERE)
  // ===========================
  storm: {
    // Solid precipitation
    snow: true, // any snow = storm
    hail: true, // any hail = storm

    // Rain thresholds
    rainPresent: 0.1, // rain must be present
    rainHeavy: 5, // heavy rain threshold

    // Wind thresholds
    windStrong: 40, // strong sustained wind
    windGust: 60, // dangerous gusts
  },
};
