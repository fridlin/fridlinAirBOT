// src/formatters/microForecastFormatter.js

/**
 * Formats ONE micro forecast line.
 *
 * RULES:
 * - No calculations
 * - No thresholds
 * - No decisions about weather severity
 * - Uses UX config only
 */

const UX = require("../ui/ux.config");

function formatNumber(value, decimals) {
  if (typeof value !== "number") return null;
  return value.toFixed(decimals);
}

function formatMicroForecast({
  timeLabel,
  temperature,
  feelsLike,
  windSpeed,
  windTrend,
  skyState,
}) {
  const parts = [];

  // -----------------------
  // TIME
  // -----------------------
  if (UX.time.show && timeLabel) {
    parts.push(timeLabel);
  }

  // -----------------------
  // SKY
  // -----------------------
  const sky = UX.sky[skyState] || UX.sky.cloud;
  if (sky?.emoji) {
    parts.push(sky.emoji);
  }

  // -----------------------
  // TEMPERATURE
  // -----------------------
  const t = formatNumber(temperature, UX.temperature.decimals);
  if (t !== null) {
    parts.push(`${UX.temperature.emoji} ${t}${UX.temperature.unit}`);
  }

  // -----------------------
  // FEELS LIKE (UX-driven)
  // -----------------------
  const fl = formatNumber(feelsLike, UX.feelsLike.decimals);
  if (fl !== null && UX.feelsLike.alwaysShow) {
    parts.push(`${UX.feelsLike.emoji} ${fl}${UX.feelsLike.unit}`);
  }

  // -----------------------
  // WIND
  // -----------------------
  const w = formatNumber(windSpeed, UX.wind.decimals);
  if (w !== null) {
    const trendIcon =
      UX.wind.trendIcons[windTrend] || UX.wind.trendIcons.stable;

    parts.push(`${UX.wind.emoji} ${w} ${UX.wind.unit} ${trendIcon}`);
  }

  return parts.join(" ");
}

module.exports = { formatMicroForecast };
