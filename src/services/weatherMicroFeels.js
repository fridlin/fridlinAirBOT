// src/services/weatherMicroFeels.js
// All comments in English

/*
  Human perceived temperature (FeelsLike)
  Rules are FIXED and approved.
  Wind speed is expected to be in km/h everywhere.
*/

const DEV_LOG = true;

/*
  Helpers
*/

// Clamp helper
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/*
  Core feels-like calculation for ONE point
*/
function calculateFeelsLikePoint(p) {
  if (
    typeof p.temperature !== "number" ||
    typeof p.humidity !== "number" ||
    typeof p.windspeed !== "number"
  ) {
    if (DEV_LOG) {
      console.warn("[FEELS] Missing base data at", p.time);
    }
    return null;
  }

  const T = p.temperature; // °C
  const H = clamp(p.humidity, 0, 100); // %
  const windKmh = p.windspeed; // km/h (already normalized upstream)

  let feelsLike = T;

  /*
    === WIND EFFECT ===
    Noticeable mainly below ~20°C
  */
  if (windKmh > 5 && T < 20) {
    // mild linear cooling
    feelsLike -= clamp((windKmh - 5) * 0.15, 0, 6);
  }

  /*
    === HUMIDITY EFFECT ===
    Noticeable mainly above ~24°C
  */
  if (H > 60 && T > 24) {
    feelsLike += clamp((H - 60) * 0.05, 0, 6);
  }

  /*
    === CLOUDS EFFECT (optional) ===
    Clouds reduce radiant cooling/heating
  */
  if (p.clouds === true) {
    if (T < 18) feelsLike += 1;
    if (T > 26) feelsLike -= 1;
  }

  /*
    === PRECIPITATION EFFECT ===
  */
  switch (p.precipitation) {
    case "light":
      feelsLike -= 1;
      break;
    case "rain":
      feelsLike -= 2;
      break;
    case "heavy":
      feelsLike -= 3;
      break;
    default:
      break;
  }

  /*
    === GUSTS EFFECT (optional) ===
  */
  if (typeof p.wind_gusts === "number") {
    const gustKmh = clamp(p.wind_gusts, windKmh, windKmh + 40);
    feelsLike -= clamp((gustKmh - windKmh) * 0.05, 0, 3);
  }

  return Number(feelsLike.toFixed(1));
}

/*
  Apply feels-like to full forecast array
*/
function applyFeelsLike(forecast) {
  if (!Array.isArray(forecast)) return forecast;

  if (DEV_LOG) {
    console.log("[FEELS] Applying feels-like to points:", forecast.length);
  }

  return forecast.map((p) => {
    const feelsLike = calculateFeelsLikePoint(p);

    return {
      ...p,
      feelsLike: typeof feelsLike === "number" ? feelsLike : null,
    };
  });
}

module.exports = {
  applyFeelsLike,
};
