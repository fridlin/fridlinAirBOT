// analyzeForecastWindow.js

const RAIN_THRESHOLD = 40; // %
const JUMP_THRESHOLDS = {
  temperature: 0.15, // 15%
  feelsLike: 0.2, // 20%
  wind: 0.3, // 30%
};

function pctDelta(prev, curr) {
  if (prev === 0) return 0;
  return Math.abs((curr - prev) / prev);
}

function trendFromNow(now, value, eps = 0.01) {
  if (Math.abs(value - now) <= eps) return "stable";
  return value > now ? "up" : "down";
}

module.exports = function analyzeForecastWindow(slots) {
  if (!Array.isArray(slots) || slots.length === 0) return slots;

  const now = slots[0];

  // --- Rain ETA ---
  let rainETA = null;
  if ((now.precipitation?.probability ?? 0) < RAIN_THRESHOLD) {
    const idx = slots.findIndex(
      (s) => (s.precipitation?.probability ?? 0) >= RAIN_THRESHOLD,
    );
    if (idx > 0) {
      const dtMs = new Date(slots[idx].time) - new Date(now.time);
      rainETA = Math.round(dtMs / 60000); // minutes
    }
  }

  return slots.map((slot, i) => {
    const prev = slots[i - 1] || slot;

    // --- Trends (relative to NOW) ---
    const trend = {
      temperature: trendFromNow(now.temperature, slot.temperature),
      feelsLike: trendFromNow(now.feelsLike, slot.feelsLike),
      wind: trendFromNow(now.windspeed ?? 0, slot.windspeed ?? 0),
    };

    // --- Sharp changes (relative to PREVIOUS slot) ---
    const reasons = [];

    if (
      pctDelta(prev.temperature, slot.temperature) >=
      JUMP_THRESHOLDS.temperature
    ) {
      reasons.push("temperature_jump");
    }

    if (
      pctDelta(prev.feelsLike, slot.feelsLike) >=
      JUMP_THRESHOLDS.feelsLike
    ) {
      reasons.push("feelslike_jump");
    }

    if (
      pctDelta(prev.windspeed ?? 0, slot.windspeed ?? 0) >=
      JUMP_THRESHOLDS.wind
    ) {
      reasons.push("wind_spike");
    }

    const prevRain = prev.precipitation?.probability ?? 0;
    const currRain = slot.precipitation?.probability ?? 0;
    if (prevRain < RAIN_THRESHOLD && currRain >= RAIN_THRESHOLD) {
      reasons.push("rain_start");
    }

    return {
      ...slot,
      trend,
      alerts: {
        rainETA,
        warning: reasons.length > 0,
        reasons,
      },
    };
  });
};
