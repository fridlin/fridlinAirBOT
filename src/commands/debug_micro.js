const { setDebugState } = require("../utils/debugState");

module.exports = (bot) => {
  bot.command("debug_micro", (ctx) => {
    setDebugState(ctx.from.id, "micro");
    ctx.reply(
      "🔎 Debug micro forecast.\nSend location or type coordinates: `lat lon`",
      {
        parse_mode: "Markdown",
      },
    );
  });
};
