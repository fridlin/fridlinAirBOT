// scripts/checkI18nWarnings.js

/**
 * I18N completeness check for warning/alarm reasons
 *
 * What it checks:
 * 1. All warning.reasons.* keys exist in ALL languages
 * 2. No extra keys in one language compared to others
 *
 * How to run:
 *   node scripts/checkI18nWarnings.js
 *
 * Exit codes:
 *   0 = OK
 *   1 = Missing or inconsistent keys found
 */

const fs = require("fs");
const path = require("path");

const I18N_DIR = path.join(__dirname, "../src/i18n");
const LANG_FILES = ["ru.json", "en.json"];

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function getReasonKeys(langJson) {
  return Object.keys(langJson?.warning?.reasons || {}).sort();
}

function main() {
  const data = {};
  const allKeys = new Set();

  for (const file of LANG_FILES) {
    const fullPath = path.join(I18N_DIR, file);
    if (!fs.existsSync(fullPath)) {
      console.error(`[I18N][ERROR] Missing file: ${file}`);
      process.exit(1);
    }

    const json = loadJson(fullPath);
    const keys = getReasonKeys(json);

    data[file] = keys;
    keys.forEach((k) => allKeys.add(k));
  }

  let hasErrors = false;

  for (const file of LANG_FILES) {
    const keys = new Set(data[file]);

    for (const key of allKeys) {
      if (!keys.has(key)) {
        console.error(`[I18N][MISSING] ${file}: warning.reasons.${key}`);
        hasErrors = true;
      }
    }
  }

  for (const file of LANG_FILES) {
    for (const key of data[file]) {
      if (!allKeys.has(key)) {
        console.error(`[I18N][EXTRA] ${file}: warning.reasons.${key}`);
        hasErrors = true;
      }
    }
  }

  if (hasErrors) {
    console.error("\n[I18N] ❌ Warning reasons are NOT consistent");
    process.exit(1);
  }

  console.log("[I18N] ✅ Warning reasons are complete and consistent");
  process.exit(0);
}

main();
