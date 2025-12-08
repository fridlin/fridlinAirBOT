#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

const type = process.argv[2];

if (!["patch", "minor", "major"].includes(type)) {
  console.error("Usage: npm run release <patch|minor|major>");
  process.exit(1);
}

// 1. Bump версии БЕЗ коммита и БЕЗ тега
run(`npm version ${type} --no-git-tag-version`);

// 2. Читаем новую версию
const pkg = require("../package.json");
const version = pkg.version;

// 3. Обновляем VERSION
fs.writeFileSync(path.join(__dirname, "..", "VERSION"), version);

// 4. Генерируем README
run(`node scripts/generate-readme.js`);

// 5. Генерируем CHANGELOG (один раз!)
run(`npm run changelog:${type}`);

// 6. Один релизный коммит
run(`git add .`);
run(`git commit -m "release: v${version}"`);

// 7. Создаём тег
run(`git tag v${version}`);

// 8. Пушим изменения и тег
run(`git push`);
run(`git push --tags`);

console.log(`\n🎉 Release v${version} completed successfully!\n`);
