#!/usr/bin/env node

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

// 1. Обновляем версию без коммита и тега
run(`npm version ${type} --no-git-tag-version`);

// 2. Обновляем VERSION и README
run(`echo $npm_package_version > VERSION`);
run(`node scripts/generate-readme.js`);

// 3. Читаем новую версию
const pkg = require("../package.json");
const version = pkg.version;

// 4. Один единый коммит
run(`git add .`);
run(`git commit -m "release: v${version}"`);

// 5. Создаём тег
run(`git tag v${version}`);

// 6. Отправляем на GitHub
run(`git push`);
run(`git push --tags`);

console.log(`\n🎉 Release v${version} completed successfully!\n`);
