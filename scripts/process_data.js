import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_PATH = path.join(__dirname, '../../cost-of-living_v2.csv');
const OUTPUT_DIR = path.join(__dirname, '../public/data');
const CITIES_OUTPUT_PATH = path.join(OUTPUT_DIR, 'cities.json');
const COUNTRIES_OUTPUT_PATH = path.join(OUTPUT_DIR, 'countries.json');

const COLUMN_MAPPING = {
    x1: 'meal_inexpensive',
    x2: 'meal_mid_range',
    x3: 'mc_meal',
    x4: 'beer_domestic_draught',
    x5: 'beer_imported_bottle',
    x6: 'cappuccino',
    x7: 'coke_pepsi',
    x8: 'water_restaurant',
    x9: 'milk',
    x10: 'bread',
    x11: 'rice',
    x12: 'eggs',
    x13: 'cheese',
    x14: 'chicken_fillets',
    x15: 'beef_round',
    x16: 'apples',
    x17: 'banana',
    x18: 'oranges',
    x19: 'tomato',
    x20: 'potato',
    x21: 'onion',
    x22: 'lettuce',
    x23: 'water_market',
    x24: 'wine',
    x25: 'beer_domestic_market',
    x26: 'beer_imported_market',
    x27: 'cigarettes',
    x28: 'ticket_one_way',
    x29: 'pass_monthly',
    x30: 'taxi_start',
    x31: 'taxi_1km',
    x32: 'taxi_waiting',
    x33: 'gasoline',
    x34: 'vw_golf',
    x35: 'toyota_corolla',
    x36: 'utilities_basic',
    x37: 'mobile_tariff',
    x38: 'internet',
    x39: 'fitness_club',
    x40: 'tennis_court',
    x41: 'cinema',
    x42: 'preschool',
    x43: 'primary_school',
    x44: 'jeans',
    x45: 'dress',
    x46: 'nike_shoes',
    x47: 'leather_shoes',
    x48: 'apt_1bed_city_center',
    x49: 'apt_1bed_outside_center',
    x50: 'apt_3bed_city_center',
    x51: 'apt_3bed_outside_center',
    x52: 'price_sqm_city_center',
    x53: 'price_sqm_outside_center',
    x54: 'salary',
    x55: 'mortgage_interest'
};

function processData() {
    console.log('Reading CSV file from:', INPUT_PATH);
    const csvFile = fs.readFileSync(INPUT_PATH, 'utf8');

    Papa.parse(csvFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
            const rawData = results.data;
            const processedCities = [];
            const countryStats = {};

            console.log(`Parsed ${rawData.length} rows.`);

            rawData.forEach(row => {
                const cityData = {
                    city: row.city,
                    country: row.country,
                    data_quality: row.data_quality === '1' // 1 is high quality usually? Or just boolean check. CSV has 0/1.
                };

                let hasValidSalary = false;
                let hasValidCosts = false;

                Object.keys(COLUMN_MAPPING).forEach(key => {
                    const value = parseFloat(row[key]);
                    const newKey = COLUMN_MAPPING[key];
                    
                    if (!isNaN(value)) {
                        cityData[newKey] = value;
                        if (newKey === 'salary') hasValidSalary = true;
                        // Basic validation: if we have rent or food costs
                        if (['meal_inexpensive', 'apt_1bed_city_center'].includes(newKey)) hasValidCosts = true;
                    } else {
                        cityData[newKey] = null;
                    }
                });

                // Calculate a simple "Cost of Living Index" (Total of common basket)
                // Use a simplified basket for sorting/ranking if needed
                // E.g., Rent + Food + Transport
                const rent = cityData.apt_1bed_city_center || 0;
                const food = (cityData.meal_inexpensive || 0) * 30 + (cityData.milk || 0) * 4 + (cityData.bread || 0) * 4;
                const transport = cityData.pass_monthly || 0;
                
                // Only add estimated cost if we have some data
                if (hasValidCosts) {
                    cityData.estimated_monthly_cost_single = rent + food + transport;
                }

                processedCities.push(cityData);

                // Country Aggregation
                if (!countryStats[row.country]) {
                    countryStats[row.country] = {
                        count: 0,
                        total_salary: 0,
                        total_cost: 0,
                        cities: []
                    };
                }
                
                const c = countryStats[row.country];
                c.count++;
                c.cities.push(row.city);
                if (cityData.salary) c.total_salary += cityData.salary;
                if (cityData.estimated_monthly_cost_single) c.total_cost += cityData.estimated_monthly_cost_single;
            });

            // Finalize Country Data
            const processedCountries = Object.keys(countryStats).map(country => {
                const c = countryStats[country];
                return {
                    country: country,
                    city_count: c.count,
                    avg_salary: c.count > 0 ? c.total_salary / c.count : 0,
                    avg_cost: c.count > 0 ? c.total_cost / c.count : 0,
                    cities: c.cities
                };
            });

            // Write files
            if (!fs.existsSync(OUTPUT_DIR)) {
                fs.mkdirSync(OUTPUT_DIR, { recursive: true });
            }

            fs.writeFileSync(CITIES_OUTPUT_PATH, JSON.stringify(processedCities, null, 2));
            fs.writeFileSync(COUNTRIES_OUTPUT_PATH, JSON.stringify(processedCountries, null, 2));

            console.log(`Successfully wrote ${processedCities.length} cities to ${CITIES_OUTPUT_PATH}`);
            console.log(`Successfully wrote ${processedCountries.length} countries to ${COUNTRIES_OUTPUT_PATH}`);
        },
        error: (err) => {
            console.error('Error parsing CSV:', err);
        }
    });
}

processData();
