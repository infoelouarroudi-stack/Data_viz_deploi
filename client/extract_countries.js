const fs = require('fs');
const path = require('path');

const geoJsonPath = path.join(__dirname, 'public/data/world-geo.json');

try {
  const data = fs.readFileSync(geoJsonPath, 'utf8');
  const json = JSON.parse(data);
  const names = json.features.map(f => f.properties.name).filter(n => n).sort();
  console.log(JSON.stringify(names, null, 2));
} catch (err) {
  console.error("Error reading file:", err);
}
