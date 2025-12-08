const { getMicroForecast } = require("../services/weatherMicro");
const { setUserData, getUserData } = require("../utils/userStore");
const tzlookup = require("tz-lookup");

const DEV_LOG = true;

/*
   Convert forecast timestamps and NOW into the same local timezone,
   then find the nearest 15-min forecast point.
*/
function findStartIndex(forecast, timezone) {
  // Current local time of the USER
  const nowLocalStr = new Date().toLocaleString("en-GB", {
    timeZone: timezone,
    hour12: false,
  });
  const nowLocal = new Date(nowLocalStr).getTime();

  let bestIndex = 0;
  let bestDiff = Infinity;

  for (let i = 0; i < forecast.length; i++) {
    const utcDate = new Date(forecast[i].time);

    // Convert forecast time → user's timezone
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
  // /micro
  // ===========================
  bot.command("micro", (ctx) => {
    if (DEV_LOG) console.log("[MICRO] /micro called by:", ctx.from.id);

    ctx.reply(
      "📍 Please send your location to get a 15-minute micro-forecast.",
    );
  });

  // ===========================
  // LOCATION → RUN MICRO FORECAST
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

    ctx.reply("⏳ Calculating micro-forecast…");

    // Determine timezone based on location
    const timezone = tzlookup(latitude, longitude);

    // Get micro-forecast
    const forecast = await getMicroForecast(latitude, longitude);

    // Save both forecast and timezone for callbacks
    setUserData(userId, { forecast, timezone });

    if (DEV_LOG) console.log("[MICRO] Forecast saved for:", userId);

    ctx.reply("Select forecast range:", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "1 hour", callback_data: "micro_1h" },
            { text: "2 hours", callback_data: "micro_2h" },
            { text: "3 hours", callback_data: "micro_3h" },
          ],
        ],
      },
    });

    if (DEV_LOG) console.log("[MICRO] Duration buttons sent to:", userId);
  });

  // ===========================
  // MICRO CALLBACK HANDLER
  // ===========================
  bot.action(/micro_.+/, (ctx) => {
    const userId = ctx.from.id;
    const data = getUserData(userId);

    if (!data) {
      console.warn("[MICRO] No forecast data for:", userId);
      return ctx.answerCbQuery("No forecast data.");
    }

    const { forecast, timezone } = data;
    const type = ctx.callbackQuery.data;

    let count = 8; // default 2 hours
    if (type === "micro_1h") count = 4;
    if (type === "micro_3h") count = 12;

    // FIXED: proper local-timezone start detection
    const start = findStartIndex(forecast, timezone);

    // Detect if forecast starts later than now
    const firstPointLocal = new Date(forecast[start].time).toLocaleTimeString(
      "en-GB",
      {
        timeZone: timezone,
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      },
    );

    // Now local time
    const nowLocalStr = new Date().toLocaleTimeString("en-GB", {
      timeZone: timezone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    // Compare times by converting to minutes
    function timeToMinutes(t) {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    }

    const missingMinutes =
      timeToMinutes(firstPointLocal) - timeToMinutes(nowLocalStr);

    // If forecast starts later than the current time → add warning
    let warningText = "";
    if (missingMinutes > 15) {
      const hours = Math.floor(missingMinutes / 60);
      const mins = missingMinutes % 60;

      const waitStr = hours > 0 ? `${hours}h ${mins}m` : `${mins} minutes`;

      warningText =
        `⚠️ *No forecast available for the next ${waitStr}.*\n` +
        `Earliest available forecast: *${firstPointLocal}*.\n\n`;
    }

    const slice = forecast.slice(start, start + count);

    if (DEV_LOG)
      console.log(`[MICRO] Sending forecast entries: ${slice.length}`);

    let text =
      warningText +
      `*🌤 Micro-Forecast*\n` +
      `_Calculated in a 2×2 km micro-zone around your location_\n` +
      `_Times shown in your local timezone (${timezone})_\n\n`;

    for (const p of slice) {
      // Convert UTC → user's local time
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

    ctx.editMessageText(text, { parse_mode: "Markdown" });
  });

  // TEMP DEBUG COMMAND — show first 20 timestamps
  bot.command("micro_debug_times", (ctx) => {
    const userId = ctx.from.id;
    const data = getUserData(userId);
    if (!data) return ctx.reply("No forecast stored.");

    const { forecast } = data;

    const lines = forecast
      .slice(0, 20)
      .map((x) => x.time)
      .join("\n");

    ctx.reply("First 20 forecast timestamps:\n\n" + lines);
  });
};
