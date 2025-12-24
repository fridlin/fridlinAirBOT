// src/utils/i18n.js

const languages = require("../config/lang");

// Load all translations dynamically from lang config
const translations = Object.fromEntries(
  Object.values(languages).map((lang) => {
    try {
      return [lang.code, require(`../i18n/${lang.code}.json`)];
    } catch (e) {
      console.error(`[I18N][FAIL] Cannot load ${lang.code}.json`);
      return [lang.code, {}];
    }
  }),
);

function resolveNested(obj, path) {
  return path.split(".").reduce((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return acc[key];
    }
    return undefined;
  }, obj);
}

function t(ctx, key, vars = {}) {
  const lang = ctx.session?.lang || "ru";
  const dict = translations[lang] || {};

  let text = resolveNested(dict, key);

  if (typeof text !== "string") {
    return key; // DEV-safe fallback: never crash
  }

  Object.entries(vars).forEach(([k, v]) => {
    text = text.replaceAll(`{{${k}}}`, v);
  });

  return text;
}

module.exports = { t };
