// src/warnings/formatWarning.js

const UX = require("../ui/ux");

/**
 * Formats warning object into user-facing text
 * @param {Object} warning - result of checkWarnings()
 * @param {Function} t - i18n translate function
 * @returns {String}
 */

const REASON_PRIORITY = {
  feelslike_noticeable: 100,
  rain_now: 90,
  rain_future: 80,
  wind_now: 70,
  wind_future: 60,
  humidity_high: 40,
  humidity_low: 30,
  humidity_future: 20,
};

function formatWarning(warning, t) {
  const { severe, reasons } = warning;

  const header = severe
    ? `${UX.icons.alertSevere} ${t("warning.severe_title")}`
    : `${UX.icons.alert} ${t("warning.title")}`;

  const sortedReasons = [...reasons].sort((a, b) => {
    const pa = REASON_PRIORITY[a.type] ?? 0;
    const pb = REASON_PRIORITY[b.type] ?? 0;
    return pb - pa;
  });

  const lines = sortedReasons.map((r) => {
    if (r.type === "feelslike_noticeable") {
      return UX.format.feelsLike(r);
    }

    if (typeof r.minutes !== "number") {
      return `${UX.icons.bullet} ${t(`warning.reasons.${r.type}`)}`;
    }

    return `${UX.icons.bullet} ${t(`warning.reasons.${r.type}`, {
      minutes: r.minutes,
    })}`;
  });

  return [header, "", ...lines].join("\n");
}

module.exports = { formatWarning };
