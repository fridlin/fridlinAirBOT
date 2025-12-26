// src/ui/micro_calc.ui.js

/**
 * MICRO FORECAST CALCULATION UX message
 *
 * Pure UX description.
 * No sending.
 * No logic.
 */

module.exports = function microCalcUI(t) {
  return {
    payload: t("micro.calculating"),
    delayMs: 0, // default 0; can be tuned via UX later
  };
};
