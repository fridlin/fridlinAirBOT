// src/ui/timezone_calc.ui.js

/**
 * TIMEZONE CALCULATION UX message
 *
 * Pure UX description.
 * No sending.
 * No logic.
 */

module.exports = function timezoneCalcUI(t) {
  return {
    payload: t("timezone.calculating"),
    delayMs: 0, // default 0; can be tuned via UX later
  };
};
