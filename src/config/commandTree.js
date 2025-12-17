module.exports = {
  commands: [
    { command: "start", description: "Запуск бота" },
    { command: "micro", description: "Быстрый микропрогноз" },
    { command: "route", description: "Микропрогноз по маршруту" },
    { command: "feedback", description: "Оставить отзыв или предложение" },
    { command: "lang", description: "Выбрать язык" },
  ],

  debug: [
    { command: "debug", description: "Главный debug режим" },
    { command: "debug_micro", description: "Микропрогноз" },
    { command: "debug_micro_full", description: "Полная сетка" },
    { command: "debug_micro_grid", description: "Отображение точек" },
    { command: "debug_time", description: "Время обновления" },
  ],

  buttonActions: {
    "🌤 Погода сейчас": "weather",
    "🗺 Маршрут": "route",
    "✉️ Отзыв": "feedback",
    "🌐 Язык": "lang",
  },

  menus: {
    ru: [["🌤 Погода сейчас"], ["🗺 Маршрут"], ["✉️ Отзыв"], ["🌐 Язык"]],

    en: [["🌤 Weather now"], ["🗺 Route"], ["✉️ Feedback"], ["🌐 Language"]],
  },
};
