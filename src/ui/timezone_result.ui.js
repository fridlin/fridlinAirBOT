// src/ui/timezone_result.ui.js

/**
 * TIMEZONE RESULT UX message
 *
 * Pure UX description.
 * No sending.
 * No logic.
 */

module.exports = function timezoneResultUI(t, timezone) {
  return {
    payload: t("timezone.result", { timezone }),
    delayMs: 0,
  };
};
