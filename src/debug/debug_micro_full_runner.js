const { getMicroForecastRaw } = require("../services/weatherMicroRaw");
const { setDebugState } = require("../utils/debugState");

async function runDebugMicroFull(ctx, lat, lon) {
  const start = Date.now();

  const data = await getMicroForecastRaw(lat, lon); // сырые данные всех стадий

  const end = Date.now();
  setDebugState(ctx.from.id, null);

  let msg = "*🧪 DEBUG MICRO FULL*\n";
  msg += `Coords: ${lat}, ${lon}\n`;
  msg += `Time: ${end - start} ms\n\n`;
  msg += `Raw hourly: ${data.raw.length}\n`;
  msg += `Merged: ${data.merged.length}\n`;
  msg += `Interpolated (15m): ${data.interpolated.length}\n\n`;

  return ctx.replyWithMarkdown(msg);
}

module.exports = { runDebugMicroFull };
