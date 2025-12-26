// src/commands/debug_reset.js
const { setDebugState } = require("../utils/debugState");

module.exports = (bot) => {
  bot.command("debug_reset", (ctx) => {
    if (!ctx.session?.started) {
      return ctx.reply("/start");
    }

    setDebugState(ctx.from.id, null);
    ctx.reply("🔄 Debug state reset.");
  });
};
