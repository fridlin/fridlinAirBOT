// src/debug/debug_micro_grid_runner.js

const { generateMicrogrid } = require("../services/geoGrid");
const { setDebugState } = require("../utils/debugState");

async function runDebugGrid(ctx, lat, lon) {
  const grid = generateMicrogrid(lat, lon);

  setDebugState(ctx.from.id, null);

  const msg = `🗺 *DEBUG GRID*
Center: ${lat.toFixed(6)}, ${lon.toFixed(6)}

      [N]
       |
[W] – (C) – [E]
       |
      [S]

north:  ${grid.find((p) => p.name === "north").lat.toFixed(6)}, ${grid.find((p) => p.name === "north").lon.toFixed(6)}
south:  ${grid.find((p) => p.name === "south").lat.toFixed(6)}, ${grid.find((p) => p.name === "south").lon.toFixed(6)}
east:   ${grid.find((p) => p.name === "east").lat.toFixed(6)}, ${grid.find((p) => p.name === "east").lon.toFixed(6)}
west:   ${grid.find((p) => p.name === "west").lat.toFixed(6)}, ${grid.find((p) => p.name === "west").lon.toFixed(6)}
`;

  return ctx.replyWithMarkdown(msg);
}

module.exports = { runDebugGrid };
