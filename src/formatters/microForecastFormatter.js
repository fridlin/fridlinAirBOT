// src/formatters/microForecastFormatter.js

const UX = require("../ui/ux");

/**
 * Formats micro forecast data into a user-facing string.
 *
 * RULES:
 * ❌ No calculations
 * ❌ No thresholds
 * ❌ No units
 * ❌ No formatting decisions
 * ✅ Only rendering via UX config
 */

function formatMicroForecast({
  timeLabel,
  temperature,
  feelsLike,
  windSpeed,
  windTrend,
  skyState,
}) {
  const sky = UX.sky[skyState] || UX.sky.cloud;
  const parts = [];

  // Time
  if (UX.time?.show && timeLabel) {
    parts.push(timeLabel);
  }

  // Sky
  parts.push(sky.emoji);

  // Temperature
  if (typeof temperature === "number") {
    parts.push(
      `${UX.temperature.emoji} ${temperature.toFixed(
        UX.temperature.decimals,
      )}${UX.temperature.unit}`,
    );
  }

  // Feels-like
  if (UX.feelsLike.alwaysShow && typeof feelsLike === "number") {
    parts.push(
      `${UX.feelsLike.emoji} ${feelsLike.toFixed(
        UX.feelsLike.decimals,
      )}${UX.feelsLike.unit}`,
    );
  }

  // Wind
  if (typeof windSpeed === "number") {
    const trendIcon = UX.wind.trendIcons?.[windTrend] || "";
    parts.push(
      `${UX.wind.emoji} ${windSpeed.toFixed(
        UX.wind.decimals,
      )} ${UX.wind.unit}${trendIcon}`,
    );
  }

  // Fact label (dry / rain / storm)
  if (sky.label) {
    parts.push(sky.label);
  }

  return parts.join(UX.layout.itemSeparator);
}

module.exports = {
  formatMicroForecast,
};
