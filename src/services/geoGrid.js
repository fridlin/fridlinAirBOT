// src/services/geoGrid.js

function generateMicrogrid(lat, lon) {
  const d = 0.01; // ~1 km

  return [
    { name: "center", lat, lon },
    { name: "north", lat: lat + d, lon },
    { name: "south", lat: lat - d, lon },
    { name: "east", lat, lon: lon + d },
    { name: "west", lat, lon: lon - d },
  ];
}

module.exports = { generateMicrogrid };
