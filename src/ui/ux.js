// src/ui/ux.js

/**
 * UX configuration (CSS-like).
 *
 * RULES:
 * - No logic
 * - No conditions
 * - No calculations
 * - Only presentation
 */

const UX = {
  // ===========================
  // GENERAL LAYOUT
  // ===========================

  layout: {
    lineSeparator: "\n",
    sectionSeparator: "\n\n",
    itemSeparator: " ",
  },

  // ===========================
  // HEADER
  // ===========================

  header: {
    icon: "🌤",
    showTimezone: true,
  },

  // ===========================
  // TIME
  // ===========================

  time: {
    show: true,
    prefix: "",
    suffix: "",
    format: "HH:mm",
  },

  // ===========================
  // TEMPERATURE
  // ===========================

  temperature: {
    emoji: "🌡️",
    unit: "°",
    decimals: 1,
  },

  feelsLike: {
    emoji: "👤",
    unit: "°",
    decimals: 1,
    alwaysShow: true,
  },

  // ===========================
  // WIND
  // ===========================

  wind: {
    emoji: "💨",
    unit: "km/h",
    decimals: 0,
    trendIcons: {
      up: "↑",
      down: "↓",
      stable: "→",
    },
  },

  // ===========================
  // SKY STATES (FACT, NOT WARNING)
  // ===========================

  sky: {
    sun: {
      emoji: "☀️",
      label: "dry",
    },
    cloud: {
      emoji: "☁️",
      label: "dry",
    },
    rain: {
      emoji: "🌧️",
      label: "rain",
    },
    storm: {
      emoji: "⛈️",
      label: "storm",
    },
    squallRain: {
      emoji: "☔💨",
      label: "rain + squalls",
    }
  },

  // ===========================
  // WARNINGS (HUMAN FEELING)
  // ===========================

  warning: {
    header: {
      icon: "⚠️",
    },
    bullet: "•",
    order: [
      "feelslike_noticeable",
      "wind_noticeable",
      "humidity_high",
      "humidity_low",
      "rain_now",
      "rain_future"
    ]
  },

  // ===========================
  // ALARMS (METEO DANGER)
  // ===========================

  alarm: {
    header: {
      icon: "🚨",
    },
    bullet: "•",
    order: [
      "storm_now",
      "storm_future",
      "wind_strong",
      "wind_strong_future"
    ]
  }
};

module.exports = UX;
