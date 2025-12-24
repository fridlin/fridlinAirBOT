// src/config/storm/stormRules.js

const STORM_RULES = [
  {
    id: "rain_strong_wind",
    precipitation: "rain",
    wind: "severe",
  },

  {
    id: "rain_gusts",
    precipitation: "rain",
    gusts: "severe",
  },

  {
    id: "snow_any",
    precipitation: "snow",
  },

  {
    id: "hail_any",
    precipitation: "hail",
  },

  {
    id: "heavy_rain_with_wind",
    precipitation: "rain",
    wind: "strong",
    heavyRain: true,
  },
];

module.exports = STORM_RULES;
