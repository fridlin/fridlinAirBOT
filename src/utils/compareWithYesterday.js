// src/utils/compareWithYesterday.js
// All comments in English, as agreed

const {
  CLOUD_CLEAR,
  CLOUD_PARTLY,
  CLOUD_OVERCAST,
} = require("../utils/skyState");

function cloudCategory(cloudCover) {
  if (cloudCover == null) return null;
  if (cloudCover < 20) return "clear";
  if (cloudCover < 70) return "partly";
  return "overcast";
}

function compareWithYesterday(now, yesterday, timeLabel) {
  if (!now || !yesterday) return null;

  const changes = [];

  // --- Feels like (same rule as warning) ---
  if (Math.abs(now.feelsLike - yesterday.feelsLike) > 3) {
    changes.push(
      now.feelsLike > yesterday.feelsLike
        ? "warmer"
        : "colder",
    );
  }

  // --- Wind (presence rule) ---
  const windNow = now.windspeed >= 6;
  const windYesterday = yesterday.windspeed >= 6;
  if (windNow !== windYesterday) {
    changes.push(
      windNow ? "windier" : "less_wind",
    );
  }

  // --- Humidity ---
  if (Math.abs(now.humidity - yesterday.humidity) >= 10) {
    changes.push(
      now.humidity > yesterday.humidity
        ? "more_humid"
        : "drier",
    );
  }

  // --- Cloud category ---
  const cloudNow = cloudCategory(now.cloudCover);
  const cloudYesterday = cloudCategory(yesterday.cloudCover);
  if (cloudNow && cloudYesterday && cloudNow !== cloudYesterday) {
    changes.push(
      cloudNow === "overcast"
        ? "cloudier"
        : cloudYesterday === "overcast"
        ? "clearer"
        : "cloud_changed",
    );
  }

  if (changes.length === 0) {
    return {
      type: "no_change",
      timeLabel,
    };
  }

  return {
    type: "changed",
    timeLabel,
    changes: changes.slice(0, 2),
  };
}

module.exports = { compareWithYesterday };
