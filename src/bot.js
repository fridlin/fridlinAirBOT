const { Telegraf, Markup } = require("telegraf");
const session = require("./middleware/session");
const UI = require("./ui/textLayout");
const { t } = require("./utils/i18n");

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());

// ======================================================================
// LANGUAGE ENTRY (single source of truth)
// ======================================================================
function languageEntry(ctx) {
  const text = UI.title(
    `${t(ctx, "language.title")} / ${t(ctx, "language.title_ru")}`,
    "🌍",
  );

  return ctx.reply(
    text,
    Markup.inlineKeyboard([
      Markup.button.callback("🇬🇧 English", "lang_en"),
      Markup.button.callback("🇷🇺 Русский", "lang_ru"),
    ]),
  );
}

// ======================================================================
// GLOBAL UX ENTRY
// Любой текст вне наших команд = /start (onboarding)
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
// /start — основной onboarding ВСЕГДА
// ======================================================================
bot.start((ctx) => {
  return languageEntry(ctx);
});

// ======================================================================
// BUTTON HANDLERS
// ======================================================================
const setupButtons = require("./handlers/buttons");
setupButtons(bot);

// ======================================================================
// CALLBACK HANDLER
// ======================================================================
bot.on("callback_query", async (ctx) => {
  const data = ctx.callbackQuery.data;

  if (data === "lang_en" || data === "lang_ru") {
    ctx.session.lang = data === "lang_en" ? "en" : "ru";
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
