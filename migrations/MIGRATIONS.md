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

## How to Apply Migrations

1. Open your Supabase project: https://app.supabase.com/project/uqtpzheurfpxmlfkslvx
2. Go to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `001_create_schema.sql`
5. Click **Run** to execute
6. Verify all queries succeeded

## Migration Status

| Migration | Status | Applied Date |
|-----------|--------|--------------|
| 001_create_schema.sql | ✅ Applied | 2026-02-24 |

## Notes

- All migrations use `IF NOT EXISTS` to be idempotent
- RLS policies protect user data (users can only see their own data)
- Availability updates are public for community crowd-sourcing
- Analytics table can track anonymous users via session_id
