import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

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
  id: number;
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
    const csvPath = path.join(process.cwd(), 'public', 'data.csv');
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

    // Transform data
    const snacksToInsert: SnackToInsert[] = parsed.data.map((row) => ({
      id: parseInt(row.ID, 10),
      item_name: row.ITEM.trim(),
      restaurant_name: row.RESTAURANT.trim(),
      category: row.CATEGORY?.trim() || null,
      dining_plan: row['DINING PLAN']?.trim() || null,
      location: row.LOCATION?.trim() || null,
      park: row['DISNEY PARK']?.trim() || null,
      description: row.DESCRIPTION?.trim() || null,
      price: row.PRICE?.trim() || null,
      is_ddp_snack: row.IS_DDP_SNACK === 'true',
    }));

    // Insert in batches of 100
    const batchSize = 100;
    for (let i = 0; i < snacksToInsert.length; i += batchSize) {
      const batch = snacksToInsert.slice(i, i + batchSize);

      const { error } = await supabase
        .from('snacks')
        .upsert(batch, { onConflict: 'restaurant_name,item_name' });

      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        process.exit(1);
      }

      console.log(`✅ Inserted ${Math.min(i + batchSize, snacksToInsert.length)}/${snacksToInsert.length} snacks`);
    }

    // Get stats
    const { data: stats, error: statsError } = await supabase
      .from('snacks')
      .select('COUNT(*)', { count: 'exact' });

    if (statsError) {
      console.error('❌ Error getting stats:', statsError);
    } else {
      console.log(`\n✅ Seed complete! ${snacksToInsert.length} snacks loaded to Supabase`);

      // Get DDP count
      const { count: ddpCount, error: ddpError } = await supabase
        .from('snacks')
        .select('*', { count: 'exact' })
        .eq('is_ddp_snack', true);

      if (!ddpError && ddpCount !== null) {
        console.log(`   • Total snacks: ${snacksToInsert.length}`);
        console.log(`   • DDP snacks: ${ddpCount}`);
        console.log(`   • Other items: ${snacksToInsert.length - ddpCount}`);
      }
    }

    console.log('\n🎉 Done!');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

seedSnacks();
