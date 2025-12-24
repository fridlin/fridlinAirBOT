// src/config/microForecast.js

module.exports = {
  HOURS_AHEAD: 3,
  BASE_STEP_MIN: 15,
  UI_STEP_MIN: 30,

  // floor = previous slot (22:53 → 22:45)
  // ceil  = next slot
  ANCHOR_MODE: "floor",

  // Always show feels-like, even if equal
  ALWAYS_SHOW_FEELSLIKE: true,

  // Wind unit for UI
  WIND_UNIT: "km/h",
};
