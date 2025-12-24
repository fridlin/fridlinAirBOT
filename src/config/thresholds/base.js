// src/config/thresholds/base.js

const BASE_THRESHOLDS = {
  wind: {
    noticeable: 6, // km/h — already used in warnings
    strong: 35, // strong wind
    severe: 50, // storm-level wind
    gustSevere: 65, // dangerous gusts
  },

  precipitation: {
    heavyRainMmPerHour: 8,
  },

  feelsLike: {
    noticeableDelta: 3,
  },

  humidity: {
    low: 30,
    high: 80,
    noticeableDelta: 10,
  },
};

module.exports = BASE_THRESHOLDS;
