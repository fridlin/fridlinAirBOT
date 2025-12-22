// src/warnings/checkWarnings.js
// All comments in English, as agreed

/**
 * Checks weather warnings based on current and near-future conditions
 * @param {Object} now - current weather snapshot
 * @param {Array} timeline - array of future slots [{ time, data }]
 * @param {Number} nowTs - current timestamp (ms)
 * @returns {Object|null} warning object or null
 */

// ---------- HELPERS ----------

function isFeelsLikeNoticeable(temp, feelsLike) {
  if (typeof temp !== "number" || typeof feelsLike !== "number") return false;
  return Math.abs(feelsLike - temp) > 3;
}

// ---------- MAIN ----------

function checkWarnings(now, timeline, nowTs) {
  const reasons = [];
  let severe = false;

  // ---------- FEELS LIKE (CURRENT) ----------
  if (isFeelsLikeNoticeable(now.temperature, now.feels_like)) {
    reasons.push({
      type: "feelslike_noticeable",
    });
  }

  // ---------- WIND (CURRENT) ----------
  if (typeof now.wind_speed === "number" && now.wind_speed >= 7) {
    reasons.push({
      type: "wind_now",
    });
  }

  // ---------- HUMIDITY (CURRENT) ----------
  if (typeof now.humidity === "number") {
    if (now.humidity < 30) {
      reasons.push({
        type: "humidity_low",
      });
    }
    if (now.humidity > 80) {
      reasons.push({
        type: "humidity_high",
      });
    }
  }

  // ---------- RAIN (CURRENT) ----------
  if (typeof now.precipitation === "number" && now.precipitation > 0) {
    reasons.push({
      type: "rain_now",
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
        minutes,
      });
      break;
    }

    // Wind increase
    if (
      typeof data.wind_speed === "number" &&
      typeof now.wind_speed === "number" &&
      data.wind_speed - now.wind_speed >= 3
    ) {
      reasons.push({
        type: "wind_future",
        minutes,
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
        minutes,
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
