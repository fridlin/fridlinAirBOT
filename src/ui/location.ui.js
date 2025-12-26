// src/ui/location.ui.js

/**
 * LOCATION REQUEST UX message
 *
 * Pure UX description.
 * No sending.
 * No logic.
 *
 * NOTE:
 * - Keyboard / button is NOT included here yet (no coupling to telegraf Markup).
 * - This file anchors the step in the architecture.
 */

module.exports = function locationRequestUI(t) {
  return {
    payload: t("location.request"),
    delayMs: 0,
  };
};
