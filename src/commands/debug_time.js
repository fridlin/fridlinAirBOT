const { setDebugState } = require("../utils/debugState");

module.exports = (bot) => {
  bot.command("debug_time", (ctx) => {
    // Activate debug mode "time"
    setDebugState(ctx.from.id, "time");

    ctx.reply(
      "⏱️ *DEBUG TIME MODE*\n\n" +
        "Send your *location* and I will show your REAL local time\n" +
        "(based on your phone/TG client timezone).",
      { parse_mode: "Markdown" },
    );
  });
};
