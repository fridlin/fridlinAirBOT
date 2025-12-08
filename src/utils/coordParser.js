function parseCoords(text) {
  if (!text) return null;

  // Case: "32.75 34.97"
  let parts = text.trim().split(/\s+/);

  if (parts.length === 1) {
    parts = text.split(",");
  }

  if (parts.length !== 2) return null;

  const lat = parseFloat(parts[0]);
  const lon = parseFloat(parts[1]);

  if (isNaN(lat) || isNaN(lon)) return null;

  return { lat, lon };
}

module.exports = { parseCoords };
