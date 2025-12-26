// src/ui/ux.config.js

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
  // VISUAL LEVELS (LOUDNESS)
  // ===========================

  levels: {
    normal: {
      emphasis: "normal",
    },
    warning: {
      emphasis: "warning",
    },
    alarm: {
      emphasis: "alarm",
    },
  },

  // ===========================
  // TEXT SIZES (ABSTRACT)
  // ===========================

  textSize: {
    title: "title",
    normal: "normal",
    small: "small",
  },

  // ===========================
  // TEXT DENSITY (legacy buckets)
  // ===========================

  density: {
    compact: {
      sectionSeparator: "\n",
    },
    normal: {
      sectionSeparator: "\n\n",
    },
    spacious: {
      sectionSeparator: "\n\n\n",
    },
  },

  // ===========================
  // DENSITY PROFILES (by block)
  // ===========================

  densityProfiles: {
    normal: {
      sectionSeparator: "\n\n",
    },
    warning: {
      sectionSeparator: "\n\n",
    },
    alarm: {
      sectionSeparator: "\n",
    },
  },

  densityByBlock: {
    forecast: "normal",
    warning: "warning",
    alarm: "alarm",
  },

  // ===========================
  // HEADER
  // ===========================

  header: {
    icon: "🌤",
    showTimezone: true,
    textSize: "title",
    level: "normal",
  },

  // ===========================
  // TIME
  // ===========================

  time: {
    show: true,
    prefix: "",
    suffix: "",
    format: "HH:mm",
    textSize: "small",
    level: "normal",
  },

  // ===========================
  // TEMPERATURE
  // ===========================

  temperature: {
    emoji: "🌡️",
    unit: "°",
    decimals: 1,
    textSize: "normal",
    level: "normal",
  },

  feelsLike: {
    emoji: "👤",
    unit: "°",
    decimals: 1,
    alwaysShow: true,
    textSize: "small",
    level: "normal",
  },

  // ===========================
  // WIND
  // ===========================

  wind: {
    emoji: "💨",
    unit: "km/h",
    decimals: 0,
    textSize: "normal",
    level: "normal",
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
      level: "normal",
    },
    cloud: {
      emoji: "☁️",
      label: "dry",
      level: "normal",
    },
    rain: {
      emoji: "🌧️",
      label: "rain",
      level: "warning",
    },
    storm: {
      emoji: "⛈️",
      label: "storm",
      level: "alarm",
    },
    squallRain: {
      emoji: "☔💨",
      label: "rain + squalls",
      level: "alarm",
    },
  },

  // ===========================
  // WARNINGS (HUMAN FEELING)
  // ===========================

  warning: {
    header: {
      icon: "⚠️",
      textSize: "title",
      level: "warning",
    },
    bullet: "•",
    textSize: "normal",
    level: "warning",
    order: [
      "feelslike_noticeable",
      "wind_noticeable",
      "humidity_high",
      "humidity_low",
      "rain_now",
      "rain_future",
    ],
  },

  // ===========================
  // ALARMS (METEO DANGER)
  // ===========================

  alarm: {
    header: {
      icon: "🚨",
      textSize: "title",
      level: "alarm",
    },
    bullet: "•",
    textSize: "normal",
    level: "alarm",
    order: ["storm_now", "storm_future", "wind_strong", "wind_strong_future"],
  },
};

module.exports = UX;
