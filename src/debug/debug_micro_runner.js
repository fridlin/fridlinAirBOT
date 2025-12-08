const { getMicroForecast } = require("../services/weatherMicro");
const { setDebugState } = require("../utils/debugState");

async function runDebugMicro(ctx, lat, lon) {
  const start = Date.now();

  // Получаем прогноз через твою уже готовую функцию
  const forecast = await getMicroForecast(lat, lon);

  const end = Date.now();

  // Выключаем debug режим для пользователя
  setDebugState(ctx.from.id, null);

  // Формируем короткое debug-сообщение
  let msg = "*🔧 DEBUG MICRO*\n";
  msg += `Coords: ${lat}, ${lon}\n`;
  msg += `Time: ${end - start} ms\n`;
  msg += `Entries: ${forecast.length}\n\n`;

  // покажем первые 3 точки
  for (let i = 0; i < 3; i++) {
    const p = forecast[i];
    msg += `${p.time} → ${p.temperature.toFixed(1)}°C\n`;
  }

  return ctx.replyWithMarkdown(msg);
}

module.exports = { runDebugMicro };
