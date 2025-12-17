const fs = require("fs");
const path = require("path");

// Пути
const templatePath = path.join(__dirname, "README.template.md");
const outputPath = path.join(__dirname, "..", "README.md");

// 1. Загружаем шаблон
let template = fs.readFileSync(templatePath, "utf8");

// 2. Получаем версию
const pkg = require("../package.json");
template = template.replace(/{{VERSION}}/g, pkg.version);

// 3. Команды
const commandTree = require("../src/config/commandTree");
const cmds = commandTree.commands
  .map((c) => `/${c.command} — ${c.description}`)
  .join("\n");

template = template.replace(/{{COMMANDS}}/g, cmds);

// 4. Debug-команды
const debugCommands = `
/debug — главный debug режим
/debug_micro — микропрогноз
/debug_micro_full — полная сетка
/debug_micro_grid — отображение точек
/debug_time — время обновления
`;

template = template.replace(/{{DEBUG_COMMANDS}}/g, debugCommands);

// 5. Параметры
const params = `
radiusStart: 2 km  
radiusEnd: 5 km  
model: micro-weather grid  
`;

template = template.replace(/{{PARAMS}}/g, params);

// 6. Дерево папок
function getTree(dir, prefix = "") {
  const blacklist = ["node_modules", ".git", "__pycache__", ".DS_Store"];

  let result = "";

  const files = fs.readdirSync(dir).filter((f) => !blacklist.includes(f));

  for (const f of files) {
    const full = path.join(dir, f);

    let isDir = false;
    try {
      isDir = fs.statSync(full).isDirectory();
    } catch {
      continue;
    }

    result += prefix + f + (isDir ? "/\n" : "\n");

    if (isDir) {
      result += getTree(full, prefix + "  ");
    }
  }

  return result;
}

const tree = getTree(path.join(__dirname, "..", "src"));
template = template.replace(/{{TREE}}/g, tree);

// 7. Записываем README
fs.writeFileSync(outputPath, template);

console.log("README.md успешно сгенерирован по шаблону!");
