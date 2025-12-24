// src/config/weatherProvider.js

module.exports = {
  provider: "open_meteo", // future: visual_crossing, meteostat, etc.

  providers: {
    open_meteo: {
      type: "open_meteo",
      baseUrl: "https://archive-api.open-meteo.com/v1/archive",
      supports: {
        historical: true,
        forecast: true,
      },
    },
  },
};
