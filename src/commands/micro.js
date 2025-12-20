// src/commands/micro.js
// All comments in English

const { getMicroForecast } = require("../services/weatherMicro");
const { setUserData } = require("../utils/userStore");
const tzlookup = require("tz-lookup");
const { t } = require("../utils/i18n");
const analyzeForecastWindow = require("../utils/analyzeForecastWindow");
const { getWeatherText } = require("../utils/weatherText");
const { checkWarnings } = require("../warnings/checkWarnings");
const { formatWarning } = require("../warnings/formatWarning");

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

function normalizeWindSpeed(p) {
  if (typeof p?.wind?.speed === "number") return p.wind.speed;
  return 0;
}

function normalizeHumidity(p) {
  if (typeof p?.humidity === "number") return p.humidity;
  return null;
}

function normalizePrecipitation(p) {
  if (typeof p?.precipitation?.amount === "number") {
    return p.precipitation.amount;
  }
  return 0;
}

module.exports = (bot) => {
  // ===========================
  // /micro (entry command)
  // ===========================
  bot.command("micro", (ctx) => {
    if (DEV_LOG) console.log("[MICRO] /micro called by:", ctx.from.id);
    return ctx.reply(t(ctx, "askLocation"));
  });

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

    // Inform user
    await ctx.reply(t(ctx, "calculating_micro"));

    // Determine timezone
    let timezone;
    try {
      timezone = tzlookup(latitude, longitude);
    } catch (e) {
      console.error("[MICRO] Timezone lookup failed", e);
      return ctx.reply(t(ctx, "timezone_error"));
    }

    // Get micro forecast
    let forecast;
    try {
      forecast = await getMicroForecast(latitude, longitude);
    } catch (e) {
      console.error("[MICRO] Forecast fetch failed", e);
      return ctx.reply(t(ctx, "forecast_error"));
    }

    // Store raw forecast
    setUserData(userId, { forecast, timezone });

    if (DEV_LOG) {
      console.log("[MICRO] Forecast stored for:", userId);
    }

    // ===========================
    // FIXED WINDOW: 2 HOURS (4 points)
    // ===========================
    const COUNT_2H = 4;

    const start = findStartIndex(forecast);
    // ===========================
    // NORMALIZERS (real data shape)
    // ===========================
    function normalizeWindSpeed(p) {
      if (typeof p?.wind?.speed === "number") return p.wind.speed;
      if (typeof p?.windspeed === "number") return p.windspeed;
      return 0;
    }

    function normalizeFeelsLike(p) {
      if (typeof p?.feelsLike === "number") return p.feelsLike;
      return null;
    }

    function normalizePrecipitation(p) {
      if (typeof p?.precipitation?.amount === "number") {
        return p.precipitation.amount;
      }
      return 0;
    }

    const rawSlice = forecast.slice(start, start + COUNT_2H);

    // Analyze trends and normalize data
    const slice = analyzeForecastWindow(rawSlice);

    // ===========================
    // BUILD MAIN OUTPUT
    // ===========================
    let text =
      `🌤 ${t(ctx, "micro_title")}\n` +
      `${t(ctx, "micro_subtitle")}\n` +
      `${t(ctx, "micro_area_note")}\n` +
      `${t(ctx, "timezone_label")}: ${timezone}\n\n`;

    const arrow = (v) => (v === "up" ? "↑" : v === "down" ? "↓" : "→");
    const safe = (v) =>
      typeof v === "number" && !Number.isNaN(v) ? v.toFixed(1) : "–";

    for (const p of slice) {
      // Short weather description
      p.text = getWeatherText(p);

      const localTime = new Date(p.time).toLocaleTimeString("en-GB", {
        timeZone: timezone,
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });

      text +=
        `${localTime}  ` +
        `🌡 ${safe(p.temperature)}°C ${arrow(p.trend?.temperature)}  ` +
        `🤔 ${safe(p.feelsLike)}°C ${arrow(p.trend?.feelsLike)}  ` +
        `🌧 ${p.precipitation?.probability ?? 0}%  ` +
        `💨 ${safe(p.wind?.speed)} m/s ${arrow(p.trend?.wind)}\n`;
    }

    // ===========================
    // WARNINGS
    // ===========================
    const current = slice[0];
    if (DEV_LOG && !current.wind && typeof current.windspeed === "number") {
      console.warn("[MICRO] wind normalized from windspeed at", current.time);
    }

    if (DEV_LOG && typeof current.feelsLike !== "number") {
      console.warn("[MICRO] feelsLike missing at", current.time);
    }

    const now = {
      temperature: current.temperature,
      feels_like: normalizeFeelsLike(current),
      wind_speed: normalizeWindSpeed(current),
      humidity: typeof current.humidity === "number" ? current.humidity : null,
      precipitation: normalizePrecipitation(current)
    };


    const timeline = slice.slice(1).map((p) => ({
      time: new Date(p.time).getTime(),
      data: {
        temperature: p.temperature,
        feels_like: normalizeFeelsLike(p),
        wind_speed: normalizeWindSpeed(p),
        humidity: typeof p.humidity === "number" ? p.humidity : null,
        precipitation: normalizePrecipitation(p)
      }
    }));


    const warning = checkWarnings(now, timeline, Date.now());

    if (DEV_LOG) {
      console.log("[WARNING]", JSON.stringify(warning, null, 2));
    }

    // ===========================
    // SEND MESSAGES
    // ===========================
    await ctx.reply(text);

    if (warning) {
      const warningText = formatWarning(warning, (k) => t(ctx, k));
      await ctx.reply(warningText);
    }

    return;
  });
};
