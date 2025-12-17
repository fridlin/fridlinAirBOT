const { t } = require("../utils/i18n");

module.exports = function (bot, ADMIN_ID) {

  bot.command("feedback", (ctx) => {
    ctx.session.feedbackWaiting = true;
    return ctx.reply(t(ctx, "feedback_request"));
  });

  bot.on("text", async (ctx) => {
    if (!ctx.session.feedbackWaiting) return;

    ctx.session.feedbackWaiting = false;

    // отправляем админу
    await ctx.telegram.sendMessage(
      ADMIN_ID,
      `🆕 Новый отзыв от @${ctx.from.username || "неизвестно"}\n\n${ctx.message.text}`
    );

    return ctx.reply(t(ctx, "feedback_sent"));
  });
};
