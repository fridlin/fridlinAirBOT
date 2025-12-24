// src/config/botState.js
// Holds runtime bot state (in-memory only)

module.exports = {
  status: "online", // online | waking
  lastStartTs: Date.now(),
};
