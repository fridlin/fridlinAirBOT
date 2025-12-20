// FridlinAir – geolocation weather + microforecast + debug

const { Telegraf, Markup } = require("telegraf");
const session = require("./middleware/session");

// === BOT INSTANCE ===
const bot = new Telegraf(process.env.BOT_TOKEN);

// включаем поддержку ctx.session
bot.use(session());

// ======================================================================
// GLOBAL UX ENTRY (safe, no recursion)
// ======================================================================
bot.use(async (ctx, next) => {
  // реагируем только на обычный текст
  if (!ctx.message?.text) return next();

  const text = ctx.message.text;

  // команды и debug не трогаем
  if (text.startsWith("/")) return next();

  // если это callback / location / service — пропускаем
  if (ctx.callbackQuery || ctx.message.location) return next();

  // UX entry
  await ctx.reply(
    "🌍 Choose language / Выберите язык",
    Markup.inlineKeyboard([
      Markup.button.callback("🇬🇧 English", "lang_en"),
      Markup.button.callback("🇷🇺 Русский", "lang_ru"),
    ]),
  );

  // ❗ НЕ вызываем next() — сознательно останавливаем пайплайн
});

// === STORES & CONFIG ===
const userStore = require("./utils/userStore");
const commandTree = require("./config/commandTree");

// === FEEDBACK ===
const feedbackCommand = require("./commands/feedback");

// === WEATHER ===
const { getWeatherByCoords } = require("./services/weather");

// === DEBUG SYSTEM ===
const { getDebugState, setDebugState } = require("./utils/debugState");
const { parseCoords } = require("./utils/coordParser");
const { runDebugMicro } = require("./debug/debug_micro_runner");
const { runDebugMicroFull } = require("./debug/debug_micro_full_runner");
const { runDebugGrid } = require("./debug/debug_micro_grid_runner");
const { runDebugTime } = require("./debug/debug_time_runner");

// === ADMIN DATA ===
const ADMIN_USERNAME = "fridlins";
const ADMIN_ID = 36837506;

// хранение последней локации по пользователям
const lastLocation = {};

// === UX FLOW STATE (temporary, no persistence) ===
const uxState = {};

// === REGISTER TELEGRAM COMMANDS ===
bot.telegram.setMyCommands(commandTree.commands);

// ======================================================================
// 🗺 ROUTE FEATURE — placeholder until full implementation
// ======================================================================
function startRouteMode(ctx) {
  ctx.session.routeMode = null;
  return ctx.reply("🗺 Режим маршрутов пока в разработке.");
}

// ======================================================================
// /start — UX onboarding
// ======================================================================
bot.start((ctx) => {
  uxState[ctx.from.id] = { step: "lang" };

  return ctx.reply(
    "🌍 Choose language / Выберите язык",
    Markup.inlineKeyboard([
      Markup.button.callback("🇬🇧 English", "lang_en"),
      Markup.button.callback("🇷🇺 Русский", "lang_ru"),
    ]),
  );
});

// === BUTTONS MUST BE HERE
const setupButtons = require("./handlers/buttons");
setupButtons(bot);

// ======================================================================
// FEEDBACK INIT
// ======================================================================
feedbackCommand(bot, ADMIN_ID);

// ======================================================================
// DEBUG ACCESS FILTER
// ======================================================================
bot.use((ctx, next) => {
  const text = ctx.message?.text;
  const username = ctx.from?.username;

  if (!text) return next();

  if (text.startsWith("/debug") && username !== ADMIN_USERNAME) {
    return ctx.reply("⛔ Debug-команды доступны только администратору.");
  }

  return next();
});

// ======================================================================
// DEBUG COMMAND MODULES
// ======================================================================
require("./commands/debug")(bot);
require("./commands/debug_micro")(bot);
require("./commands/debug_micro_full")(bot);
require("./commands/debug_micro_grid")(bot);
require("./commands/debug_time")(bot);
require("./commands/debug_reset")(bot);

// ======================================================================
// MICRO COMMAND
// ======================================================================
require("./commands/micro")(bot);

