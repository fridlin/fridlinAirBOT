// scripts/checkWarningReasonsUsed.js

/**
 * Checks that all warning.reasons keys in i18n
 * are реально используемые reason.type в коде
 *
 * Strategy:
 * - Parse checkWarnings.js
 * - Extract all `{ type: "..." }`
 * - Compare with i18n warning.reasons.*
 *
 * Exit code:
 *   0 = OK
 *   1 = unused or missing mappings
 */

const fs = require("fs");
const path = require("path");

const CHECK_WARNINGS_FILE = path.join(
  __dirname,
  "../src/warnings/checkWarnings.js",
);

const I18N_DIR = path.join(__dirname, "../src/i18n");
const LANG_FILES = ["ru.json", "en.json"];

function extractReasonTypesFromCode(code) {
  const regex = /type:\s*["'`]([a-z0-9_]+)["'`]/g;
  const types = new Set();
  let match;

  while ((match = regex.exec(code)) !== null) {
    types.add(match[1]);
  }

  return [...types];
}

function extractI18nReasons(json) {
  return Object.keys(json?.warning?.reasons || []);
}

function main() {
  if (!fs.existsSync(CHECK_WARNINGS_FILE)) {
    console.error("[ERROR] checkWarnings.js not found");
    process.exit(1);
  }

  const code = fs.readFileSync(CHECK_WARNINGS_FILE, "utf8");
  const usedTypes = extractReasonTypesFromCode(code);

  const i18nTypes = new Set();

  for (const file of LANG_FILES) {
    const fullPath = path.join(I18N_DIR, file);
    const json = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    extractI18nReasons(json).forEach((t) => i18nTypes.add(t));
  }

  let hasErrors = false;

  // i18n key exists but never used in code
  for (const key of i18nTypes) {
    if (!usedTypes.includes(key)) {
      console.error(
        `[I18N][UNUSED] warning.reasons.${key} exists in i18n but not used in code`,
      );
      hasErrors = true;
    }
  }

  // reason.type used in code but missing in i18n
  for (const type of usedTypes) {
    if (!i18nTypes.has(type)) {
      console.error(
        `[I18N][MISSING] warning.reasons.${type} used in code but missing in i18n`,
      );
      hasErrors = true;
    }
  }

  if (hasErrors) {
    console.error("\n[I18N] ❌ Reason types mismatch between code and i18n");
    process.exit(1);
  }

  console.log("[I18N] ✅ All warning reason types are used and translated");
  process.exit(0);
}

main();
