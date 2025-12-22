// src/commands/micro.js

const { getMicroForecast } = require("../services/weatherMicro");
const { setUserData } = require("../utils/userStore");
const tzlookup = require("tz-lookup");
const { t } = require("../utils/i18n");
const analyzeForecastWindow = require("../utils/analyzeForecastWindow");
const { checkWarnings } = require("../warnings/checkWarnings");
const { formatWarning } = require("../warnings/formatWarning");
const { formatMicroForecast } = require("../formatters/microForecastFormatter");

const DEV_LOG = true;

/*
  Find forecast index closest to current UTC time
*/
function findStartIndex(forecast) {
  const nowUtc = Date.now();

  let bestIndex = 0;
  let bestDiff = Infinity;

  for (let i = 0; i < forecast.length; i++) {
    const forecastUtc = new Date(forecast[i].time).getTime();
    const diff = Math.abs(forecastUtc - nowUtc);

    if (diff < bestDiff) {
      bestDiff = diff;
      bestIndex = i;
    }
  }

  return bestIndex;
}

// ===========================
// NORMALIZERS
// ===========================
function normalizeWindSpeed(p) {
  if (typeof p?.wind?.speed === "number") return p.wind.speed;
  if (typeof p?.windspeed === "number") return p.windspeed;
  return null;
}

function normalizePrecipitation(p) {
  if (typeof p?.precipitation?.amount === "number") {
    return p.precipitation.amount;
  }
  return 0;
}

function normalizeFeelsLike(p) {
  if (typeof p?.feelsLike === "number") return p.feelsLike;
  return null;
}

module.exports = (bot) => {
  // ===========================
  // LOCATION → RUN MICRO FORECAST
  // ===========================
  bot.on("location", async (ctx) => {
    const userId = ctx.from.id;
    const { latitude, longitude } = ctx.message.location;

    if (DEV_LOG) {
      console.log(
        `[MICRO] Location received from ${userId}:`,
        latitude,
        longitude,
      );
    }

    await ctx.reply(t(ctx, "calculating_micro"));

    // Timezone
    let timezone;
    try {
      timezone = tzlookup(latitude, longitude);
    } catch (e) {
      console.error("[MICRO] Timezone lookup failed", e);
      return ctx.reply(t(ctx, "timezone_error"));
    }

    // Forecast
    let forecast;
    try {
      forecast = await getMicroForecast(latitude, longitude);
    } catch (e) {
      console.error("[MICRO] Forecast fetch failed", e);
      return ctx.reply(t(ctx, "forecast_error"));
    }

    setUserData(userId, { forecast, timezone });

    if (DEV_LOG) {
      console.log("[MICRO] Forecast stored for:", userId);
    }

    // ===========================
    // WINDOW: 2 HOURS, STEP 30 MIN
    // ===========================
    const STEP = 2; // 2 × 15 min
    const COUNT_2H = 4;

    const start = findStartIndex(forecast);

    const rawSlice = forecast
      .slice(start)
      .filter((_, index) => index % STEP === 0)
      .slice(0, COUNT_2H);

    const slice = analyzeForecastWindow(rawSlice);

    // ===========================
    // HEADER
    // ===========================
    let text =
      `🌤 ${t(ctx, "micro_title")}\n` +
      `${t(ctx, "micro_subtitle")}\n` +
      `${t(ctx, "micro_area_note")}\n` +
      `${t(ctx, "timezone_label")}: ${timezone}\n\n`;

    // BODY (UI formatter)
    text += formatMicroForecast(slice, timezone);

    // ===========================
    // WARNINGS
    // ===========================
    const current = slice[0];

    const now = {
      temperature: current.temperature,
      feels_like: normalizeFeelsLike(current),
      wind_speed: normalizeWindSpeed(current),
      humidity: typeof current.humidity === "number" ? current.humidity : null,
      precipitation: normalizePrecipitation(current),
    };

    const timeline = slice.slice(1).map((p) => ({
      time: new Date(p.time).getTime(),
      data: {
        temperature: p.temperature,
        feels_like: normalizeFeelsLike(p),
        wind_speed: normalizeWindSpeed(p),
        humidity: typeof p.humidity === "number" ? p.humidity : null,
        precipitation: normalizePrecipitation(p),
      },
    }));

    const warning = checkWarnings(now, timeline, Date.now());

    if (DEV_LOG) {
      console.log("[WARNING]", JSON.stringify(warning, null, 2));
    }

    // ===========================
    // SEND
    // ===========================
    await ctx.reply(text);

    if (warning) {
      const warningText = formatWarning(warning, (k) => t(ctx, k));
      await ctx.reply(warningText);
    }
  });
};
