// src/warnings/formatWarning.js

/**
 * Formats warning object into user-facing text
 *
 * RULES:
 * - Receives ONLY semantic warning object
 * - Receives ONLY reason.type (no ready-made text)
 * - ALWAYS translates via i18n
 * - NEVER outputs raw translation keys to user
 * - DOES NOT decide alarm vs warning (pure formatting)
 */

function formatWarning(warning, t) {
  if (!warning || !Array.isArray(warning.reasons)) return null;

  const { reasons, alarm } = warning;

  const header = alarm
    ? `🚨 ${t("warning.alarm_title")}`
    : `⚠️ ${t("warning.title")}`;

  const lines = [];

  for (const reason of reasons) {
    if (!reason?.type) continue;

    const key = `warning.reasons.${reason.type}`;
    let text = t(key);

    // ---------- DEV-SAFE GUARD ----------
    // If translation is missing, NEVER show raw key to user
    if (text === key) {
      console.warn("[WARNING][I18N][MISSING]", key, reason);
      text = "⚠️ Weather condition notice";
    }

    // ---------- Template minutes if present ----------
    if (typeof reason.minutes === "number") {
      text = text.replace("{{minutes}}", reason.minutes);
    }

    lines.push(`• ${text}`);
  }

  if (lines.length === 0) return null;

  return [header, ...lines].join("\n");
}

module.exports = { formatWarning };
