// scripts/ship.js
// Safe ship: commit first → validate → push
// Never lose work if validation fails

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
  console.log("\n🚢 Ship started"); // visual anchor

  try {
    // 0. Show current state
    run("git status", "Git status");

    // 1. Commit FIRST (checkpoint)
    const message = await askCommitMessage();
    if (!message) {
      console.error("❌ Commit message is required.");
      process.exit(1);
    }

    run("git add -A", "Stage all changes");
    run(`git commit -m "${message}"`, "Commit changes");

    // 2. Validate JSON
    run(
      `node -e "JSON.parse(require('fs').readFileSync('src/i18n/ru.json','utf8'))"`,
      "Validate ru.json",
    );
    run(
      `node -e "JSON.parse(require('fs').readFileSync('src/i18n/en.json','utf8'))"`,
      "Validate en.json",
    );

    // 3. Push LAST
    run("git push", "Push to remote");

    console.log("\n✅ Ship completed successfully."); // visual anchor
  } catch (err) {
    console.error("\n⚠️ Ship failed AFTER commit.");
    console.error("✔ Your work is safely committed.");
    console.error("✔ Fix the issue and run ship again.");
    process.exit(1);
  }
}

main();
