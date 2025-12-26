// src/commands/debug_micro.js
const { setDebugState } = require("../utils/debugState");

module.exports = (bot) => {
  bot.command("debug_micro", (ctx) => {
    if (!ctx.session?.started) {
      return ctx.reply("/start");
    }

    setDebugState(ctx.from.id, "micro");
    ctx.reply(
      "🔎 Debug micro forecast.\nSend location or type coordinates: `lat lon`",
      { parse_mode: "Markdown" },
    );
  });
};
