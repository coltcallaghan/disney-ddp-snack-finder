// get_restaurant_locations.js

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const INPUT_FILE = path.join(__dirname, 'disney_restaurant_food_data.json');
const OUTPUT_FILE = path.join(__dirname, 'restaurant_locations.json');
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const DELAY_MS = 1200; // 1.2 seconds per Nominatim usage policy

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function geocodeRestaurant(name) {
  const query = encodeURIComponent(`${name}, Walt Disney World, Florida`);
  const url = `${NOMINATIM_URL}?q=${query}&format=json&limit=1&addressdetails=0`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'DisneyGeoScript/1.0 (contact: your-email@example.com)' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.length === 0) return null;
    return {
      name,
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    };
  } catch (err) {
    console.error(`Error fetching for "${name}":`, err.message);
    return null;
  }
}

async function main() {
  // 1. Read and parse input file
  const raw = fs.readFileSync(INPUT_FILE, 'utf-8');
  const foodData = JSON.parse(raw);

  // 2. Extract unique restaurant names
  const names = new Set();
  for (const item of foodData) {
    if (item.restaurant) names.add(item.restaurant.trim());
  }
  const uniqueNames = Array.from(names);

  // 3. Geocode each restaurant
  const results = [];
  const notFound = [];
  for (let i = 0; i < uniqueNames.length; i++) {
    const name = uniqueNames[i];
    process.stdout.write(`(${i + 1}/${uniqueNames.length}) Geocoding: ${name}... `);
    const loc = await geocodeRestaurant(name);
    if (loc) {
      results.push(loc);
      console.log('OK');
    } else {
      notFound.push(name);
      console.log('NOT FOUND');
    }
    if (i < uniqueNames.length - 1) await sleep(DELAY_MS);
  }

  // 4. Write output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\nSaved ${results.length} locations to ${OUTPUT_FILE}`);

  // 5. Log not found
  if (notFound.length) {
    console.log('\nRestaurants not found:');
    notFound.forEach(n => console.log(' -', n));
  } else {
    console.log('\nAll restaurants found!');
  }
}

main();
