const { t } = require("../utils/i18n");
const commandTree = require("../config/commandTree");

module.exports = function setupButtons(bot) {
  bot.hears(/.*/, async (ctx, next) => {
    const text = ctx.message.text;

    // пропускаем /команды
    if (text.startsWith("/")) return next();

    const action = commandTree.buttonActions[text];
    if (!action) return;

    switch (action) {
      case "weather":
        return ctx.reply("Погода скоро будет тут...");

      case "route":
        ctx.session.routeMode = "start";
        return ctx.reply("Отправьте точку отправления.");

      case "feedback":
        ctx.session.feedbackWaiting = true;
        return ctx.reply(t(ctx, "feedback_request"));

      case "lang":
        return ctx.reply("Выберите язык...");

      default:
        return;
    }
  });
};
