// src/ui/start.ui.js

/**
 * START UX message
 *
 * Pure UX description.
 * No sending.
 * No logic.
 * No translations inside (t is injected).
 */

module.exports = function startUI(t) {
  return {
    payload: t("start.message"),
    delayMs: 0,
  };
};
