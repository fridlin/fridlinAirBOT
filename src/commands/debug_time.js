// src/commands/debug_time.js
const { setDebugState } = require("../utils/debugState");

module.exports = (bot) => {
  bot.command("debug_time", (ctx) => {
    if (!ctx.session?.started) {
      return ctx.reply("/start");
    }

    setDebugState(ctx.from.id, "time");

    ctx.reply(
      "⏱️ *DEBUG TIME MODE*\n\n" +
        "Send your *location* and I will show your REAL local time\n" +
        "(based on your phone/TG client timezone).",
      { parse_mode: "Markdown" },
    );
  });
};
