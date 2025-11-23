// FridlinAir v1 — тестовый бот с погодой для Хайфы

const { Telegraf } = require("telegraf");
const axios = require("axios");

// токен берём из Secrets: BOT_TOKEN
const bot = new Telegraf(process.env.BOT_TOKEN);

// =======================================
// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ПОГОДЫ ХАЙФЫ
// =======================================
async function getHaifaWeatherText() {
  // Координаты Хайфы
  const lat = 32.794;
  const lon = 34.989;

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,relativehumidity_2m,windspeed_10m` +
    `&forecast_days=1&timezone=auto`;

  const { data } = await axios.get(url);

  // Берём самый ближайший час — первый элемент
  const t = data.hourly.temperature_2m[0];
  const h = data.hourly.relativehumidity_2m[0];
  const w = data.hourly.windspeed_10m[0];

  return (
    "🌤 Сейчас в Хайфе:\n" +
    `🌡 Температура: ${t.toFixed(1)}°C\n` +
    `💧 Влажность: ${h}%\n` +
    `💨 Ветер: ${w} м/с`
  );
}

// ===================
// КОМАНДЫ БОТА
// ===================

// /start
bot.start((ctx) => {
  ctx.reply(
    "Привет, я FridlinAir 🛫\n" +
      "Сейчас я умею показывать погоду в Хайфе.\n" +
      "Команда: /haifa"
  );
});

// /haifa — погода в Хайфе
bot.command("haifa", async (ctx) => {
  try {
    await ctx.reply("Секунду, проверяю погоду в Хайфе…");
    const text = await getHaifaWeatherText();
    await ctx.reply(text);
  } catch (err) {
    console.error(err);
    await ctx.reply("Не получилось получить погоду 😔 Попробуй чуть позже.");
  }
});

// Остальной текст — простой echo
bot.on("text", (ctx) => {
  ctx.reply("Я пока умею только /start и /haifa 🙂");
});

// Запуск бота
bot.launch().then(() => {
  console.log("FridlinAir bot is running...");
});

// Корректная остановка
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
