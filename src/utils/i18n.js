const path = require("path");

const translations = {
  ru: require("../i18n/ru.json"),
  en: require("../i18n/en.json")
};

function t(ctx, key) {
  const lang = ctx.session?.lang || "ru";
  return translations[lang][key] || key;
}

module.exports = { t };
