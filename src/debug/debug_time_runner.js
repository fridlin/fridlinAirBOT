// src/debug/debug_time_runner.js
const { setDebugState } = require("../utils/debugState");
const tzlookup = require("tz-lookup");

async function runDebugTime(ctx, lat, lon) {
  // Turn off debug mode after execution
  setDebugState(ctx.from.id, null);

  // Determine user's timezone from coordinates
  const timezone = tzlookup(lat, lon);

  const now = new Date();

  // Local user time (correct device/TG-based time)
  const userLocal = now.toLocaleString("en-GB", {
    timeZone: timezone,
    hour12: false
  });

  const msg =
`⏱ *DEBUG TIME*

📍 Coordinates:
${lat.toFixed(6)}, ${lon.toFixed(6)}

🕒 Timezone for this location:
${timezone}

⏰ *User local time (based on your phone/TG client):*
${userLocal}

🌍 Server UTC time:
${now.toISOString()}

Server offset (minutes):
${now.getTimezoneOffset()}

This mode shows REAL LOCAL TIME based on your actual location.`;

  return ctx.replyWithMarkdown(msg);
}

module.exports = { runDebugTime };
