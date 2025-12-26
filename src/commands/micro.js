// src/commands/micro.js

const tzlookup = require("tz-lookup");
const { t } = require("../utils/i18n");

const { renderMicroForecastUI } = require("../ui/microForecastUI");

const { getForecast } = require("../services/weatherForecast");

const { generateMicrogrid } = require("../services/geoGrid");
const { aggregateMicrogridForecast } = require("../micro/microGridAggregator");
const { interpolateForecast15min } = require("../micro/interpolateForecast");
const { applySensitivityLayer } = require("../micro/applySensitivityLayer");
const { selectUiForecastPoints } = require("../utils/selectUiForecastPoints");

const analyzeForecastWindow = require("../utils/analyzeForecastWindow");

const { checkWarnings } = require("../warnings/checkWarnings");
const { formatWarning } = require("../warnings/formatWarning");

const { formatMicroForecast } = require("../formatters/microForecastFormatter");
const { determineSkyState } = require("../utils/skyState");
const { isStorm } = require("../utils/stormDetector");

// ==================================================
// HARD ERROR HANDLER (no UX here)
// ==================================================
async function hardFail(ctx, reason, meta = {}) {
  console.error("[MICRO][FAIL]", reason, meta);
  return ctx.reply("/start");
}

// ==================================================
// NORMALIZERS
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
    // TIMEZONE
    // --------------------------------------------------
    let timezone;
    try {
      timezone = tzlookup(latitude, longitude);
    } catch {
      return ctx.reply("/start");
    }

    ctx.session = ctx.session || {};
    ctx.session.timezone = timezone;

    // --------------------------------------------------
    // FORECAST
    // --------------------------------------------------
    const baseForecast = await getForecast(latitude, longitude);
    if (!Array.isArray(baseForecast) || baseForecast.length === 0) {
      return hardFail(ctx, "FORECAST_EMPTY");
    }

    // --------------------------------------------------
    // MICROGRID
    // --------------------------------------------------
    const grid = generateMicrogrid(latitude, longitude);
    const gridForecasts = grid.map(() => baseForecast);

    const aggregated = aggregateMicrogridForecast(gridForecasts);
    if (!Array.isArray(aggregated) || aggregated.length === 0) {
      return hardFail(ctx, "GRID_AGGREGATION_FAIL");
    }

    // --------------------------------------------------
    // INTERPOLATION (RAW)
    // --------------------------------------------------
    const interpolatedRaw = interpolateForecast15min(aggregated);
    if (!Array.isArray(interpolatedRaw) || interpolatedRaw.length === 0) {
      return hardFail(ctx, "INTERPOLATION_FAIL");
    }

    // --------------------------------------------------
    // SENSITIVITY LAYER (feels-like)
    // --------------------------------------------------
    const interpolated = applySensitivityLayer(interpolatedRaw);
    if (!Array.isArray(interpolated) || interpolated.length === 0) {
      return hardFail(ctx, "SENSITIVITY_FAIL");
    }

    // --------------------------------------------------
    // ANALYZE
    // --------------------------------------------------
    const analyzed = analyzeForecastWindow(
      interpolated.map((p) => ({
        ts: p.ts,
        temperature: p.temperature,
        feelsLike: p.feelsLike,
        windSpeed: p.windSpeed,
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
    const NOW = Date.now();
    const uiPoints = selectUiForecastPoints(analyzed, NOW);
    if (!uiPoints) {
      return hardFail(ctx, "UI_POINTS_FAIL");
    }

    // --------------------------------------------------
    // ENRICH
    // --------------------------------------------------
    const enriched = uiPoints.map((p) => {
      const windSpeed = n(p.windSpeed);
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
        }).format(new Date(p.ts)),
      };
    });

    // --------------------------------------------------
    // BUILD MICRO LINES
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

    // --------------------------------------------------
    // WARNINGS (semantic split: warning vs alarm)
    // --------------------------------------------------
    const first = enriched[0];

    const warningResult = checkWarnings(
      {
        temperature: first.temperature,
        feelsLike: first.feelsLike,
        windSpeed: first.windSpeed,
        humidity: first.humidity ?? null,
        precipitation: first.precipitation ?? 0,
        storm: first.storm,
      },
      [],
      Date.now(),
    );

    let warningBlock = null;
    let alarmBlock = null;

    if (warningResult) {
      const formatted = formatWarning(warningResult, (k) => t(ctx, k));

      if (formatted) {
        if (warningResult.alarm === true) {
          alarmBlock = formatted;
        } else {
          warningBlock = formatted;
        }
      }
    }

    // --------------------------------------------------
    // FINAL UI (single output scenario)
    // --------------------------------------------------
    const text = renderMicroForecastUI({
      header,
      lines,
      warning: warningBlock,
      alarm: alarmBlock,
    });

    if (text) {
      await ctx.reply(text);
    }

    console.log("[MICRO][DONE]");
  });
};
