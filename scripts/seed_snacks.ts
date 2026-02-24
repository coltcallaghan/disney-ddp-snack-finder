import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

// Load .env.local manually since tsx doesn't auto-load it
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value;
      }
    }
  });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SnackRow {
  ID: string;
  ITEM: string;
  RESTAURANT: string;
  CATEGORY: string;
  'DINING PLAN': string;
  LOCATION: string;
  'DISNEY PARK': string;
  DESCRIPTION: string;
  PRICE: string;
  IS_DDP_SNACK: string;
}

interface SnackToInsert {
  item_name: string;
  restaurant_name: string;
  category: string | null;
  dining_plan: string | null;
  location: string | null;
  park: string | null;
  description: string | null;
  price: string | null;
  is_ddp_snack: boolean;
}

async function seedSnacks() {
  try {
    console.log('🌱 Starting snack data seed...');

    // Read CSV file
    const csvPath = path.join(process.cwd(), 'public', 'data_aligned_with_ids.csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');

    // Parse CSV
    const parsed = Papa.parse<SnackRow>(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });

    if (!parsed.data || parsed.data.length === 0) {
      console.error('❌ Error: No data found in CSV');
      process.exit(1);
    }

    console.log(`📋 Found ${parsed.data.length} snacks in CSV`);

    // Clear existing snacks data
    console.log('🧹 Clearing existing snacks...');
    const { error: deleteError } = await supabase
      .from('snacks')
      .delete()
      .neq('id', -1); // Delete all rows

    if (deleteError) {
      console.error('⚠️  Warning: Could not clear existing snacks:', deleteError.message);
    } else {
      console.log('✅ Cleared existing snacks');
    }

    // Transform data
    const seen = new Set<string>();
    const snacksToInsert: SnackToInsert[] = parsed.data
      .filter((row: SnackRow) => {
        if (!row.ITEM || !row.RESTAURANT) return false;
        const item = (row.ITEM || '').trim();
        const restaurant = (row.RESTAURANT || '').trim();
        if (!item || !restaurant) return false;
        const key = `${restaurant}|||${item}`;
        if (seen.has(key)) return false; // Skip duplicate
        seen.add(key);
        return true;
      })
      .map((row: SnackRow) => ({
        item_name: (row.ITEM || '').trim(),
        restaurant_name: (row.RESTAURANT || '').trim(),
        category: (row.CATEGORY || '').trim() || null,
        dining_plan: (row['DINING PLAN'] || '').trim() || null,
        location: (row.LOCATION || '').trim() || null,
        park: (row['DISNEY PARK'] || '').trim() || null,
        description: (row.DESCRIPTION || '').trim() || null,
        price: (row.PRICE || '').trim() || null,
        is_ddp_snack: row.IS_DDP_SNACK === 'true',
      }));

    // Insert in batches of 100
    const batchSize = 100;
    for (let i = 0; i < snacksToInsert.length; i += batchSize) {
      const batch = snacksToInsert.slice(i, i + batchSize);

      const { error } = await supabase
        .from('snacks')
        .insert(batch);

      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        process.exit(1);
      }

      console.log(`✅ Inserted ${Math.min(i + batchSize, snacksToInsert.length)}/${snacksToInsert.length} snacks`);
    }

    // Get DDP count
    const { count: ddpCount, error: ddpError } = await supabase
      .from('snacks')
      .select('*', { count: 'exact' })
      .eq('is_ddp_snack', true);

    console.log(`\n✅ Seed complete! ${snacksToInsert.length} snacks loaded to Supabase`);

    if (!ddpError && ddpCount !== null) {
      console.log(`   • Total snacks: ${snacksToInsert.length}`);
      console.log(`   • DDP snacks: ${ddpCount}`);
      console.log(`   • Other items: ${snacksToInsert.length - ddpCount}`);
    }

    console.log('\n🎉 Done!');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

seedSnacks();
