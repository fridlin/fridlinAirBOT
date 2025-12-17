
FridlinAirBOT/
├── 00_Overview/
│   ├── Project_Goal.md
│   ├── High_Level_Logic.md
│   ├── System_Architecture.md
│   └── Router_Concept.md
│
├── 01_Router/
│   ├── router.md
│   ├── routing_rules.md
│   ├── step_transitions.md
│   └── state_reset.md
│
├── 02_Steps/
│   ├── language.md
│   ├── pointA.md
│   ├── confirmPointA.md
│   ├── weatherA.md
│   ├── destination.md
│   ├── confirmPointB.md
│   ├── etaTransportChoice.md
│   ├── etaCalculate.md
│   ├── etaConfirm.md
│   ├── weatherB.md
│   ├── comparison.md
│   └── finish.md
│
├── 03_Renderers/
│   ├── renderer_language.md
│   ├── renderer_pointA.md
│   ├── renderer_confirmPointA.md
│   ├── renderer_weatherA.md
│   ├── renderer_destination.md
│   ├── renderer_confirmPointB.md
│   ├── renderer_etaTransportChoice.md
│   ├── renderer_etaCalculate.md
│   ├── renderer_etaConfirm.md
│   ├── renderer_weatherB.md
│   ├── renderer_comparison.md
│   └── renderer_finish.md
│
├── 04_Debug/
│   ├── debug_architecture.md
│   ├── debug_history.md
│   ├── debug_last.md
│   ├── debug_store.md
│   └── admin_only.md
│
├── 05_State/
│   ├── state_structure.md
│   ├── state_flow.md
│   ├── state_clean_start.md
│   └── examples.md
│
├── 06_Weather/
│   ├── weather_micro.md
│   ├── weather_micro_radius_logic.md
│   ├── weather_pointA.md
│   ├── weather_pointB.md
│   ├── weather_comparison.md
│   └── recommendation_engine.md
│
├── 07_ETA/
│   ├── google_directions_api.md
│   ├── eta_transport_modes.md
│   ├── eta_calculation_flow.md
│   ├── eta_confirm.md
│   └── error_handling.md
│
├── 08_Design/
│   ├── message_structure.md
│   ├── emoji_and_icons.md
│   ├── comparison_visual_style.md
│   ├── arrows_style.md
│   └── rain_wind_temp_colors.md
│
└── 09_Misc/
    ├── edge_cases.md
    ├── errors_and_retries.md
    ├── future_features.md
    ├── optimization.md
    └── notes.md


  

Объяснение структуры (коротко)

  

  

  

00_Overview

  

  

Главная документация проекта — идеальный старт.

  

  

01_Router

  

  

Описание архитектуры маршрутизатора.

  

  

02_Steps

  

  

Каждый шаг — отдельный файл.

Понятно, удобно, легко документировать.

  

  

03_Renderers

  

  

Каждый вид сообщения — отдельный файл.

  

  

04_Debug

  

  

Твоя кастомная система debug для админов.

  

  

05_State

  

  

Описание состояния, примеры, структура.

  

  

06_Weather

  

  

Вся логика микропогоды, сравнений, рекомендаций.

  

  

07_ETA

  

  

Google Directions API + логика времени прибытия.

  

  

08_Design

  

  

Стиль сообщений, иконки, стрелки, визуализация.

  

  

09_Misc

  

  

Ошибки, edge-cases, идеи, будущее развитие.