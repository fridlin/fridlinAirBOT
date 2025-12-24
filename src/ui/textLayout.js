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
  return `${emoji ? emoji + " " : ""}${text}${DOUBLE_GAP}`;
}

/**
 * Simple paragraph
 */
function text(text) {
  return `${text}${DOUBLE_GAP}`;
}

/**
 * Compact paragraph (used in blocks)
 */
function line(text) {
  return `${text}${GAP}`;
}

/**
 * Visual block (stacked lines with spacing)
 */
function block(...lines) {
  return (
    lines
      .filter(Boolean)
      .map((l) => line(l))
      .join("") + DOUBLE_GAP
  );
}

/**
 * Bullet list
 */
function list(items = []) {
  if (!items.length) return "";

  return (
    items
      .filter(Boolean)
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
