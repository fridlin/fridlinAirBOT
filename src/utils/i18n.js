const translations = {
  ru: require("../i18n/ru.json"),
  en: require("../i18n/en.json"),
};

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
  const dict = translations[lang];

  let text = resolveNested(dict, key);

  if (typeof text !== "string") {
    return key; // fallback — лучше видеть ключ, чем падать
  }

  // simple {{var}} interpolation
  Object.entries(vars).forEach(([k, v]) => {
    text = text.replaceAll(`{{${k}}}`, v);
  });

  return text;
}

module.exports = { t };
