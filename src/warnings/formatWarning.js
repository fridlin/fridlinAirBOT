// src/warnings/formatWarning.js

function formatWarning(warning, t) {
  if (!warning || !Array.isArray(warning.reasons)) return null;

  const { reasons, alarm } = warning;

  const title = alarm ? t("warning.alarm_title") : t("warning.title");

  const items = [];

  for (const reason of reasons) {
    if (!reason?.type) continue;

    const key = `warning.reasons.${reason.type}`;
    let text = t(key);

    if (text === key) {
      console.warn("[WARNING][I18N][MISSING]", key, reason);
      text = "Weather condition notice";
    }

    if (typeof reason.minutes === "number") {
      text = text.replace("{{minutes}}", reason.minutes);
    }

    items.push(text);
  }

  if (!items.length) return null;

  return {
    title,
    items,
  };
}

module.exports = { formatWarning };
