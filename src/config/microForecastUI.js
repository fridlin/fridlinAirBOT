// src/config/microForecastUI.js


module.exports = {
  /**
   * Internal calculation resolution (minutes)
   * Must match interpolation logic
   */
  INTERNAL_STEP_MINUTES: 15,

  /**
   * How many forecast rows are shown to the user
   */
  UI_POINTS_COUNT: 5,

  /**
   * Minutes between user-visible points
   */
  UI_STEP_MINUTES: 30,

  /**
   * How far into the future UX forecast goes
   * UI_POINTS_COUNT * UI_STEP_MINUTES = UI_WINDOW_MINUTES
   */
  UI_WINDOW_MINUTES: 120,

  /**
   * Maximum allowed distance from "now" for the first point
   */
  NOW_TOLERANCE_MINUTES: 15,
};
