// FridlinAir – погода по геолокации с подтверждением

// src/bot.js
const { Telegraf } = require("telegraf");
const { getWeatherByCoords } = require("./services/weather");

// простое хранилище последних координат по пользователю
const bot = new Telegraf(process.env.BOT_TOKEN);
const lastLocation = {};

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
