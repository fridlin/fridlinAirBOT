// src/bot.js

const { Telegraf, Markup } = require("telegraf");
const session = require("./middleware/session");

const UI = require("./ui/textLayout");
const { t } = require("./utils/i18n");
const languages = require("./config/lang");

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());

// ======================================================================
// LANGUAGE ENTRY — config-driven, scalable
// ======================================================================
function languageEntry(ctx) {
  const text = UI.title(t(ctx, "language.title"), "🌍");

  const buttons = Object.values(languages).map((lang) =>
    Markup.button.callback(`${lang.flag} ${lang.label}`, `lang_${lang.code}`),
  );

  return ctx.reply(text, Markup.inlineKeyboard(buttons));
}

// ======================================================================
// GLOBAL UX ENTRY
// Any unknown text → onboarding
// ======================================================================
bot.use(async (ctx, next) => {
  if (!ctx.message?.text) return next();
  if (ctx.message.text.startsWith("/")) return next();
  if (ctx.callbackQuery || ctx.message.location) return next();

  return languageEntry(ctx);
});

// ======================================================================
// STORES & CONFIG
// ======================================================================
const commandTree = require("./config/commandTree");
bot.telegram.setMyCommands(commandTree.commands.public);

// ======================================================================
// /start — ALWAYS onboarding
// ======================================================================
bot.start((ctx) => languageEntry(ctx));

// ======================================================================
// CALLBACK HANDLER (language selection)
// ======================================================================
bot.on("callback_query", async (ctx) => {
  const data = ctx.callbackQuery.data;

  if (data.startsWith("lang_")) {
    const code = data.replace("lang_", "");

    if (languages[code]) {
      ctx.session.lang = code;
      await ctx.answerCbQuery();

      const text = UI.block(
        t(ctx, "welcome.title"),
        t(ctx, "welcome.subtitle"),
        t(ctx, "welcome.location_request"),
      );

      return ctx.reply(
        text,
        Markup.keyboard([
          Markup.button.locationRequest(t(ctx, "welcome.send_location_button")),
        ])
          .resize()
          .oneTime(),
      );
    }
  }

  await ctx.answerCbQuery();
});

// ======================================================================
// COMMANDS
// ======================================================================
require("./commands/micro")(bot);
require("./commands/debug")(bot);
require("./commands/debug_micro")(bot);
require("./commands/debug_micro_full")(bot);
require("./commands/debug_micro_grid")(bot);
require("./commands/debug_time")(bot);
require("./commands/debug_reset")(bot);

// ======================================================================
// BOT START
// ======================================================================
bot.launch().then(() => {
  console.log("FridlinAir BOT is running…");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
