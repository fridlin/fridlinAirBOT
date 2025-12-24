// src/ui/compareYesterdayUI.js

const UI = require("./textLayout");

function renderCompareYesterday(result, t) {
  if (!result) return null;

  if (result.type === "no_change") {
    return UI.note(t("compare.no_change", { time: result.timeLabel }));
  }

  const text = t("compare.changed", {
    time: result.timeLabel,
    changes: result.changes.map((c) => t(`compare.${c}`)).join(" "),
  });

  return UI.note(text);
}

module.exports = { renderCompareYesterday };
