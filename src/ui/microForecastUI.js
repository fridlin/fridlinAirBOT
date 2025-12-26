// src/ui/microForecastUI.js

const UX = require("./ux.config");
const { buildOutput } = require("./outputScenario");

/**
 * Micro Forecast UI adapter.
 *
 * ROLE:
 * - Validate prepared strings
 * - Assemble UI blocks
 * - Delegate final rendering to outputScenario
 *
 * RULES:
 * - No calculations
 * - No translations
 * - No emojis logic
 * - Strings in → string out
 */

function renderMicroForecastUI({
  header,
  lines,
  warning,
  alarm,
  options = {},
}) {
  // ---------------------------
  // HARD VALIDATION
  // ---------------------------
  if (!Array.isArray(lines) || lines.length === 0) {
    console.error("[UI][MICRO][FAIL] lines must be non-empty string array");
    return null;
  }

  if (!lines.every((l) => typeof l === "string")) {
    console.error("[UI][MICRO][FAIL] non-string line detected", lines);
    return null;
  }

  // ---------------------------
  // BUILD BLOCKS
  // ---------------------------
  const blocks = {};

  if (header?.title) blocks.header = header.title;
  if (header?.subtitle) blocks.subheader = header.subtitle;
  if (header?.areaNote) blocks.note = header.areaNote;

  blocks.forecast = lines;

  if (warning?.items?.length) {
    blocks.warning = {
      title: warning.title || "",
      items: warning.items,
    };
  }

  if (alarm?.items?.length) {
    blocks.alarm = {
      title: alarm.title || "",
      items: alarm.items,
    };
  }

  // ---------------------------
  // OUTPUT SCENARIO
  // ---------------------------
  return buildOutput({
    blocks,
    options: {
      ...options,
      density: alarm ? "compact" : "normal",
    },
    ux: UX,
  });
}

module.exports = {
  renderMicroForecastUI,
};
