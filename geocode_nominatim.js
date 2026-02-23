// geocode_nominatim.js
// Usage: node geocode_nominatim.js
// Requires: node-fetch (npm install node-fetch)

const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const INPUT_FILE = 'names.txt';
const OUTPUT_FILE = 'restaurant_locations.json';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const DELAY_MS = 1200; // 1.2 seconds per Nominatim policy

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function geocode(name) {
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
  const names = fs.readFileSync(INPUT_FILE, 'utf-8').split('\n').map(x => x.trim()).filter(Boolean);
  const results = [];
  const notFound = [];
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    process.stdout.write(`(${i + 1}/${names.length}) Geocoding: ${name}... `);
    const loc = await geocode(name);
    if (loc) {
      results.push(loc);
      console.log('OK');
    } else {
      notFound.push(name);
      console.log('NOT FOUND');
    }
    if (i < names.length - 1) await sleep(DELAY_MS);
  }
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\nSaved ${results.length} locations to ${OUTPUT_FILE}`);
  if (notFound.length) {
    console.log('\nRestaurants not found:');
    notFound.forEach(n => console.log(' -', n));
  } else {
    console.log('\nAll restaurants found!');
  }
}

main();
