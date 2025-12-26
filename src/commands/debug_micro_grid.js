// src/commands/debug_micro_grid.js
const { setDebugState } = require("../utils/debugState");

module.exports = (bot) => {
  bot.command("debug_micro_grid", (ctx) => {
    if (!ctx.session?.started) {
      return ctx.reply("/start");
    }

    setDebugState(ctx.from.id, "grid");
    ctx.reply("🗺 Send location or coordinates to visualize grid.");
  });
};
