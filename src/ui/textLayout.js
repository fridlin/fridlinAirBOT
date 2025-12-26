// src/ui/textLayout.js

/**
 * Text layout system for Telegram messages
 * Acts like "CSS for text"
 *
 * Rules:
 * - No i18n inside
 * - No logic
 * - Only visual composition
 */

const GAP = "\n";
const DOUBLE_GAP = "\n\n";

/**
 * Big title with emoji
 */
function title(text, emoji = "") {
  if (typeof text !== "string") return "";
  return `${emoji ? emoji + " " : ""}${text}${DOUBLE_GAP}`;
}

/**
 * Simple paragraph
 */
function text(text) {
  if (typeof text !== "string") return "";
  return `${text}${DOUBLE_GAP}`;
}

/**
 * Compact paragraph (used in blocks)
 */
function line(text) {
  if (typeof text !== "string") return "";
  return `${text}${GAP}`;
}

/**
 * Visual block (stacked lines with spacing)
 * Accepts strings only, silently ignores others
 */
function block(...items) {
  return (
    items
      .flat()
      .filter((v) => typeof v === "string" && v.trim().length > 0)
      .map((l) => line(l))
      .join("") + DOUBLE_GAP
  );
}

/**
 * Bullet list
 */
function list(items = []) {
  if (!Array.isArray(items) || items.length === 0) return "";

  return (
    items
      .filter((v) => typeof v === "string" && v.trim().length > 0)
      .map((i) => `• ${i}`)
      .join(GAP) + DOUBLE_GAP
  );
}

/**
 * Divider (visual separation)
 */
function divider(char = "─", length = 12) {
  return `${char.repeat(length)}${DOUBLE_GAP}`;
}

/**
 * Inline badge / label
 */
function badge(text) {
  if (typeof text !== "string") return "";
  return `[ ${text} ]`;
}

module.exports = {
  title,
  text,
  line,
  block,
  list,
  divider,
  badge,
};
