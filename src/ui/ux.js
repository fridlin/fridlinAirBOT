// src/ui/ux.js

const UX = {
  icons: {
    temperature: "🌡️",
    feelsLike: "👤",
    wind: "💨",
    rain: "🌧",
    dry: "☁️",
    warning: "⚠️",
    severe: "🚨",
  },

  arrows: {
    up: "↑",
    down: "↓",
    stable: "→",
  },

  units: {
    temperature: "°",
    wind: "km/h",
  },

  spacing: {
    inline: "  ",
    line: "\n",
    block: "\n\n",
  },

  labels: {
    rain: "rain",
    dry: "dry",
  },

  format: {
    temperature({ t, f }) {
      if (f === null || f === undefined) {
        return `${UX.icons.temperature} ${Math.round(t)}${UX.units.temperature}`;
      }

      return (
        `${UX.icons.temperature} ${Math.round(t)}${UX.units.temperature}` +
        ` (${UX.icons.feelsLike} ${Math.round(f)}${UX.units.temperature})`
      );
    },

    wind({ v, trend }) {
      const value =
        typeof v === "number" ? `${Math.round(v)} ${UX.units.wind}` : "–";
      return `${UX.icons.wind} ${value} ${trend ?? UX.arrows.stable}`;
    },

    precipitation({ hasRain }) {
      return hasRain
        ? `${UX.icons.rain} ${UX.labels.rain}`
        : `${UX.icons.dry} ${UX.labels.dry}`;
    },

    time({ iso, timezone }) {
      return new Date(iso).toLocaleTimeString("en-GB", {
        timeZone: timezone,
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
};

module.exports = UX;
