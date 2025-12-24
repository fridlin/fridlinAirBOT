// src/commands/micro.js

const tzlookup = require("tz-lookup");
const { t } = require("../utils/i18n");

const UI = require("../ui/textLayout");
const { renderMicroForecastUI } = require("../ui/microForecastUI");

const { getForecast } = require("../services/weatherForecast");
const { getYesterdayWeather } = require("../services/weatherHistory");

const { generateMicrogrid } = require("../services/geoGrid");
const { aggregateMicrogridForecast } = require("../micro/microGridAggregator");
const { interpolateForecast15min } = require("../micro/interpolateForecast");
const { selectUiForecastPoints } = require("../utils/selectUiForecastPoints");

const analyzeForecastWindow = require("../utils/analyzeForecastWindow");

const { checkWarnings } = require("../warnings/checkWarnings");
const { formatWarning } = require("../warnings/formatWarning");
const { applyWarningAlarmUI } = require("../ui/warningAlarm");

const { formatMicroForecast } = require("../formatters/microForecastFormatter");
const { determineSkyState } = require("../utils/skyState");
const { isStorm } = require("../utils/stormDetector");

const MICRO_CFG = require("../config/microForecast");

// ==================================================
// HARD ERROR HANDLER → RESET TO /start
// ==================================================
async function hardFail(ctx, reason, meta = {}) {
  console.error("[MICRO][FAIL]", reason, meta);

  await ctx.reply(
    UI.block(t(ctx, "error.title"), t(ctx, "forecast_error_retry")),
  );

  return ctx.reply("/start");
}

// ==================================================
// NORMALIZERS (defensive)
// ==================================================
function n(x) {
  return typeof x === "number" ? x : null;
}

