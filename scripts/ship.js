// scripts/ship.js
// One-command ship: validate → release → commit → push

const { execSync } = require("child_process");
const readline = require("readline");

function run(cmd, label) {
  console.log(`\n▶ ${label}`);
  execSync(cmd, { stdio: "inherit" });
}

function askCommitMessage() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("\n✏️  Commit message: ", (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  try {
    // 1. Validate JSON
    run(
      `node -e "JSON.parse(require('fs').readFileSync('src/i18n/ru.json'))"`,
      "Validate ru.json",
    );
    run(
      `node -e "JSON.parse(require('fs').readFileSync('src/i18n/en.json'))"`,
      "Validate en.json",
    );

    // 2. Validate commandTree
    run(
      `node -e "
        const ct = require('./src/config/commandTree');
        if (
          !ct.commands ||
          !Array.isArray(ct.commands.public)
        ) {
          throw new Error('commandTree.commands.public must be an array');
        }
      "`,
      "Validate commandTree.commands.public",
    );

    // 3. Generate README
    run("node scripts/generate-readme.js", "Generate README");

    // 4. Release (default = patch)
    const type = process.argv[2] || "patch";
    run(`npm run release ${type}`, `Release (${type})`);

    // 5. Ask for commit message
    const commitMessage = await askCommitMessage();

    if (!commitMessage) {
      console.error("\n❌ Commit message is required. Ship aborted.");
      process.exit(1);
    }

    // 6. Stage all changes
    run("git add -A", "Git add");

    // 7. Commit
    run(`git commit -m "${commitMessage}"`, "Git commit");

    // 8. Push
    run("git push origin main", "Git push");

    console.log("\n✅ SHIP COMPLETED SUCCESSFULLY");
  } catch (err) {
    console.error("\n❌ SHIP FAILED");
    process.exit(1);
  }
}

main();
