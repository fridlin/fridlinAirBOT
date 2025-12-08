const { setDebugState } = require("../utils/debugState");

module.exports = (bot) => {
  bot.command("debug_micro_grid", (ctx) => {
    setDebugState(ctx.from.id, "grid");
    ctx.reply("🗺 Send location or coordinates to visualize grid.");
  });
};
