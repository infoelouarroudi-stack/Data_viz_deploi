const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public/data/cities.json');

try {
  console.log("Reading cities.json...");
  const rawData = fs.readFileSync(filePath, 'utf8');
  let cities = JSON.parse(rawData);
  const initialCount = cities.length;

  cities = cities.filter(c => {
    const isBadLondon = c.city === "London" && c.country === "Canada";
    const isBadLagos = c.city === "Lagos" && c.country === "Portugal";
    if (isBadLondon) console.log("Found & Removing: London, Canada");
    if (isBadLagos) console.log("Found & Removing: Lagos, Portugal");
    return !isBadLondon && !isBadLagos;
  });

  if (cities.length < initialCount) {
    fs.writeFileSync(filePath, JSON.stringify(cities, null, 2));
    console.log(`Success! Removed ${initialCount - cities.length} entries.`);
  } else {
    console.log("No extraneous entries found.");
  }
} catch (error) {
  console.error("Error:", error);
}
