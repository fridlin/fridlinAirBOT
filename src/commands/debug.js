// src/commands/debug.js

module.exports = (bot) => {
  bot.command("debug", (ctx) => {
    if (!ctx.session?.started) {
      return ctx.reply("/start");
    }

    const msg = `*🛠 DEBUG MENU*

FridlinAir provides several debugging tools.
Each debug mode accepts:

• GPS location  
• OR typed coordinates:  \`lat lon\`

Available debug modes:

🔹 */debug_micro*  
Quick micro-forecast test. Shows timing and first entries.

🔹 */debug_micro_full*  
Full chain debug (raw → merged → interpolated).

🔹 */debug_micro_grid*  
Display the 2×2 km micro-grid used for micro-forecasting.

🔹 */debug_time*  
Check timezone, local clock, offset, ISO mismatch.

🔹 */debug_reset*  
Stops debug mode if something is stuck.
`;

    return ctx.replyWithMarkdown(msg, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Micro", callback_data: "debug_cmd_micro" },
            { text: "Full", callback_data: "debug_cmd_full" },
          ],
          [
            { text: "Grid", callback_data: "debug_cmd_grid" },
            { text: "Time", callback_data: "debug_cmd_time" },
          ],
          [{ text: "Reset", callback_data: "debug_cmd_reset" }],
        ],
      },
    });
  });

  // BUTTON HANDLERS — convert buttons → commands
  bot.on("callback_query", (ctx, next) => {
    if (!ctx.session?.started) {
      ctx.answerCbQuery();
      return ctx.reply("/start");
    }

    const data = ctx.callbackQuery.data;

    if (data === "debug_cmd_micro") {
      ctx.answerCbQuery();
      return ctx.telegram.sendMessage(ctx.chat.id, "/debug_micro");
    }

    if (data === "debug_cmd_full") {
      ctx.answerCbQuery();
      return ctx.telegram.sendMessage(ctx.chat.id, "/debug_micro_full");
    }

    if (data === "debug_cmd_grid") {
      ctx.answerCbQuery();
      return ctx.telegram.sendMessage(ctx.chat.id, "/debug_micro_grid");
    }

    if (data === "debug_cmd_time") {
      ctx.answerCbQuery();
      return ctx.telegram.sendMessage(ctx.chat.id, "/debug_time");
    }

    if (data === "debug_cmd_reset") {
      ctx.answerCbQuery();
      return ctx.telegram.sendMessage(ctx.chat.id, "/debug_reset");
    }

    return next();
  });
};
