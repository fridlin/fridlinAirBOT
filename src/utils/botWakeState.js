// src/utils/botWakeState.js

const BOT_STATE = require("../config/botState");

// Time window after restart when we inform the user
const BOT_WAKE_WINDOW_MS = 60 * 1000; // 1 minute

function isJustWokeUp() {
  return Date.now() - BOT_STATE.lastStartTs < BOT_WAKE_WINDOW_MS;
}

module.exports = {
  isJustWokeUp,
};
