// src/ui/alarm.ui.js

/**
 * ALARM UX message
 *
 * Pure UX description.
 * No sending.
 * No logic.
 *
 * Input is expected to be already prepared strings (no formatting here).
 */

module.exports = function alarmUI(t, items) {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];

  if (safeItems.length === 0) {
    return null;
  }

  const header = t("alarm.title");
  const body = safeItems.join("\n");

  return {
    payload: `${header}\n${body}`,
    delayMs: 0,
  };
};