// ======================================================================
// LOCATION HANDLER (без изменений)
// ======================================================================
bot.on("location", async (ctx) => {
  const userId = ctx.from.id;
  const { latitude, longitude } = ctx.message.location;

  const state = getDebugState(userId);

  if (state) {
    return runDebugAction(ctx, latitude, longitude, state.mode);
  }

  lastLocation[userId] = { lat: latitude, lon: longitude };

  await ctx.reply(
    `Получил локацию.\n` +
      `Lat: ${latitude.toFixed(3)}\n` +
      `Lon: ${longitude.toFixed(3)}\n\n` +
      `Использовать эту точку?`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "✅ Да", callback_data: "use_location_yes" }],
          [{ text: "❌ Нет", callback_data: "use_location_no" }],
        ],
      },
    },
  );
});

// ======================================================================
// CALLBACK HANDLER
// ======================================================================
bot.on("callback_query", async (ctx) => {
  const userId = ctx.from.id;
  const data = ctx.callbackQuery.data;

  // === LANGUAGE SELECT ===
  if (data === "lang_en" || data === "lang_ru") {
    ctx.session.lang = data === "lang_en" ? "en" : "ru";
    uxState[userId] = { step: "welcome" };

    await ctx.answerCbQuery();

    return ctx.reply(
      ctx.session.lang === "en"
        ? "Welcome to FridlinAir 🌤\n\nWe show very precise weather near you.\n\n📍 Please send your current location."
        : "Добро пожаловать в FridlinAir 🌤\n\nМы показываем очень точную погоду рядом с вами.\n\n📍 Пожалуйста, отправьте ваше местоположение.",
      Markup.keyboard([
        Markup.button.locationRequest(
          ctx.session.lang === "en"
            ? "📍 Send location"
            : "📍 Отправить локацию",
        ),
      ])
        .resize()
        .oneTime(),
    );
  }

  // === DEBUG CALLBACKS ===
  if (data.startsWith("debug_")) {
    return ctx.answerCbQuery("Debug callback handled separately");
  }

  // === LOCATION CONFIRM ===
  if (data === "use_location_yes") {
    const loc = lastLocation[userId];
    if (!loc) {
      await ctx.answerCbQuery();
      return ctx.reply("Нет сохранённой локации. Попробуйте снова.");
    }

    await ctx.answerCbQuery("Загружаю…");

    try {
      const text = await getWeatherByCoords(loc.lat, loc.lon);
      await ctx.reply(text);
    } catch (e) {
      console.error(e);
      await ctx.reply("Ошибка получения погоды.");
    }
  }

  if (data === "use_location_no") {
    await ctx.answerCbQuery("Ок");
    return ctx.reply("Отправьте новую локацию.");
  }

  await ctx.answerCbQuery();
});

// ======================================================================
// DEBUG COORDINATE INPUT
// ======================================================================
bot.on("text", async (ctx, next) => {
  const userId = ctx.from.id;
  const state = getDebugState(userId);
  if (!state) return next();

  const coords = parseCoords(ctx.message.text);
  if (!coords) return next();

  return runDebugAction(ctx, coords.lat, coords.lon, state.mode);
});

// ======================================================================
// DEBUG DISPATCHER
// ======================================================================
async function runDebugAction(ctx, lat, lon, mode) {
  const id = ctx.from.id;

  if (mode === "micro") return runDebugMicro(ctx, lat, lon);
  if (mode === "micro_full") return runDebugMicroFull(ctx, lat, lon);
  if (mode === "grid") return runDebugGrid(ctx, lat, lon);
  if (mode === "time") return runDebugTime(ctx, lat, lon);

  setDebugState(id, null);
}

// ======================================================================
// UX FALLBACK — любое обычное сообщение (реальный fallback)
// ======================================================================
bot.hears(/.*/, async (ctx) => {
  const text = ctx.message?.text;
  if (!text) return;
  if (text.startsWith("/")) return;

  return ctx.reply(
    "🌍 Choose language / Выберите язык",
    Markup.inlineKeyboard([
      Markup.button.callback("🇬🇧 English", "lang_en"),
      Markup.button.callback("🇷🇺 Русский", "lang_ru"),
    ]),
  );
});

// ======================================================================
// BOT START
// ======================================================================
bot.launch().then(() => {
  console.log("FridlinAir BOT is running…");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
