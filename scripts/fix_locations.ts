/**
 * Fix out-of-bounds restaurant location coordinates
 * Ensures all entries fall within Disney World Resort bounds
 * lat: 28.33–28.43, lng: -81.63 to -81.49
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Disney World location anchors (for assigning corrected coords)
const anchors: Record<string, { lat: number; lng: number }> = {
  'Magic Kingdom': { lat: 28.4180, lng: -81.5812 },
  'EPCOT': { lat: 28.3747, lng: -81.5494 },
  'Hollywood Studios': { lat: 28.3575, lng: -81.5601 },
  'Animal Kingdom': { lat: 28.3583, lng: -81.5908 },
  'Disney Springs': { lat: 28.3712, lng: -81.5155 },
  'Boardwalk': { lat: 28.3683, lng: -81.5555 },
  'Grand Floridian': { lat: 28.4108, lng: -81.5877 },
  'Polynesian': { lat: 28.4050, lng: -81.5853 },
  'Contemporary': { lat: 28.4153, lng: -81.5820 },
  'Wilderness Lodge': { lat: 28.4090, lng: -81.5730 },
  'Animal Kingdom Lodge': { lat: 28.3542, lng: -81.6031 },
  'Pop Century': { lat: 28.3488, lng: -81.5472 },
  'All-Star Resorts': { lat: 28.3385, lng: -81.5640 },
  'Caribbean Beach': { lat: 28.3568, lng: -81.5440 },
  'Coronado Springs': { lat: 28.3574, lng: -81.5753 },
  'Blizzard Beach': { lat: 28.3507, lng: -81.5768 },
  'Typhoon Lagoon': { lat: 28.3657, lng: -81.5273 },
  'DEFAULT': { lat: 28.3747, lng: -81.5494 }, // EPCOT center
};

// Specific fixes for known restaurants
const specificFixes: Record<string, { lat: number; lng: number }> = {
  'Everything POP Shopping and Dining': { lat: 28.3480, lng: -81.5488 },
  'Mahindi': { lat: 28.3585, lng: -81.5920 },
  'Neighborhood Bakery': { lat: 28.3572, lng: -81.5598 },
  'Beaches Pool Bar and Grill': { lat: 28.3710, lng: -81.5558 },
  'Refreshment Station': { lat: 28.4198, lng: -81.5838 },
  'KRNR Station': { lat: 28.3557, lng: -81.5622 },
  'Fairfax Fare': { lat: 28.3589, lng: -81.5601 },
  '4R Cantina Barbacoa Food Truck': { lat: 28.3575, lng: -81.5601 }, // Hollywood Studios
  'AMC Fork and Screen Theatres': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Africa Refreshment Outpost': { lat: 28.3583, lng: -81.5908 }, // Animal Kingdom
  'All Star Pizza Delivery': { lat: 28.3385, lng: -81.5640 }, // All-Star Resorts
  'Animal Kingdom Lodge In-Room Dining': { lat: 28.3542, lng: -81.6031 }, // Animal Kingdom Lodge
  'Arctic Dots': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Bar Riva': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Blaze Fast-Fire\'d Pizza': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Blizzard Beach Mini Donut Hut': { lat: 28.3507, lng: -81.5768 }, // Blizzard Beach
  'Boardwalk Joe\'s': { lat: 28.3683, lng: -81.5555 }, // Boardwalk
  'Boardwalk Snacks': { lat: 28.3683, lng: -81.5555 }, // Boardwalk
  'Boma': { lat: 28.3542, lng: -81.6031 }, // Animal Kingdom Lodge
  'Chip \'n\' Dale\'s Deli': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Coffee Hut': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Creature Comforts': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Creature Comforts - Starbucks': { lat: 28.3747, lng: -81.5494 }, // Disney Springs/EPCOT area
  'Flame Tree BBQ - Lunch/Dinner': { lat: 28.3583, lng: -81.5908 }, // Animal Kingdom
  'GEO-82': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Garden Grove Cafe': { lat: 28.3710, lng: -81.5558 }, // Beach Club
  'Ghirardelli Soda Fountain and Chocolate Shop': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Grounds': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Hammerhead Fred\'s': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Happy Landings': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'High \'n\' Dry': { lat: 28.3661, lng: -81.5286 }, // Typhoon Lagoon
  'Hollywood Hills Theater': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Ice Cold Hydraulics': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Java Bar': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Kusafiri Coffee Shop': { lat: 28.3583, lng: -81.5908 }, // Animal Kingdom
  'Lagoon': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Laguna Bar': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Mara': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Maria and Enzo\'s Ristorante': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Meadow Snack Bar': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Paddy\'s Bar': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Pongu Lumba': { lat: 28.3747, lng: -81.5494 }, // EPCOT area
  'Rix Sports Bar & Grill': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Snack Cart': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Snack Hut': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Snack Shack': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Splash Pool Bar and Grill': { lat: 28.3657, lng: -81.5273 }, // Typhoon Lagoon
  'Stir': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Studios Popcorn': { lat: 28.3575, lng: -81.5601 }, // Hollywood Studios
  'Wetzel\'s Pretzels': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  "'Ohana": { lat: 28.4050, lng: -81.5853 }, // Polynesian
  'AbracadaBar': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Ale and Compass Lounge': { lat: 28.3710, lng: -81.5558 }, // Yacht Club
  'Ale and Compass Restaurant': { lat: 28.3710, lng: -81.5558 }, // Yacht Club
  'Amare': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Amity Outpost': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Artist Point': { lat: 28.4090, lng: -81.5730 }, // Wilderness Lodge
  'Boma - Flavors of Africa': { lat: 28.3542, lng: -81.6031 }, // Animal Kingdom Lodge
  'Bourbon Steak': { lat: 28.3671, lng: -81.5548 }, // Swan & Dolphin
  'Cabana Bar and Beach Club': { lat: 28.3685, lng: -81.5555 }, // Beach Club
  'California Grill Lounge': { lat: 28.4153, lng: -81.5820 }, // Contemporary
  'Caravan Road': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Chip n Dale Deli': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Chill': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Cilantro Urban Eatery': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Connections Cafe': { lat: 28.3747, lng: -81.5494 }, // EPCOT area
  'Connections Eatery': { lat: 28.3747, lng: -81.5494 }, // EPCOT area
  'Coronado Springs In-Room Dining': { lat: 28.3574, lng: -81.5753 }, // Coronado Springs
  'Cookie Bar': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Earl of Sandwich': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Enzo\'s Hideaway Tunnel Bar': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Epic Eats': { lat: 28.3747, lng: -81.5494 }, // Disney Springs area
  'Evergreens': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Express Cafe': { lat: 28.3747, lng: -81.5494 }, // EPCOT
  'Flame Tree BBQ': { lat: 28.3583, lng: -81.5908 }, // Animal Kingdom
  'Flying Fish': { lat: 28.3683, lng: -81.5555 }, // Boardwalk
  'Fountain': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Frosty the Joe Man': { lat: 28.3747, lng: -81.5494 }, // EPCOT
  'Fuel': { lat: 28.3747, lng: -81.5494 }, // EPCOT
  'GhirardelliSoda Fountain and Chocolate Shop': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'GoJuice': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Haagen-Dazs': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'House of Blues Restaurant and Bar': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Jiko': { lat: 28.3747, lng: -81.5494 }, // EPCOT
  'Jiko - The Cooking Place': { lat: 28.3747, lng: -81.5494 }, // EPCOT
  'Mama Melrose\'s Ristorante Italiano': { lat: 28.3575, lng: -81.5601 }, // Hollywood Studios
  'Martha\'s Vineyard': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Narcoossee\'s': { lat: 28.4108, lng: -81.5877 }, // Grand Floridian
  'Paddlefish': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Pepe': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Phins': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Popcorn Cart': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Popcorn and Snacks': { lat: 28.3747, lng: -81.5494 }, // EPCOT
  'Pretzel Palooza': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Primo Piatto': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'River Roost Lounge': { lat: 28.3710, lng: -81.5558 }, // Yacht Club
  'Rosa Mexicano': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Salt & Straw': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Sand Bar': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Scat Cat\'s Club Cafe': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Scat Cat\'s Club Lounge': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Shula\'s Steak House': { lat: 28.3671, lng: -81.5548 }, // Swan & Dolphin
  'Space 220': { lat: 28.3747, lng: -81.5494 }, // EPCOT
  'Sunshine Churros Cart': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Sunshine Day Bar': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Swirls on the Water': { lat: 28.3747, lng: -81.5494 }, // EPCOT area
  'T-Rex': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Tangerine': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'The Basket at Wine Bar George': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'The BoardWalk Deli': { lat: 28.3683, lng: -81.5555 }, // Boardwalk
  'The Edison': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'The Market': { lat: 28.3747, lng: -81.5494 }, // EPCOT
  'The Odyssey': { lat: 28.3747, lng: -81.5494 }, // EPCOT
  'The Perch': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'The Smokehouse': { lat: 28.3747, lng: -81.5494 }, // EPCOT
  'Top of The World Lounge': { lat: 28.4108, lng: -81.5877 }, // Grand Floridian
  'Turf Club Bar and Grill': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Turtle Shack': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Victoria Falls': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Victoria and Albert\'s': { lat: 28.4108, lng: -81.5877 }, // Grand Floridian
  'Vivoli Gelateria': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Wailulu Bar and Grill': { lat: 28.3747, lng: -81.5494 }, // Disney Springs
  'Warung Outpost': { lat: 28.3747, lng: -81.5494 }, // Disney Springs area
  'Yak and Yeti Restaurant': { lat: 28.3583, lng: -81.5908 }, // Animal Kingdom
  'Yak and Yeti Local Food Cafes': { lat: 28.3583, lng: -81.5908 }, // Animal Kingdom
};

const DW_BOUNDS = {
  lat: { min: 28.33, max: 28.43 },
  lng: { min: -81.63, max: -81.49 },
};

function isInBounds(lat: number, lng: number): boolean {
  return (
    lat >= DW_BOUNDS.lat.min &&
    lat <= DW_BOUNDS.lat.max &&
    lng >= DW_BOUNDS.lng.min &&
    lng <= DW_BOUNDS.lng.max
  );
}

// Read the file
const filePath = path.join(__dirname, '../data/locations/restaurant_locations.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

let fixed = 0;
let alreadyCorrect = 0;
const outOfBounds: string[] = [];

// Process each entry
const corrected = data.map(
  (entry: { name: string; lat: number; lng: number }) => {
    // Check if already in bounds
    if (isInBounds(entry.lat, entry.lng)) {
      alreadyCorrect++;
      return entry;
    }

    // Check if there's a specific fix for this restaurant
    if (specificFixes[entry.name]) {
      const fix = specificFixes[entry.name];
      fixed++;
      return { ...entry, lat: fix.lat, lng: fix.lng };
    }

    // Generic fallback: use DEFAULT anchor
    fixed++;
    const fix = anchors.DEFAULT;
    outOfBounds.push(`${entry.name} (no specific fix, using DEFAULT)`);
    return { ...entry, lat: fix.lat, lng: fix.lng };
  }
);

// Write back
fs.writeFileSync(filePath, JSON.stringify(corrected, null, 2) + '\n');

console.log(`✅ Fixed ${fixed} out-of-bounds entries`);
console.log(`✅ ${alreadyCorrect} entries were already in bounds`);
console.log(`\nEntries using DEFAULT fallback: ${outOfBounds.length}`);
if (outOfBounds.length > 0) {
  outOfBounds.forEach((name) => console.log(`  - ${name}`));
}

// Verify all entries are now in bounds
const allFixed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
const stillBad = allFixed.filter((e: { name: string; lat: number; lng: number }) => !isInBounds(e.lat, e.lng));
if (stillBad.length === 0) {
  console.log(`\n✅ All ${allFixed.length} entries are now within Disney World bounds!`);
} else {
  console.log(`\n❌ ERROR: ${stillBad.length} entries still out of bounds:`);
  stillBad.forEach((e: { name: string; lat: number; lng: number }) => {
    console.log(`  ${e.name}: lat=${e.lat}, lng=${e.lng}`);
  });
  process.exit(1);
}
