# Database Migrations

This directory contains Supabase database schema migrations.

## Applied Migrations

### 001_create_schema.sql
- **Status**: ✅ Applied
- **Date**: 2026-02-24
- **Description**: Create initial Disney DDP Snack Finder database schema
- **Changes**:
  - Create `favorites` table (user snack favorites)
  - Create `snack_reviews` table (ratings and reviews)
  - Create `search_history` table (search tracking)
  - Create `user_preferences` table (user settings)
  - Create `availability_updates` table (community availability reports)
  - Create `analytics` table (usage analytics)
  - Add performance indexes on all tables
  - Enable RLS on user-specific tables
  - Create RLS policies for data isolation

### 002_create_snacks_table.sql / 002_fix_snacks_id.sql
- **Status**: ✅ Applied
- **Date**: 2026-02-24
- **Description**: Create snacks table with aggregated stats and auto-updating triggers
- **Changes**:
  - Create `snacks` table with menu items and aggregated metrics
  - Auto-generate IDs with `BIGINT GENERATED ALWAYS AS IDENTITY`
  - Add columns: id, item_name, restaurant_name, category, park, price, is_ddp_snack
  - Add stats columns: average_rating, total_reviews, total_favorites, last_availability_report
  - Add performance indexes on restaurant, category, park, rating, ddp filter
  - Enable RLS (public can view all snacks)
  - Create triggers to auto-update stats when reviews/favorites/availability change
  - Seed data with `npm run seed:snacks` script
- **Seeding Result**: ✅ 4,295 unique snacks loaded

## How to Apply Migrations

### Migration 001_create_schema.sql (Already Applied)
1. Open your Supabase project: https://app.supabase.com/project/uqtpzheurfpxmlfkslvx
2. Go to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `001_create_schema.sql`
5. Click **Run** to execute
6. Verify all queries succeeded

### Migration 002_create_snacks_table.sql (Ready to Apply)
1. Go to **SQL Editor** in your Supabase project
2. Create a new query
3. Copy and paste the contents of `002_create_snacks_table.sql`
4. Click **Run** to execute
5. Verify all queries succeeded

### Seed Snack Data (After applying 002)
Once migration 002 is applied, seed the snack data:
```bash
npm run seed:snacks
```

This will:
- Load all 700+ snacks from `public/data.csv` into the `snacks` table
- Set up automatic stat updates (ratings, favorites, availability)
- Display progress and final statistics

## Migration Status

| Migration | Status | Applied Date |
|-----------|--------|--------------|
| 001_create_schema.sql | ✅ Applied | 2026-02-24 |
| 002_fix_snacks_id.sql | ✅ Applied | 2026-02-24 |
| Snacks seeded | ✅ Complete | 2026-02-24 |

## Seeding Details

The `npm run seed:snacks` script:
- Parses `public/data.csv` containing 22,112 menu entries
- Deduplicates by restaurant+item (reduces to 4,295 unique snacks)
- Auto-generates sequential IDs to avoid conflicts
- Batches inserts in groups of 100 for performance
- Clears existing data before inserting
- Displays progress and final statistics

### Snacks Data Breakdown
- **Total unique snacks**: 4,295
- **DDP snacks**: ~2,800 (65%)
- **Other items**: ~1,495 (35%)

## Notes

- All migrations use `IF NOT EXISTS` to be idempotent
- RLS policies protect user data (users can only see their own data)
- Snacks table is public (anyone can read all snacks)
- Availability updates are public for community crowd-sourcing
- Analytics table can track anonymous users via session_id
- Triggers auto-update snack stats when reviews/favorites/availability change
