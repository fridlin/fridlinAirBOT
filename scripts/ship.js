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
      `node -e "JSON.parse(require('fs').readFileSync('src/i18n/ru.json', 'utf8'))"`,
      "Validate ru.json",
    );
    run(
      `node -e "JSON.parse(require('fs').readFileSync('src/i18n/en.json', 'utf8'))"`,
      "Validate en.json",
    );

    // 2. Validate i18n warning reasons completeness
    run("node scripts/checkI18nWarnings.js", "Validate i18n warning reasons");

    // 3. Validate i18n warning titles
    // NOTE: Use a single-line node -e script to avoid shell/escaping issues in different environments.
    run(
      `node -e "const fs=require('fs'); const langs=['ru','en']; for(const lang of langs){ if(!lang||typeof lang!=='string'){ throw new Error('[SHIP][I18N] invalid lang: '+String(lang)); } const path='src/i18n/'+lang+'.json'; if(!fs.existsSync(path)){ throw new Error('[SHIP][I18N] missing file: '+path); } const data=JSON.parse(fs.readFileSync(path,'utf8')); if(!data.warning){ throw new Error('['+lang+'] missing warning section'); } if(typeof data.warning.title!=='string'){ throw new Error('['+lang+'] missing warning.title'); } if(typeof data.warning.alarm_title!=='string'){ throw new Error('['+lang+'] missing warning.alarm_title'); } } console.log('[I18N] ✅ Warning titles are valid');"`,
      "Validate i18n warning titles",
    );

    // 4. Validate warning reasons are actually used in code
    run(
      "node scripts/checkWarningReasonsUsed.js",
      "Validate warning reasons used in code",
    );

    // 5. Validate alarm semantics (danger vs comfort)
    run("node scripts/checkAlarmSemantics.js", "Validate alarm semantics");

    // 6. Validate commandTree
    run(
      `node -e "const ct=require('./src/config/commandTree'); if(!ct.commands||!Array.isArray(ct.commands.public)){ throw new Error('commandTree.commands.public must be an array'); }"`,
      "Validate commandTree.commands.public",
    );

    // 7. Generate README
    run("node scripts/generate-readme.js", "Generate README");

    // 8. Release (default = patch)
    const type = process.argv[2] || "patch";
    run(`npm run release ${type}`, `Release (${type})`);

    // 9. Ask for commit message
    const commitMessage = await askCommitMessage();

    if (!commitMessage) {
      console.error("\n❌ Commit message is required. Ship aborted.");
      process.exit(1);
    }

    // 10. Stage all changes
    run("git add -A", "Git add");

    // 11. Commit
    run(`git commit -m "${commitMessage}"`, "Git commit");

    // 12. Push
    run("git push origin main", "Git push");

    console.log("\n✅ SHIP COMPLETED SUCCESSFULLY");
  } catch (err) {
    console.error("\n❌ SHIP FAILED");
    process.exit(1);
  }
}

main();
