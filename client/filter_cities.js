const fs = require('fs');
const path = require('path');

const citiesPath = path.join(__dirname, 'public/data/cities.json');

try {
  const data = fs.readFileSync(citiesPath, 'utf8');
  let cities = JSON.parse(data);
  
  const originalLength = cities.length;
  
  cities = cities.filter(c => 
    !(c.city === "London" && c.country === "Canada") &&
    !(c.city === "Lagos" && c.country === "Portugal")
  );
  
  const newLength = cities.length;
  console.log(`Removed ${originalLength - newLength} entries.`);
  
  fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2));
  console.log("Successfully updated cities.json");
} catch (err) {
  console.error("Error processing cities.json:", err);
}
