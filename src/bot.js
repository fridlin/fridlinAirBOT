// src/bot.js

const { Telegraf, Markup } = require("telegraf");
const session = require("./middleware/session");

const UI = require("./ui/textLayout");
const { t } = require("./utils/i18n");
const languages = require("./config/lang");

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());

// ======================================================================
// LANGUAGE ENTRY
// ======================================================================
function languageEntry(ctx) {
  const text = UI.title(t(ctx, "language.title"), "🌍");

  const buttons = Object.values(languages).map((lang) =>
    Markup.button.callback(`${lang.flag} ${lang.label}`, `lang_${lang.code}`),
  );

  return ctx.reply(text, Markup.inlineKeyboard(buttons));
}

// ======================================================================
// GLOBAL GATE — ONBOARDING FIRST
// ======================================================================
bot.use(async (ctx, next) => {
  // system / service updates
  if (!ctx.from) return next();

  // /start is always allowed
  if (ctx.message?.text === "/start") {
    return next();
  }

  // language selection buttons
  if (ctx.callbackQuery?.data?.startsWith("lang_")) {
    return next();
  }

  // commands allowed ONLY after onboarding
  if (ctx.message?.text?.startsWith("/")) {
    if (!ctx.session?.started) {
      return ctx.reply("/start");
    }
    return next();
  }

  // location allowed ONLY after onboarding
  if (ctx.message?.location) {
    if (!ctx.session?.started) {
      return ctx.reply("/start");
    }
    return next();
  }

  // ANY other text → restart onboarding
  if (ctx.message?.text) {
    return ctx.reply("/start");
  }

  return next();
});

// ======================================================================
// BOT COMMAND LIST
// ======================================================================
const commandTree = require("./config/commandTree");
bot.telegram.setMyCommands(commandTree.commands.public);

// ======================================================================
// /start — ALWAYS resets onboarding
// ======================================================================
bot.start((ctx) => {
  ctx.session.started = false;
  return languageEntry(ctx);
});

// ======================================================================
// CALLBACK HANDLER — LANGUAGE SELECTION
// ======================================================================
bot.on("callback_query", async (ctx) => {
  const data = ctx.callbackQuery.data;

  if (data.startsWith("lang_")) {
    const code = data.replace("lang_", "");

    if (languages[code]) {
      ctx.session.lang = code;
      ctx.session.started = true;

      await ctx.answerCbQuery();

      return ctx.reply(
        t(ctx, "welcome.location_request"),
        Markup.keyboard([
          Markup.button.locationRequest(
            t(ctx, "welcome.send_location_button"),
          ),
        ])
          .resize()
          .oneTime(),
      );
    }
  }

  await ctx.answerCbQuery();
});

// ======================================================================
// COMMAND MODULES (pure logic, no onboarding inside)
// ======================================================================
require("./commands/micro")(bot);
require("./commands/debug")(bot);
require("./commands/debug_micro")(bot);
require("./commands/debug_micro_full")(bot);
require("./commands/debug_micro_grid")(bot);
require("./commands/debug_time")(bot);
require("./commands/debug_reset")(bot);

// ======================================================================
// BOT START (ONLY ONE LAUNCH POINT)
// ======================================================================
bot.launch().then(() => {
  console.log("FridlinAir BOT is running…");
});

// graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
