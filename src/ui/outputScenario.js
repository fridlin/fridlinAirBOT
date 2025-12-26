// src/ui/outputScenario.js

/**
 * Centralized output scenario.
 *
 * PURPOSE:
 * - Define message structure and order
 * - No business logic
 * - No text generation
 * - No conditions (except presence of blocks)
 *
 * UI reads this file as a script.
 */

const { title, text, block, list, divider } = require("./textLayout");
const UX = require("./ux.config");

/**
 * Build output message from prepared blocks
 *
 * @param {Object} ctx
 * @param {Object} ctx.blocks - prepared UI blocks
 * @returns {string}
 */
function buildOutput(ctx) {
  const { blocks } = ctx;

  const output = [];

  // ===========================
  // HEADER
  // ===========================
  if (blocks.header) {
    output.push(title(blocks.header, UX.header.icon));
  }

  // ===========================
  // SUBHEADER / NOTE (subtitle + areaNote)
  // ===========================
  if (blocks.subheader) {
    output.push(text(blocks.subheader));
  }

  if (blocks.note) {
    output.push(text(blocks.note));
  }

  // ===========================
  // TIME / TIMEZONE (optional)
  // ===========================
  if (blocks.time) {
    output.push(text(blocks.time));
  }

  // ===========================
  // MAIN FORECAST
  // ===========================
  if (blocks.forecast && blocks.forecast.length) {
    output.push(
      block(blocks.forecast, UX.densityProfiles[UX.densityByBlock.forecast]),
    );
  }

  // ===========================
  // WARNINGS
  // ===========================
  if (blocks.warning && blocks.warning.items?.length) {
    output.push(title(blocks.warning.title, UX.warning.header.icon));

    output.push(
      list(blocks.warning.items, UX.densityProfiles[UX.densityByBlock.warning]),
    );
  }

  // ===========================
  // ALARMS
  // ===========================
  if (blocks.alarm && blocks.alarm.items?.length) {
    output.push(divider());

    output.push(title(blocks.alarm.title, UX.alarm.header.icon));

    output.push(
      list(blocks.alarm.items, UX.densityProfiles[UX.densityByBlock.alarm]),
    );
  }

  return output.filter(Boolean).join("");
}

module.exports = {
  buildOutput,
};
