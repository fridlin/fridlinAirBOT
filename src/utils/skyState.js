/**
 * Determines sky state based on factual weather inputs.
 *
 * IMPORTANT:
 * - No UI
 * - No emojis
 * - No thresholds hardcoded here
 * - No storm logic here
 *
 * Returns EXACTLY one of:
 * "sun" | "cloud" | "rain"
 *
 * Storm is handled later by a dedicated detector.
 */

/**
 * @param {Object} params
 * @param {number|null} params.cloudCover   // 0–100 (%)
 * @param {number|null} params.precipitation // mm or >0 = precipitation fact
 * @returns {"sun" | "cloud" | "rain"}
 */
function determineSkyState({ cloudCover, precipitation }) {
  // ---------- RAIN ----------
  // Any factual precipitation => rain
  if (typeof precipitation === "number" && precipitation > 0) {
    return "rain";
  }

  // ---------- CLOUD / SUN ----------
  if (typeof cloudCover === "number") {
    // Mostly clear
    if (cloudCover < 20) {
      return "sun";
    }

    // Partly to fully cloudy
    return "cloud";
  }

  // ---------- FALLBACK ----------
  // If no data at all, assume cloud (safest neutral state)
  return "cloud";
}

module.exports = {
  determineSkyState,
};