// ==================================================
// BOT HANDLER
// ==================================================
module.exports = (bot) => {
  bot.on("location", async (ctx) => {
    const { latitude, longitude } = ctx.message.location;

    console.log("[MICRO][START]", { latitude, longitude });

    // --------------------------------------------------
    // A.0 TIMEZONE (mandatory context)
    // --------------------------------------------------
    await ctx.reply(UI.text(t(ctx, "calculating_timezone")));

    let timezone;
    try {
      timezone = tzlookup(latitude, longitude);
      console.log("[MICRO][TZ] resolved:", timezone);
    } catch {
      console.error("[MICRO][TZ][FAIL]", { latitude, longitude });

      await ctx.reply(
        UI.block(t(ctx, "error.title"), t(ctx, "timezone_error")),
      );
      return ctx.reply("/start");
    }

    ctx.session = ctx.session || {};
    ctx.session.timezone = timezone;

    // First UX block: timezone
    await ctx.reply(`⏰ ${timezone}`);

    // --------------------------------------------------
    // CALCULATING
    // --------------------------------------------------
    await ctx.reply(UI.text(t(ctx, "calculating_micro")));

    // --------------------------------------------------
    // FORECAST FETCH (API layer)
    // --------------------------------------------------
    const baseForecast = await getForecast(latitude, longitude);
    if (!Array.isArray(baseForecast) || baseForecast.length === 0) {
      return hardFail(ctx, "FORECAST_EMPTY");
    }

    // --------------------------------------------------
    // MICROGRID
    // --------------------------------------------------
    const grid = generateMicrogrid(latitude, longitude);
    console.log("[MICRO][GRID] generated:", grid.length);

    // For now: same forecast applied to each grid point
    // (keeps architecture correct; can be expanded later)
    const gridForecasts = grid.map(() => baseForecast);

    const aggregated = aggregateMicrogridForecast(gridForecasts);
    if (!Array.isArray(aggregated) || aggregated.length === 0) {
      return hardFail(ctx, "GRID_AGGREGATION_FAIL");
    }

    // --------------------------------------------------
    // INTERPOLATION (15 min)
    // --------------------------------------------------
    const interpolated = interpolateForecast15min(aggregated);
    if (!Array.isArray(interpolated) || interpolated.length === 0) {
      return hardFail(ctx, "INTERPOLATION_FAIL");
    }

    // --------------------------------------------------
    // TIME WINDOW FILTER
    // --------------------------------------------------
    const NOW = Date.now();
    const WINDOW_MS = MICRO_CFG.HOURS_AHEAD * 60 * 60 * 1000;

    const windowed = interpolated.filter(
      (p) => p.ts >= NOW && p.ts <= NOW + WINDOW_MS,
    );

    console.log("[MICRO][WINDOW]", {
      hours: MICRO_CFG.HOURS_AHEAD,
      points: windowed.length,
    });

    if (windowed.length === 0) {
      return hardFail(ctx, "WINDOW_EMPTY");
    }

    // --------------------------------------------------
    // ANALYZE (trends, alerts)
    // --------------------------------------------------
    const analyzed = analyzeForecastWindow(
      windowed.map((p) => ({
        time: new Date(p.ts).toISOString(),
        temperature: p.temperature,
        feelsLike: p.feelsLike,
        windspeed: p.windSpeed,
        humidity: p.humidity,
        cloudCover: p.cloudCover,
        precipitation: p.precipitation,
      })),
    );

    if (!Array.isArray(analyzed) || analyzed.length === 0) {
      return hardFail(ctx, "ANALYZE_FAIL");
    }

    // --------------------------------------------------
    // UI POINT SELECTION
    // --------------------------------------------------
    const uiPoints = selectUiForecastPoints(analyzed, NOW);
    if (!uiPoints) {
      return hardFail(ctx, "UI_POINTS_FAIL");
    }

    // --------------------------------------------------
    // ENRICH FOR UI
    // --------------------------------------------------
    const enriched = uiPoints.map((p) => {
      const windSpeed = n(p.windspeed);
      const precipitation = n(p.precipitation) ?? 0;

      const storm = isStorm({
        windSpeed,
        windGusts: null,
        precipitation,
        precipitationType: null,
      });

      const skyState = storm
        ? "storm"
        : determineSkyState({
            cloudCover: n(p.cloudCover),
            precipitation,
          });

      return {
        ...p,
        windSpeed,
        storm,
        skyState,
        timeLabel: new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: timezone,
        }).format(new Date(p.time)),
      };
    });

    // --------------------------------------------------
    // YESTERDAY COMPARISON (optional block)
    // --------------------------------------------------
    try {
      const nowPoint = enriched[0];
      const yPoint = await getYesterdayWeather(latitude, longitude, Date.now());

      if (yPoint) {
        console.log("[MICRO][YDAY] fetched");

        // comparison UI is already implemented elsewhere
        // block intentionally kept isolated
      } else {
        console.log("[MICRO][YDAY] skip");
      }
    } catch (e) {
      console.error("[MICRO][YDAY][FAIL]", e);
    }

    // --------------------------------------------------
    // MICRO FORECAST UI
    // --------------------------------------------------
    const header = {
      title: t(ctx, "micro_title"),
      subtitle: t(ctx, "micro_subtitle"),
      areaNote: t(ctx, "micro_area_note"),
    };

    const lines = enriched.map((p) =>
      formatMicroForecast({
        timeLabel: p.timeLabel,
        temperature: p.temperature,
        feelsLike: p.feelsLike,
        windSpeed: p.windSpeed,
        windTrend: p.trend?.wind || "stable",
        skyState: p.skyState,
      }),
    );

    const text = renderMicroForecastUI({ header, lines });
    if (!text) {
      return hardFail(ctx, "UI_RENDER_FAIL");
    }

    await ctx.reply(text);

    // --------------------------------------------------
    // WARNINGS / ALARMS
    // --------------------------------------------------
    const first = enriched[0];

    const warning = checkWarnings(
      {
        temperature: first.temperature,
        feelsLike: first.feelsLike,
        windspeed: first.windSpeed,
        humidity: first.humidity ?? null,
        precipitation: first.precipitation ?? 0,
        storm: first.storm,
      },
      [],
      Date.now(),
    );

    if (warning) {
      const warningText = formatWarning(warning, (k) => t(ctx, k));
      const uiText = applyWarningAlarmUI(warning, warningText);

      if (uiText) {
        await ctx.reply(uiText);
      }
    }

    console.log("[MICRO][DONE]");
  });
};
