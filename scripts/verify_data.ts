import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

async function main() {
  const envPath = path.join(process.cwd(), '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};
  envContent.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });

  const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

  // Check total count
  const { count: total } = await supabase
    .from('snacks')
    .select('*', { count: 'exact' });

  // Check DDP count
  const { count: ddp } = await supabase
    .from('snacks')
    .select('*', { count: 'exact' })
    .eq('is_ddp_snack', true);

  // Check first 5 snacks
  const { data: first5 } = await supabase
    .from('snacks')
    .select('id, item_name, restaurant_name, is_ddp_snack, park')
    .limit(5);

  console.log('Database Status:');
  console.log(`Total snacks: ${total}`);
  console.log(`DDP snacks: ${ddp}`);
  console.log('');
  console.log('First 5 snacks:');
  first5?.forEach((s: any) => {
    console.log(`  ID ${s.id}: ${s.restaurant_name} - ${s.item_name} (DDP: ${s.is_ddp_snack})`);
  });
}

main();
