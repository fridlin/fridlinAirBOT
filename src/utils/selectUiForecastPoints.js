// src/utils/selectUiForecastPoints.js

/**
 * Selects user-facing forecast points from internal slice
 *
 * RULES:
 * - Input points MUST have ts:number
 * - Output is subset of same objects
 */

function selectUiForecastPoints(points, nowTs) {
  if (!Array.isArray(points) || points.length === 0) {
    console.error("[UI][SELECT][FAIL] empty points");
    return null;
  }

  if (!points.every((p) => typeof p.ts === "number")) {
    console.error("[UI][SELECT][FAIL] invalid ts in points");
    return null;
  }

  const BASE_STEP_MIN = 15;
  const UI_STEP_MIN = 30;
  const WINDOW_MIN = 120;

  const toleranceMs = BASE_STEP_MIN * 60 * 1000;

  // anchor = nearest point >= now (within tolerance)
  const base = points.find(
    (p) => p.ts >= nowTs - toleranceMs && p.ts <= nowTs + toleranceMs,
  );

  if (!base) {
    console.error("[UI][SELECT][FAIL] base point not found");
    return null;
  }

  const baseTs = base.ts;

  const required = Math.floor(WINDOW_MIN / UI_STEP_MIN) + 1;

  const result = [];

  for (let i = 0; i < required; i++) {
    const targetTs = baseTs + i * UI_STEP_MIN * 60 * 1000;
    const found = points.find((p) => p.ts === targetTs);

    if (!found) {
      console.error("[UI][SELECT][FAIL] missing point", targetTs);
      return null;
    }

    result.push(found);
  }

  return result;
}

module.exports = {
  selectUiForecastPoints,
};
