// src/commands/debug_micro_full.js
const { setDebugState } = require("../utils/debugState");

module.exports = (bot) => {
  bot.command("debug_micro_full", (ctx) => {
    if (!ctx.session?.started) {
      return ctx.reply("/start");
    }

    setDebugState(ctx.from.id, "micro_full");
    ctx.reply("🧪 Full debug mode.\nSend location or type coordinates.");
  });
};
