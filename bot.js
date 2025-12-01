// FridlinAir – погода по геолокации с подтверждением

const { Telegraf } = require("telegraf");
const axios = require("axios");

const bot = new Telegraf(process.env.BOT_TOKEN);

// простое хранилище последних координат по пользователю
const lastLocation = {};

// вывод названия места
// вывод названия места
async function getPlaceName(lat, lon) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json`;

  const { data } = await axios.get(url, {
    params: {
      latlng: `${lat},${lon}`,
      key: process.env.GOOGLE_KEY,
      language: "en",
    },
  });

  if (data.results && data.results.length > 0) {
    const components = data.results[0].address_components;

    const city =
      components.find((c) => c.types.includes("locality"))?.long_name ||
      components.find((c) => c.types.includes("administrative_area_level_2"))
        ?.long_name ||
      components.find((c) => c.types.includes("administrative_area_level_1"))
        ?.long_name;

    return city || "This place";
  }

  return "This place";
}

// ======== вспомогательная функция погоды по координатам ========
async function getWeatherByCoords(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,relativehumidity_2m,windspeed_10m` +
    `&timezone=auto`;

  const { data } = await axios.get(url);

  // для простоты берём ближайший час
  const t = data.hourly.temperature_2m[0];
  const h = data.hourly.relativehumidity_2m[0];
  const w = data.hourly.windspeed_10m[0];
  const place = await getPlaceName(lat, lon);

  return (
    `🌤 Weather: ${place}\n` +
    `🌡 Температура: ${t.toFixed(1)}°C\n` +
    `💧 Влажность: ${h}%\n` +
    `💨 Ветер: ${w} м/с`
  );
}

// =================== команды бота ===================

// /start
bot.start((ctx) => {
  ctx.reply(
    "Привет, я FridlinAir 🛫\n" +
      "Я могу показать погоду по твоей геолокации.\n" +
      "Команда: /here",
  );
});

// /here – запросить геолокацию
bot.command("here", (ctx) => {
  ctx.reply("Отправь мне свою геолокацию, я покажу погоду в этой точке.", {
    reply_markup: {
      keyboard: [
        [
          {
            text: "📍 Моя геолокация",
            request_location: true,
          },
        ],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
});

// обработка геолокации
bot.on("location", async (ctx) => {
  const chatId = ctx.chat.id;
  const { latitude, longitude } = ctx.message.location;

  // сохраняем последнюю точку
  lastLocation[chatId] = { lat: latitude, lon: longitude };

  await ctx.reply(
    `Координаты получены.\n` +
      `Широта: ${latitude.toFixed(3)}\n` +
      `Долгота: ${longitude.toFixed(3)}\n\n` +
      "Использовать эту точку для погоды?",
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "✅ Да, показать погоду",
              callback_data: "use_location_yes",
            },
          ],
          [
            {
              text: "❌ Нет, отправлю другую",
              callback_data: "use_location_no",
            },
          ],
        ],
      },
    },
  );
});

// обработка нажатий на инлайн-кнопки
bot.on("callback_query", async (ctx) => {
  const chatId = ctx.chat.id;
  const data = ctx.callbackQuery.data;

  if (data === "use_location_yes") {
    const loc = lastLocation[chatId];
    if (!loc) {
      await ctx.answerCbQuery();
      await ctx.reply(
        "Я не вижу сохранённой геолокации. Попробуй ещё раз через /here.",
      );
      return;
    }

    await ctx.answerCbQuery("Считаю погоду…");

    try {
      const text = await getWeatherByCoords(loc.lat, loc.lon);
      await ctx.reply(text, {
        reply_markup: { remove_keyboard: true },
      });
    } catch (e) {
      console.error(e);
      await ctx.reply("Не удалось получить погоду 😔 Попробуй позже.");
    }
  } else if (data === "use_location_no") {
    await ctx.answerCbQuery("Ок");
    await ctx.reply("Хорошо, отправь другую геолокацию командой /here.", {
      reply_markup: { remove_keyboard: true },
    });
  } else {
    await ctx.answerCbQuery();
  }
});

// любой текст
bot.on("text", (ctx) => {
  ctx.reply("Я пока умею /start и /here для погоды по геолокации 🙂");
});

// запуск
bot.launch().then(() => {
  console.log("FridlinAir geo bot is running...");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
