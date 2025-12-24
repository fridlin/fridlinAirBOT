// src/logging/weatherLogger.js
// Weather decision logging (DEBUG only).

function isEnabled() {
  // Enable with: DEBUG_WEATHER=1
  return (
    process.env.DEBUG_WEATHER === "1" || process.env.DEBUG_WEATHER === "true"
  );
}

/**
 * Logs a weather decision point with structured data.
 * @param {string} context - short decision name (e.g., "storm_check")
 * @param {object} data - payload to print
 */
function logDecision(context, data) {
  if (!isEnabled()) return;

  // Keep it compact and grep-friendly
  try {
    console.log(`[WEATHER] ${context}: ${JSON.stringify(data)}`);
  } catch (e) {
    console.log(`[WEATHER] ${context}:`, data);
  }
}

module.exports = {
  logDecision,
};
