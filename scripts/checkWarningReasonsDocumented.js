// scripts/checkWarningReasonsDocumented.js

/**
 * Checks that all reason.type used in code
 * are documented in docs/warnings.md
 *
 * Exit codes:
 *   0 = OK
 *   1 = undocumented or obsolete entries
 */

const fs = require("fs");
const path = require("path");

const CHECK_WARNINGS_FILE = path.join(
  __dirname,
  "../src/warnings/checkWarnings.js",
);

const DOC_FILE = path.join(__dirname, "../docs/warnings.md");

function extractReasonTypesFromCode(code) {
  const regex = /type:\s*["'`]([a-z0-9_]+)["'`]/g;
  const types = new Set();
  let match;

  while ((match = regex.exec(code)) !== null) {
    types.add(match[1]);
  }

  return [...types];
}

function extractReasonTypesFromDoc(doc) {
  return doc
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- "))
    .map((l) => l.replace("- ", "").trim());
}

function main() {
  if (!fs.existsSync(CHECK_WARNINGS_FILE)) {
    console.error("[ERROR] checkWarnings.js not found");
    process.exit(1);
  }

  if (!fs.existsSync(DOC_FILE)) {
    console.error("[ERROR] docs/warnings.md not found");
    process.exit(1);
  }

  const code = fs.readFileSync(CHECK_WARNINGS_FILE, "utf8");
  const doc = fs.readFileSync(DOC_FILE, "utf8");

  const codeTypes = new Set(extractReasonTypesFromCode(code));
  const docTypes = new Set(extractReasonTypesFromDoc(doc));

  let hasErrors = false;

  // Used in code but not documented
  for (const type of codeTypes) {
    if (!docTypes.has(type)) {
      console.error(
        `[DOC][MISSING] reason.type "${type}" is used in code but not documented`,
      );
      hasErrors = true;
    }
  }

  // Documented but not used
  for (const type of docTypes) {
    if (!codeTypes.has(type)) {
      console.error(
        `[DOC][OBSOLETE] reason.type "${type}" is documented but not used in code`,
      );
      hasErrors = true;
    }
  }

  if (hasErrors) {
    console.error("\n[DOC] ❌ Warning reasons documentation is out of sync");
    process.exit(1);
  }

  console.log("[DOC] ✅ All warning reason types are documented");
  process.exit(0);
}

main();
