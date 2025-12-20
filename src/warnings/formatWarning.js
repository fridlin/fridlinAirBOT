// src/warnings/formatWarning.js
// All comments in English, as agreed

/**
 * Formats warning object into user-facing text
 * @param {Object} warning - result of checkWarnings()
 * @param {Function} t - i18n translate function
 * @returns {String}
 */

function formatWarning(warning, t) {
  const { severe, reasons } = warning;

  const header = severe
    ? `🚨 ${t("warning.severe_title")}`
    : `⚠️ ${t("warning.title")}`;

  const lines = reasons.map((r) => `• ${t(`warning.reasons.${r.type}`)}`);

  return [header, "", ...lines].join("\n");
}

module.exports = { formatWarning };
