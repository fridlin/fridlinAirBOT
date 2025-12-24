// src/ui/microForecastUI.js

/**
 * Visual UI layer for Micro Forecast
 * Acts as "CSS for micro forecast text"
 *
 * CONTRACT:
 * - Receives READY strings
 * - NEVER formats forecast lines
 * - NEVER inserts emojis or units
 * - ONLY groups and spaces text
 * - FAILS LOUDLY on invalid input
 */

const UI = require("./textLayout");

/**
 * @param {Object} params
 * @param {Object=} params.header   // optional
 * @param {string=} params.header.title
 * @param {string=} params.header.subtitle
 * @param {string=} params.header.areaNote
 * @param {string=} params.header.timezone
 * @param {string[]} params.lines   // REQUIRED
 */
function renderMicroForecastUI({ header, lines }) {
  // ===========================
  // HARD VALIDATION — FAIL LOUD
  // ===========================
  if (!Array.isArray(lines)) {
    console.error("[UI][MICRO][FATAL] lines is not array:", lines);
    return null;
  }

  if (lines.length === 0) {
    console.error("[UI][MICRO][FATAL] lines array is empty");
    return null;
  }

  if (!lines.every((l) => typeof l === "string")) {
    console.error("[UI][MICRO][FATAL] non-string line detected:", lines);
    return null;
  }

  // ===========================
  // RENDER
  // ===========================
  let text = "";

  // Header is OPTIONAL
  if (header) {
    if (typeof header !== "object") {
      console.error("[UI][MICRO][FATAL] header is not object:", header);
      return null;
    }

    if (header.title) {
      text += UI.title(header.title, "🌤");
    }

    if (header.subtitle || header.areaNote || header.timezone) {
      text += UI.block(
        header.subtitle,
        header.areaNote,
        header.timezone ? `Часовой пояс: ${header.timezone}` : null,
      );
    }

    text += UI.divider();
  }

  // Timeline
  for (const line of lines) {
    text += UI.line(line);
  }

  return text;
}

module.exports = {
  renderMicroForecastUI,
};
