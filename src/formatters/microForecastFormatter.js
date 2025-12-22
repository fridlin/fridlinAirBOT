// src/formatters/microForecastFormatter.js

/**
 * Formats micro forecast slice into user-facing text.
 * Responsible for emojis, layout, spacing and visual consistency.
 *
 * @param {Array} slice - analyzed forecast window (normalized)
 * @param {string} timezone - user timezone
 * @returns {string}
 */
function formatMicroForecast(slice, timezone) {
  const arrow = (v) => (v === "up" ? "↑" : v === "down" ? "↓" : "→");
  const safeInt = (v) =>
    typeof v === "number" && !Number.isNaN(v) ? Math.round(v) : "–";

  let text = "";

  for (const p of slice) {
    const localTime = new Date(p.time).toLocaleTimeString("en-GB", {
      timeZone: timezone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    const tempLine =
      p.feelsLike !== null && typeof p.feelsLike === "number"
        ? `🌡️ ${safeInt(p.temperature)}° (👤 ${safeInt(p.feelsLike)}°)`
        : `🌡️ ${safeInt(p.temperature)}°`;

    text +=
      `${localTime}  ` +
      `${tempLine} ${arrow(p.trend?.temperature)}  ` +
      `🌧 ${p.precipitation?.amount > 0 ? "rain" : "dry"}  ` +
      `💨 ${safeInt(p.wind?.speed)} m/s ${arrow(p.trend?.wind)}\n`;
  }

  return text;
}

module.exports = {
  formatMicroForecast,
};
