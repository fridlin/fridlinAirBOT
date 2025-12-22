// scripts/generate-changelog.js
const { execSync } = require("child_process");
const fs = require("fs");

const version = fs.readFileSync("VERSION", "utf8").trim();
const date = new Date().toISOString().slice(0, 10);

// find previous version tag/commit
let prev;
try {
  prev = execSync(`git log --grep="^v" --pretty=format:%H -n 1 HEAD~1`, {
    encoding: "utf8",
  }).trim();
} catch {
  prev = "";
}

const range = prev ? `${prev}..HEAD` : "HEAD";

const commits = execSync(
  `git log ${range} --pretty=format:"- %s" --no-merges`,
  { encoding: "utf8" },
).trim();

const block = `
## v${version} — ${date}

${commits || "- Initial release"}
`;

let changelog = "# Changelog\n";
if (fs.existsSync("CHANGELOG.md")) {
  changelog = fs.readFileSync("CHANGELOG.md", "utf8");
}

fs.writeFileSync(
  "CHANGELOG.md",
  changelog.replace("# Changelog\n", `# Changelog\n${block}\n`),
);

console.log("CHANGELOG.md updated");
