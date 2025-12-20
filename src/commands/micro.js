const { getMicroForecast } = require("../services/weatherMicro");
const { setUserData } = require("../utils/userStore");
const tzlookup = require("tz-lookup");

const DEV_LOG = true;

/*
   Convert forecast timestamps and NOW into the same local timezone,
   then find the nearest 15-min forecast point.
*/
function findStartIndex(forecast, timezone) {
  const nowLocalStr = new Date().toLocaleString("en-GB", {
    timeZone: timezone,
    hour12: false,
  });
  const nowLocal = new Date(nowLocalStr).getTime();

  let bestIndex = 0;
  let bestDiff = Infinity;

  for (let i = 0; i < forecast.length; i++) {
    const utcDate = new Date(forecast[i].time);

    const localTimeStr = utcDate.toLocaleString("en-GB", {
      timeZone: timezone,
      hour12: false,
    });

    const localTime = new Date(localTimeStr).getTime();
    const diff = Math.abs(localTime - nowLocal);

    if (diff < bestDiff) {
      bestDiff = diff;
      bestIndex = i;
    }
  }

  return bestIndex;
}

module.exports = (bot) => {
  // ===========================
  // /micro (optional manual entry)
  // ===========================
  bot.command("micro", (ctx) => {
    if (DEV_LOG) console.log("[MICRO] /micro called by:", ctx.from.id);

    ctx.reply("📍 Please send your location to get a micro-forecast.");
  });

  // ===========================
  // LOCATION → MICRO FORECAST (FIXED 2 HOURS)
  // ===========================
  bot.on("location", async (ctx) => {
    const userId = ctx.from.id;
    const { latitude, longitude } = ctx.message.location;

    if (DEV_LOG)
      console.log(
        `[MICRO] Location received from ${userId}:`,
        latitude,
        longitude,
      );

    try {
      // Determine timezone based on location
      const timezone = tzlookup(latitude, longitude);

      // Get micro-forecast data
      const forecast = await getMicroForecast(latitude, longitude);

      // Save for possible debug use
      setUserData(userId, { forecast, timezone });

      // Always show 2 hours (8 × 15 min)
      const start = findStartIndex(forecast, timezone);
      const slice = forecast.slice(start, start + 8);

      const lang = ctx.session?.lang || "en";

      let text =
        lang === "ru"
          ? `🌤 *Микропрогноз на ближайшие 2 часа*\n` +
            `_Погода рядом с вами (~2×2 км)_\n` +
            `_Время указано в вашем часовом поясе (${timezone})_\n\n`
          : `🌤 *Micro-forecast for the next 2 hours*\n` +
            `_Weather around you (~2×2 km)_\n` +
            `_Times shown in your local timezone (${timezone})_\n\n`;

      for (const p of slice) {
        const localTime = new Date(p.time).toLocaleTimeString("en-GB", {
          timeZone: timezone,
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        });

        text +=
          `${localTime} — ${p.temperature.toFixed(1)}°C, ` +
          `💧 ${Math.round(p.humidity)}%, ` +
          `💨 ${p.windspeed.toFixed(1)} m/s\n`;
      }

      if (DEV_LOG)
        console.log(
          `[MICRO] Forecast sent (${slice.length} points) to`,
          userId,
        );

      await ctx.reply(text, { parse_mode: "Markdown" });
    } catch (err) {
      console.error("[MICRO] Error:", err);
      ctx.reply("❌ Unable to get micro-forecast. Please try again.");
    }
  });
};
