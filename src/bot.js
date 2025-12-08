// FridlinAir – geolocation weather + microforecast + debug

const { Telegraf } = require("telegraf");
const { getWeatherByCoords } = require("./services/weather");

const bot = new Telegraf(process.env.BOT_TOKEN);
const lastLocation = {};

// Админский username
const ADMIN = "fridlins";

// Глобальный перехват команд с префиксом "debug"
bot.use((ctx, next) => {
  const text = ctx.message?.text;
  const username = ctx.from?.username;

  if (!text) return next();

  // Если команда начинается с /debug
  if (text.startsWith("/debug")) {
    // И пользователь НЕ админ
    if (username !== ADMIN) {
      return ctx.reply("⛔ Debug-команды доступны только администратору.");
    }
  }

  return next();
});

// ==== COMMAND MODULES ====
require("./commands/micro")(bot);
require("./commands/debug")(bot);
require("./commands/debug_micro")(bot);
require("./commands/debug_micro_full")(bot);
require("./commands/debug_micro_grid")(bot);
require("./commands/debug_time")(bot);
require("./commands/debug_reset")(bot);

// ==== DEBUG CORE ====
const { getDebugState, setDebugState } = require("./utils/debugState");
const { parseCoords } = require("./utils/coordParser");
const { runDebugMicro } = require("./debug/debug_micro_runner");
const { runDebugMicroFull } = require("./debug/debug_micro_full_runner");
const { runDebugGrid } = require("./debug/debug_micro_grid_runner");
const { runDebugTime } = require("./debug/debug_time_runner");

// =================== BOT COMMANDS ===================

// /start
bot.start((ctx) => {
  ctx.reply(
    "Hello, I'm FridlinAir 🌤\n" +
      "I can show the weather at your location.\n\n" +
      "Use: /here",
  );
});

// /here — request location
bot.command("here", (ctx) => {
  ctx.reply("Send me your location, and I will show the weather.", {
    reply_markup: {
      keyboard: [
        [
          {
            text: "📍 My location",
            request_location: true,
          },
        ],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
});

// =================== UNIFIED LOCATION HANDLER ===================
bot.on("location", async (ctx, next) => {
  const userId = ctx.from.id;
  const { latitude, longitude } = ctx.message.location;

  const debugState = getDebugState(userId);

  if (debugState) {
    // → DEBUG MODE LOCATION
    return runDebugAction(ctx, latitude, longitude, debugState.mode);
  }

  // → NORMAL WEATHER LOCATION
  lastLocation[userId] = { lat: latitude, lon: longitude };

  await ctx.reply(
    `Location received.\n` +
      `Lat: ${latitude.toFixed(3)}\n` +
      `Lon: ${longitude.toFixed(3)}\n\n` +
      "Use this point?",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "✅ Yes", callback_data: "use_location_yes" }],
          [{ text: "❌ No", callback_data: "use_location_no" }],
        ],
      },
    },
  );
});

// =================== CALLBACKS ===================
bot.on("callback_query", async (ctx) => {
  const userId = ctx.from.id;
  const data = ctx.callbackQuery.data;

  // ⛔ Фильтр: если debug — не пускать сюда
  if (data.startsWith("debug_")) {
    return ctx.answerCbQuery("Debug callback ignored (handled elsewhere)");
  }

  if (data === "use_location_yes") {
    const loc = lastLocation[userId];
    if (!loc) {
      await ctx.answerCbQuery();
      return ctx.reply("No saved location. Try again: /here");
    }

    await ctx.answerCbQuery("Loading…");

    try {
      const text = await getWeatherByCoords(loc.lat, loc.lon);
      await ctx.reply(text, { reply_markup: { remove_keyboard: true } });
    } catch (e) {
      console.error(e);
      await ctx.reply("Could not fetch weather. Try later.");
    }
  }

  if (data === "use_location_no") {
    await ctx.answerCbQuery("OK");
    return ctx.reply("Send new location using /here", {
      reply_markup: { remove_keyboard: true },
    });
  }

  await ctx.answerCbQuery();
});

// =================== TEXT HANDLER ===================

// DEBUG TEXT COORDINATES
bot.on("text", async (ctx, next) => {
  const userId = ctx.from.id;
  const state = getDebugState(userId);
  if (!state) return next();

  const coords = parseCoords(ctx.message.text);
  if (!coords) return next();

  return runDebugAction(ctx, coords.lat, coords.lon, state.mode);
});

// =================== DEBUG DISPATCHER ===================
async function runDebugAction(ctx, lat, lon, mode) {
  const id = ctx.from.id;

  if (mode === "micro") return runDebugMicro(ctx, lat, lon);
  if (mode === "micro_full") return runDebugMicroFull(ctx, lat, lon);
  if (mode === "grid") return runDebugGrid(ctx, lat, lon);
  if (mode === "time") return runDebugTime(ctx, lat, lon);

  // After any action → clear debug mode
  setDebugState(id, null);
}

// =================== BOT START ===================
bot.launch().then(() => {
  console.log("FridlinAir bot is running...");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
