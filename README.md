# FridlinAirBOT  
Погодный бот с микропрогнозом по координатам.  
Версия: 2.0.7

README обновляется автоматически при каждом релизе.

---

## ⚡ Основные возможности

- Микропрогноз по точным координатам (до 500 м)
- Прогноз в точке назначения
- Сравнение погоды в двух местах (A → B)
- Работа через кнопки главного меню
- Локализация RU/EN
- Отзывы пользователей (пересылаются админу)
- Debug-режимы (только для администратора)

---

## 🧭 Команды

/start — Запуск бота
/micro — Быстрый микропрогноз
/route — Микропрогноз по маршруту
/feedback — Оставить отзыв или предложение
/lang — Выбрать язык

---

## 🛠 Debug (только для админа)


/debug — главный debug режим
/debug_micro — микропрогноз
/debug_micro_full — полная сетка
/debug_micro_grid — отображение точек
/debug_time — время обновления


---

## 🔧 Текущие параметры модели


radiusStart: 2 km  
radiusEnd: 5 km  
model: micro-weather grid  


---

## 📌 Главное меню

RU:

[ Погода сейчас ]   [ Маршрут ]  
[ Оставить отзыв ]  [ Язык ]

EN:

[ Weather now ]     [ Route ]  
[ Feedback ]        [ Language ]

---

## 💬 Локализация

Все тексты вынесены в:

src/config/lang.js

Функция доступа:

t(ctx, "key")

---

## 📥 Отзывы

Пользователь отправляет `/feedback`, и сообщение пересылается админу (ADMIN_ID).  
Ничего не сохраняется — полная приватность.

---

## 🗂 Структура проекта

bot.js
commands/
  debug.js
  debug_micro.js
  debug_micro_full.js
  debug_micro_grid.js
  debug_reset.js
  debug_time.js
  feedback.js
  here.js
  micro.js
  start.js
config/
  commandTree.js
  lang.js
debug/
  debug_micro_full_runner.js
  debug_micro_grid_runner.js
  debug_micro_runner.js
  debug_time_runner.js
docs/
  0-target.md.md
  1-core.md.md
  1.2 params.md
  2-feasibility.md.md
  3-roadmap.md.md
  4-weather-api.md.md
  5-competitors.md.md
  6-tech-stack.md.md
  7-ux.md.md
  8-decisions-log.md.md
  9-ideas.md.md
  FridlinAirBOT-structure.md
  about.md
  fridlinairbot_logic.md
handlers/
  buttons.js
i18n/
  en.json
  ru.json
middleware/
  session.js
services/
  geoGrid.js
  geocode.js
  weather.js
  weatherMicro.js
  weatherMicroRaw.js
utils/
  coordParser.js
  debugState.js
  i18n.js
  logger.js
  userStore.js


---

## 🚀 Автогенерация README

README создаётся автоматически командами:

npm run release patch  
npm run release minor  
npm run release major

Система релизов выполняет:

1. bump версии  
2. генерацию README из шаблона  
3. обновление CHANGELOG  
4. commit  
5. tag  
6. push  

---

## 🧑‍💻 Автор

Разработано @fridlins — точный погодный сервис.
