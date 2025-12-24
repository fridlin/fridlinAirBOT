// scripts/checkAlarmSemantics.js

/**
 * Checks alarm semantics in checkWarnings.js
 *
 * Rules:
 * - type: "alarm" must be used ONLY for danger
 * - Direct alarm reasons must be storm-related
 * - Comfort reasons must not force alarm directly
 *
 * Exit codes:
 *   0 = OK
 *   1 = semantic violations found
 */

const fs = require("fs");
const path = require("path");

const CHECK_WARNINGS_FILE = path.join(
  __dirname,
  "../src/warnings/checkWarnings.js",
);

// Allowed direct alarm reasons (hard danger)
const ALLOWED_ALARM_REASONS = new Set(["storm_now", "storm_future"]);

function extractAlarmReturns(code) {
  const regex = /return\s*\{\s*type:\s*["']alarm["'][\s\S]*?\}/g;
  return code.match(regex) || [];
}

function extractReasonTypes(block) {
  const regex = /type:\s*["'`]([a-z0-9_]+)["'`]/g;
  const types = [];
  let match;

  while ((match = regex.exec(block)) !== null) {
    types.push(match[1]);
  }

  return types;
}

function main() {
  if (!fs.existsSync(CHECK_WARNINGS_FILE)) {
    console.error("[ERROR] checkWarnings.js not found");
    process.exit(1);
  }

  const code = fs.readFileSync(CHECK_WARNINGS_FILE, "utf8");
  const alarmReturns = extractAlarmReturns(code);

  let hasErrors = false;

  for (const block of alarmReturns) {
    const types = extractReasonTypes(block);

    for (const type of types) {
      if (!ALLOWED_ALARM_REASONS.has(type)) {
        console.error(
          `[ALARM][INVALID] reason.type "${type}" used in alarm return`,
        );
        hasErrors = true;
      }
    }
  }

  if (hasErrors) {
    console.error("\n[ALARM] ❌ Alarm semantics violated");
    process.exit(1);
  }

  console.log("[ALARM] ✅ Alarm semantics are correct");
  process.exit(0);
}

main();
