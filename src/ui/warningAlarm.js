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
 * This file acts as a UX "skin" over already formatted text/blocks.
 */

/**
 * @deprecated
 * Legacy warning/alarm UX renderer.
 *
 * This file belongs to pre-canonical UX architecture.
 * It will be replaced by structured UX flow (alarm.ui.js, warning.ui.js).
 *
 * DO NOT extend.
 */

const { getRecommendations } = require("./recommendations");

/**
 * Applies visual UX rules to formatted warning/alarm blocks
 *
 * @param {Object} warning
 * @param {Object} warningBlock - output of formatWarning() → { title, items, alarm }
 * @returns {string|null}
 */
function applyWarningAlarmUI(warning, warningBlock) {
  if (!warning || !warningBlock) return null;

  const title = warningBlock.title;
  const items = Array.isArray(warningBlock.items) ? warningBlock.items : [];

  if (!title || items.length === 0) return null;

  // ===========================
  // ALARM UX (danger)
  // ===========================
  if (warning.alarm === true) {
    const MAX_ITEMS = 2; // header + max 2 bullets in alarm output

    const out = [];
    out.push(title);

    for (const i of items.slice(0, MAX_ITEMS)) {
      out.push(`• ${i}`);
    }

    return out.join("\n");
  }

  // ===========================
  // WARNING UX (comfort)
  // ===========================
  const out = [];
  out.push(title);

  for (const i of items) {
    out.push(`• ${i}`);
  }

  // Recommendations (UX-only)
  const recs = getRecommendations(warning.reasons || []);
  if (recs.length > 0) {
    out.push("");
    out.push("🧥 Recommendations:");

    for (const r of recs) {
      out.push(`• ${r}`);
    }
  }

  return out.join("\n");
}

module.exports = { applyWarningAlarmUI };
