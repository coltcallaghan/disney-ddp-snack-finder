// geocode_photon_batch.cjs
// Usage: node geocode_photon_batch.cjs
// Requires: node-fetch (npm install node-fetch)
// Reads names.txt, queries Photon for each name (stripped of meal/time suffix), writes restaurant_locations.json and not_found.txt

const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const INPUT_FILE = 'names.txt';
const OUTPUT_FILE = 'restaurant_locations.json';
const NOT_FOUND_FILE = 'not_found.txt';
const DELAY_MS = 1200;

// Remove meal/time suffixes (e.g., ' - Lunch/Dinner', ' - Breakfast', etc.)
function cleanName(name) {
  return name.split(' - ')[0].trim();
}

async function geocode(name) {
  const query = `${name}, Florida`;
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`;
  try {
    const res = await fetch(url);
    const text = await res.text();
    const data = JSON.parse(text);
    if (data.features && data.features.length) {
      const feat = data.features[0];
      return {
        name,
        lat: feat.geometry.coordinates[1],
        lng: feat.geometry.coordinates[0]
      };
    }
  } catch (e) {
    // ignore parse errors, treat as not found
  }
  return null;
}

async function main() {
  const rawNames = fs.readFileSync(INPUT_FILE, 'utf-8').split('\n').map(x => x.trim()).filter(Boolean);
  const uniqueCleaned = Array.from(new Set(rawNames.map(cleanName)));
  const results = [];
  const notFound = [];
  for (let i = 0; i < uniqueCleaned.length; i++) {
    const name = uniqueCleaned[i];
    process.stdout.write(`(${i + 1}/${uniqueCleaned.length}) Geocoding: ${name}... `);
    const loc = await geocode(name);
    if (loc) {
      results.push(loc);
      console.log('OK');
    } else {
      notFound.push(name);
      console.log('NOT FOUND');
    }
    if (i < uniqueCleaned.length - 1) await new Promise(r => setTimeout(r, DELAY_MS));
  }
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  fs.writeFileSync(NOT_FOUND_FILE, notFound.join('\n'));
  console.log(`\nSaved ${results.length} locations to ${OUTPUT_FILE}`);
  if (notFound.length) {
    console.log(`\n${notFound.length} names not found. See ${NOT_FOUND_FILE}`);
  } else {
    console.log('\nAll names found!');
  }
}

main();
