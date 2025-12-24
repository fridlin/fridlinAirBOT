// src/warnings/checkWarnings.js

const WEATHER_THRESHOLDS = require("../config/weatherThresholds");

/**
 * WARNING = human comfort
 * ALARM   = meteorological danger
 *
 * IMPORTANT:
 * - reason.type is ONLY a concrete weather fact (storm_now, wind_noticeable, etc.)
 * - alarm vs warning is NOT a reason.type
 * - This module returns semantic structure, no UX text
 */

function isFeelsLikeNoticeable(temp, feelsLike) {
  if (typeof temp !== "number" || typeof feelsLike !== "number") return false;
  return (
    Math.abs(feelsLike - temp) > WEATHER_THRESHOLDS.feelsLike.noticeableDelta
  );
}

function checkWarnings(now, timeline, nowTs) {
  const reasons = [];

  // ===========================
  // ALARM: STORM (CURRENT)
  // ===========================
  if (now.storm === true) {
    console.log("[WARNING][WHY] storm_now = true");
    return {
      alarm: true,
      reasons: [{ type: "storm_now" }],
    };
  }

  // ===========================
  // WARNINGS — CURRENT (COMFORT)
  // ===========================

  // Feels-like
  if (isFeelsLikeNoticeable(now.temperature, now.feelsLike)) {
    console.log(
      "[WARNING][WHY] feelslike_noticeable:",
      now.feelsLike,
      "vs",
      now.temperature,
    );
    reasons.push({ type: "feelslike_noticeable" });
  }

  // Wind (noticeable, not dangerous)
  if (
    typeof now.windspeed === "number" &&
    now.windspeed >= WEATHER_THRESHOLDS.wind.noticeable
  ) {
    console.log(
      "[WARNING][WHY] wind_noticeable:",
      now.windspeed,
      ">=",
      WEATHER_THRESHOLDS.wind.noticeable,
    );
    reasons.push({ type: "wind_noticeable" });
  }

  // Humidity (comfort)
  if (typeof now.humidity === "number") {
    if (now.humidity < WEATHER_THRESHOLDS.humidity.low) {
      console.log(
        "[WARNING][WHY] humidity_low:",
        now.humidity,
        "<",
        WEATHER_THRESHOLDS.humidity.low,
      );
      reasons.push({ type: "humidity_low" });
    }

    if (now.humidity > WEATHER_THRESHOLDS.humidity.high) {
      console.log(
        "[WARNING][WHY] humidity_high:",
        now.humidity,
        ">",
        WEATHER_THRESHOLDS.humidity.high,
      );
      reasons.push({ type: "humidity_high" });
    }
  }

  // Rain (fact, not danger)
  if (
    typeof now.precipitation === "number" &&
    now.precipitation >= WEATHER_THRESHOLDS.precipitation.rainPresent
  ) {
    console.log(
      "[WARNING][WHY] rain_now:",
      now.precipitation,
      ">=",
      WEATHER_THRESHOLDS.precipitation.rainPresent,
    );
    reasons.push({ type: "rain_now" });
  }

  // ===========================
  // FUTURE (NEXT 60 MIN)
  // ===========================

  for (const slot of timeline) {
    const minutes = Math.round((slot.time - nowTs) / 60000);
    if (minutes <= 0 || minutes > 60) continue;

    const data = slot.data || {};

    // ALARM: future storm
    if (data.storm === true) {
      console.log("[WARNING][WHY] storm_future in", minutes, "min");
      return {
        alarm: true,
        reasons: [{ type: "storm_future", minutes }],
      };
    }

    // Rain
    if (
      typeof data.precipitation === "number" &&
      data.precipitation >= WEATHER_THRESHOLDS.precipitation.rainPresent
    ) {
      console.log("[WARNING][WHY] rain_future in", minutes, "min");
      reasons.push({ type: "rain_future", minutes });
      break;
    }

    // Wind increase (noticeable)
    if (
      typeof data.wind_speed === "number" &&
      typeof now.windspeed === "number" &&
      data.wind_speed - now.windspeed >= WEATHER_THRESHOLDS.wind.noticeable
    ) {
      console.log("[WARNING][WHY] wind_future in", minutes, "min");
      reasons.push({ type: "wind_future", minutes });
    }

    // Humidity change
    if (
      typeof data.humidity === "number" &&
      typeof now.humidity === "number" &&
      Math.abs(data.humidity - now.humidity) >=
        WEATHER_THRESHOLDS.humidity.changeNoticeable
    ) {
      console.log("[WARNING][WHY] humidity_future in", minutes, "min");
      reasons.push({ type: "humidity_future", minutes });
    }
  }

  if (reasons.length === 0) return null;

  return {
    alarm: false,
    reasons,
  };
}

module.exports = { checkWarnings };
