// src/warnings/checkWarnings.js
// All comments in English, as agreed

/**
 * Checks weather warnings based on current and near-future conditions
 * @param {Object} now - current weather snapshot
 * @param {Array} timeline - array of future slots [{ time, data }]
 * @param {Number} nowTs - current timestamp (ms)
 * @returns {Object|null} warning object or null
 */

function checkWarnings(now, timeline, nowTs) {
  const reasons = [];
  let severe = false;

  // ---------- FEELS LIKE (CURRENT) ----------
  if (typeof now.feels_like === "number") {
    const feelsDiff = Math.abs(now.temperature - now.feels_like);
    if (feelsDiff > 3) {
      reasons.push({
        type: "feels_like_now",
        text:
          now.feels_like > now.temperature
            ? "Feels warmer than actual temperature"
            : "Feels colder than actual temperature",
      });
    }
  }

  // ---------- WIND (CURRENT) ----------
  if (typeof now.wind_speed === "number" && now.wind_speed >= 7) {
    reasons.push({
      type: "wind_now",
      text: "Strong wind now",
    });
  }

  // ---------- HUMIDITY (CURRENT) ----------
  if (typeof now.humidity === "number") {
    if (now.humidity < 30) {
      reasons.push({
        type: "humidity_low",
        text: "Very dry air — khamsin-like conditions",
      });
    }
    if (now.humidity > 80) {
      reasons.push({
        type: "humidity_high",
        text: "Very humid air",
      });
    }
  }

  // ---------- RAIN (CURRENT) ----------
  if (typeof now.precipitation === "number" && now.precipitation > 0) {
    reasons.push({
      type: "rain_now",
      text: "Rain now — dress accordingly",
    });
  }

  // ---------- FUTURE CHECK (NEXT 60 MIN) ----------
  for (const slot of timeline) {
    const minutes = Math.round((slot.time - nowTs) / 60000);
    if (minutes <= 0 || minutes > 60) continue;

    const data = slot.data || {};

    // Rain expected
    if (typeof data.precipitation === "number" && data.precipitation > 0) {
      reasons.push({
        type: "rain_future",
        text: `Rain in ${minutes} minutes`,
      });
      break; // first rain is enough
    }

    // Wind increase
    if (
      typeof data.wind_speed === "number" &&
      typeof now.wind_speed === "number" &&
      data.wind_speed - now.wind_speed >= 3
    ) {
      reasons.push({
        type: "wind_future",
        text: `Wind increasing in ${minutes} minutes`,
      });
    }

    // Humidity change
    if (
      typeof data.humidity === "number" &&
      typeof now.humidity === "number" &&
      Math.abs(data.humidity - now.humidity) >= 10
    ) {
      reasons.push({
        type: "humidity_future",
        text: `Humidity changing in ${minutes} minutes`,
      });
    }
  }

  if (reasons.length === 0) return null;

  // ---------- SEVERE MODE ----------
  if (reasons.length >= 3) severe = true;

  return {
    severe,
    reasons,
  };
}

module.exports = { checkWarnings };
