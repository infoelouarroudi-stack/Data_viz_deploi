const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public/data/cities.json');

try {
  console.log("Reading cities.json...");
  const rawData = fs.readFileSync(filePath, 'utf8');
  let cities = JSON.parse(rawData);
  const initialCount = cities.length;

  // Filter out the specific bad entries
  cities = cities.filter(c => {
    const isBadLondon = c.city === "London" && c.country === "Canada";
    const isBadLagos = c.city === "Lagos" && c.country === "Portugal";
    // Log if found
    if (isBadLondon) console.log("Removing London, Canada");
    if (isBadLagos) console.log("Removing Lagos, Portugal");
    
    return !isBadLondon && !isBadLagos;
  });

  if (cities.length < initialCount) {
    fs.writeFileSync(filePath, JSON.stringify(cities, null, 2));
    console.log(`Success! Removed ${initialCount - cities.length} entries.`);
  } else {
    console.log("No matching entries found to remove.");
  }
  
} catch (error) {
  console.error("SCRIPT ERROR:", error);
  process.exit(1);
}
