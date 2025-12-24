// src/utils/selectUiForecastPoints.js

const MICRO_CFG = require("../config/microForecast");

/**
 * Selects user-facing forecast points from 15-min internal slice
 * @param {Array} slice - forecast points (15 min step)
 * @param {Number} nowTs - Date.now()
 * @returns {Array|null} UI points for rendering
 */
function selectUiForecastPoints(slice, nowTs) {
  if (!Array.isArray(slice) || slice.length === 0) {
    console.error("[MICRO][UI_POINTS][FAIL] empty slice");
    return null;
  }

  const baseStepMin =
    typeof MICRO_CFG.BASE_STEP_MIN === "number" ? MICRO_CFG.BASE_STEP_MIN : 15;

  const uiStepMin =
    typeof MICRO_CFG.UI_STEP_MIN === "number" ? MICRO_CFG.UI_STEP_MIN : 30;

  // By rule: show now (<= BASE_STEP_MIN from current time) + 4 future points
  const uiPointsCount = Math.floor(120 / uiStepMin) + 1; // default window = 120 min

  // Find base point (anchor)
  // ANCHOR_MODE = "floor": choose nearest slot <= now (within tolerance)
  // ANCHOR_MODE = "ceil": choose next slot >= now (within tolerance)
  // If invalid/unknown: fallback to "floor"
  const anchorMode =
    typeof MICRO_CFG.ANCHOR_MODE === "string" ? MICRO_CFG.ANCHOR_MODE : "floor";

  const toleranceMs = baseStepMin * 60 * 1000;

  let base = null;

  if (anchorMode === "ceil") {
    base = slice.find((p) => {
      const ts = new Date(p.time).getTime();
      return ts >= nowTs && ts <= nowTs + toleranceMs;
    });
  } else {
    base = slice.find((p) => {
      const ts = new Date(p.time).getTime();
      return ts >= nowTs - toleranceMs;
    });
  }

  if (!base) {
    console.error("[MICRO][UI_POINTS][FAIL] base point not found", {
      anchorMode,
      baseStepMin,
      uiStepMin,
    });
    return null;
  }

  const baseTs = new Date(base.time).getTime();

  const requiredOffsets = Array.from({ length: uiPointsCount }, (_, i) => {
    return baseTs + i * uiStepMin * 60 * 1000;
  });

  const result = requiredOffsets.map((targetTs) =>
    slice.find((p) => new Date(p.time).getTime() === targetTs),
  );

  if (result.some((p) => !p)) {
    console.error("[MICRO][UI_POINTS][FAIL] missing UI points", {
      anchorMode,
      baseStepMin,
      uiStepMin,
      requiredOffsets,
      sliceCount: slice.length,
    });
    return null;
  }

  console.log("[MICRO][UI_POINTS] selected points", {
    count: result.length,
    uiStepMin,
    anchorMode,
  });

  return result;
}

module.exports = { selectUiForecastPoints };
