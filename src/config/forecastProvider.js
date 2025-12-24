// src/config/forecastProvider.js

module.exports = {
  provider: "open_meteo",

  providers: {
    open_meteo: {
      type: "open_meteo",
      baseUrl: "https://api.open-meteo.com/v1/forecast",
      supports: {
        forecast: true,
      },
    },
  },
};
