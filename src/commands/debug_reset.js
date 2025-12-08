const { setDebugState } = require("../utils/debugState");

module.exports = (bot) => {
  bot.command("debug_reset", (ctx) => {
    setDebugState(ctx.from.id, null);
    ctx.reply("🔄 Debug state reset.");
  });
};
