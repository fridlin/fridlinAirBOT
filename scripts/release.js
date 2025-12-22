#!/usr/bin/env node

/**
 * Release script
 * - bumps version (no tag, no auto-commit)
 * - relies on npm postversion hook for:
 *   - VERSION
 *   - README
 *   - CHANGELOG
 * - creates ONE release commit
 *
 * Git push is handled by ship.js only
 */

const { execSync } = require("child_process");

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

const type = process.argv[2];

if (!["patch", "minor", "major"].includes(type)) {
  console.error("Usage: npm run release <patch|minor|major>");
  process.exit(1);
}

// 1. Bump version (this triggers postversion hook)
run(`npm version ${type} --no-git-tag-version`);

// 2. Read updated version
const pkg = require("../package.json");
const version = pkg.version;

// 3. Stage all release artifacts
run(`git add package.json package-lock.json VERSION README.md CHANGELOG.md`);

// 4. Single release commit
run(`git commit -m "release: v${version}"`);

console.log(`\n✅ Release v${version} prepared successfully (no push)\n`);
