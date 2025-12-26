// src/ui/warning.ui.js

/**
 * WARNING + RECOMMENDATIONS UX message
 *
 * Pure UX description.
 * No sending.
 * No logic.
 *
 * Input is expected to be already prepared strings (no formatting here).
 */

module.exports = function warningUI(t, items) {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];

  if (safeItems.length === 0) {
    return null;
  }

  const header = t("warning.title");
  const body = safeItems.join("\n");

  return {
    payload: `${header}\n${body}`,
    delayMs: 0,
  };
};
