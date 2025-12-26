// src/debug/debug_micro_full_runner.js

const { getMicroForecast } = require("../services/weatherMicro");
const { interpolateForecast15min } = require("../micro/interpolateForecast");
const { applySensitivityLayer } = require("../micro/applySensitivityLayer");
const { setDebugState } = require("../utils/debugState");

async function runDebugMicroFull(ctx, lat, lon) {
  const start = Date.now();

  // 1. Raw hourly physics (after microgrid merge)
  const hourly = await getMicroForecast(lat, lon);
  if (!hourly || !hourly.length) {
    setDebugState(ctx.from.id, null);
    return ctx.reply("DEBUG MICRO FULL: no hourly data");
  }

  // 2. Interpolated to 15-min
  const interpolated = interpolateForecast15min(hourly);
  if (!interpolated || !interpolated.length) {
    setDebugState(ctx.from.id, null);
    return ctx.reply("DEBUG MICRO FULL: interpolation failed");
  }

  // 3. Sensitivity Layer (feels-like)
  const withSensitivity = applySensitivityLayer(interpolated);
  if (!withSensitivity || !withSensitivity.length) {
    setDebugState(ctx.from.id, null);
    return ctx.reply("DEBUG MICRO FULL: sensitivity layer failed");
  }

  const end = Date.now();
  setDebugState(ctx.from.id, null);

  let msg = "*🧪 DEBUG MICRO FULL*\n";
  msg += `Coords: ${lat}, ${lon}\n`;
  msg += `Time: ${end - start} ms\n\n`;

  msg += `Hourly (raw physics): ${hourly.length}\n`;
  msg += `Interpolated (15 min): ${interpolated.length}\n`;
  msg += `With Sensitivity: ${withSensitivity.length}\n\n`;

  // Show 1 example point from each stage
  const h = hourly[0];
  const i = interpolated[0];
  const s = withSensitivity[0];

  msg += "*Example point:*\n";
  msg += `Hourly → ${new Date(h.ts).toISOString()} | ${h.temperature?.toFixed(
    1,
  )}°C\n`;
  msg += `Interpolated → ${new Date(i.ts).toISOString()} | ${i.temperature?.toFixed(
    1,
  )}°C\n`;
  msg += `Sensitivity → feels ${s.feelsLike?.toFixed(1)}°C\n`;

  return ctx.replyWithMarkdown(msg);
}

module.exports = { runDebugMicroFull };
