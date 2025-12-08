const fs = require("fs");
const path = require("path");

const pkg = require("../package.json");

// Список команд
const commands = [
  { cmd: "/start", desc: "Запускает бота" },
  { cmd: "/micro", desc: "Быстрый микропрогноз" },
  { cmd: "/debug", desc: "Главная точка входа для отладки (только admin)" },
  { cmd: "/debug_micro", desc: "Отладка микропрогноза" },
  { cmd: "/debug_micro_full", desc: "Полный вывод микросеток" },
  { cmd: "/debug_micro_grid", desc: "Показать сетку точек" },
  { cmd: "/debug_time", desc: "Анализ времени обновления" },
];

// Параметры, которые у нас есть сейчас
const params = [
  { key: "radiusStart", value: "2 km" },
  { key: "radiusEnd", value: "5 km" },
  { key: "model", value: "micro-weather grid" },
];

const debugCommands = commands.filter((c) => c.cmd.startsWith("/debug"));

const readmeContent = `
# FridlinAirBOT

**Погодный бот с микропрогнозом по координатам.**  
Версия: **${pkg.version}**  
Автообновление README при каждой команде \`npm version\`.

---

## ⚡ Основные команды

${commands
  .filter((c) => !c.cmd.startsWith("/debug"))
  .map((c) => `- **${c.cmd}** — ${c.desc}`)
  .join("\n")}

---

## 🛠 Debug-режимы (только для @fridlins)

${debugCommands.map((c) => `- **${c.cmd}** — ${c.desc}`).join("\n")}

---

## 🔧 Текущие параметры

${params.map((p) => `- **${p.key}:** ${p.value}`).join("\n")}

---

## 🗂 Структура проекта

- **src/bot.js** — основной бот
- **src/commands/** — команды
- **src/services/** — работа с погодными данными
- **src/debug/** — режимы отладки
- **src/utils/** — парсеры, хранилища, вспомогательные модули

---

## 🚀 Автогенерация README

README генерируется автоматически при выполнении:

\`\`\`
npm version patch
\`\`\`

или:

\`\`\`
npm version minor
\`\`\`

Скрипт перезаписывает README.md и обновляет версию.
`;

fs.writeFileSync(
  path.join(__dirname, "..", "README.md"),
  readmeContent.trim() + "\n",
);

console.log("README.md успешно обновлён");
