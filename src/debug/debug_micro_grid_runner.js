const { generateMicroGrid } = require("../services/weatherMicro");
const { setDebugState } = require("../utils/debugState");

async function runDebugGrid(ctx, lat, lon) {
  const grid = generateMicroGrid(lat, lon);

  setDebugState(ctx.from.id, null);

  const msg = `🗺 *DEBUG GRID*
Center: ${lat}, ${lon}

      [N]
       |
[W] – (C) – [E]
       |
      [S]

north:  ${grid[1].lat}, ${grid[1].lon}
south:  ${grid[2].lat}, ${grid[2].lon}
east:   ${grid[3].lat}, ${grid[3].lon}
west:   ${grid[4].lat}, ${grid[4].lon}
`;

  return ctx.replyWithMarkdown(msg);
}

module.exports = { runDebugGrid };
