// src/ui/warningAlarm.js

/**
 * Visual UX layer for warning / alarm messages
 *
 * RULES:
 * - NO weather logic
 * - NO thresholds
 * - NO translations
 * - ONLY presentation rules
 *
 * This file acts as a UX "skin" over already formatted text.
 */

/**
 * Applies visual UX rules to formatted warning/alarm text
 *
 * @param {Object} warning
 * @param {string} text - output of formatWarning()
 * @returns {string}
 */
function applyWarningAlarmUI(warning, text) {
  if (!warning || !text) return null;

  const { type } = warning;

  // Split lines (header + bullet points)
  const lines = text.split("\n");

  // =========================================================
  // TODO (UX NEXT STEPS — DO NOT REMOVE)
  // =========================================================
  //
  // 1. Clothing recommendations block
  //    - Based on warning.type + reason categories
  //    - Examples:
  //      • strong wind → "consider windproof jacket"
  //      • rain → "umbrella / waterproof shoes"
  //      • heat / humidity → "light clothing, water"
  //
  // 2. Attention / advice block
  //    - Short human hints:
  //      • slippery roads
  //      • discomfort outdoors
  //      • sensitive people notice first
  //
  // 3. Boiler / home advice (future)
  //    - Humidity / rain → ventilation
  //    - Cold / storm → heating, boiler timing
  //    - This MUST stay optional and collapsible
  //
  // 4. Yesterday comparison hook
  //    - Placeholder for:
  //      • "no change compared to yesterday"
  //      • "+ wind", "- humidity", etc.
  //    - Data comes from another layer (NOT here)
  //
  // 5. Severity-based visual density
  //    - warning → full text + recommendations
  //    - alarm   → minimal text + critical advice only
  //
  // =========================================================

  // ===========================
  // ALARM UX (danger)
  // ===========================
  if (type === "alarm") {
    // Alarm must be short and strong
    const MAX_LINES = 3;

    // TODO:
    // - Later append ONE critical advice line (max)
    // - Example: "Avoid being outdoors if possible"

    return lines.slice(0, MAX_LINES).join("\n");
  }

  // ===========================
  // WARNING UX (comfort)
  // ===========================
  // TODO:
  // - Later append:
  //   • clothing recommendations
  //   • comfort advice
  //   • yesterday comparison
  // - Order MUST be:
  //   1. Core warning text
  //   2. Advice
  //   3. Optional home/boiler note

  return lines.join("\n");
}

module.exports = { applyWarningAlarmUI };
