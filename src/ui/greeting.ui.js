// src/ui/greeting.ui.js

/**
 * GREETING UX message
 *
 * Pure UX description.
 * No sending.
 * No logic.
 */

module.exports = function greetingUI(t) {
  return {
    payload: t("greeting.message"),
    delayMs: 0,
  };
};
