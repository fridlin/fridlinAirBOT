// src/debug/debug_micro_runner.js

const { getMicroForecast } = require("../services/weatherMicro");
const { interpolateForecast15min } = require("../micro/interpolateForecast");
const { applySensitivityLayer } = require("../micro/applySensitivityLayer");
const { setDebugState } = require("../utils/debugState");

async function runDebugMicro(ctx, lat, lon) {
  const start = Date.now();

  // 1. Raw hourly micro forecast (physics only)
  const hourly = await getMicroForecast(lat, lon);
  if (!hourly || !hourly.length) {
    setDebugState(ctx.from.id, null);
    return ctx.reply("DEBUG MICRO: no hourly data");
  }

  // 2. Interpolate to 15-min
  const interpolated = interpolateForecast15min(hourly);
  if (!interpolated || !interpolated.length) {
    setDebugState(ctx.from.id, null);
    return ctx.reply("DEBUG MICRO: interpolation failed");
  }

  // 3. Apply Sensitivity Layer (feels-like)
  const withSensitivity = applySensitivityLayer(interpolated);
  if (!withSensitivity || !withSensitivity.length) {
    setDebugState(ctx.from.id, null);
    return ctx.reply("DEBUG MICRO: sensitivity layer failed");
  }

  const end = Date.now();

  // выключаем debug режим
  setDebugState(ctx.from.id, null);

  // DEBUG OUTPUT (short, raw)
  let msg = "*🔧 DEBUG MICRO*\n";
  msg += `Coords: ${lat}, ${lon}\n`;
  msg += `Time: ${end - start} ms\n`;
  msg += `Points: ${withSensitivity.length}\n\n`;

  // первые 3 точки
  for (let i = 0; i < Math.min(3, withSensitivity.length); i++) {
    const p = withSensitivity[i];
    const time = new Date(p.ts).toISOString().slice(11, 16);

    msg += `${time} → `;
    msg += `${p.temperature?.toFixed(1)}°C`;
    msg += ` (feels ${p.feelsLike?.toFixed(1)}°C)\n`;
  }

  return ctx.replyWithMarkdown(msg);
}

module.exports = { runDebugMicro };
