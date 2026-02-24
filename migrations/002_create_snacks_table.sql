-- Migration: 002_create_snacks_table.sql
-- Created: 2026-02-24
-- Description: Create snacks table to store menu items with aggregated stats

-- 1. Snacks Table
CREATE TABLE IF NOT EXISTS snacks (
  id BIGINT PRIMARY KEY,
  item_name TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  category TEXT,
  dining_plan TEXT,
  location TEXT,
  park TEXT,
  description TEXT,
  price TEXT,
  is_ddp_snack BOOLEAN DEFAULT false,
  average_rating FLOAT DEFAULT NULL,
  total_reviews INT DEFAULT 0,
  total_favorites INT DEFAULT 0,
  last_availability_report TIMESTAMP WITH TIME ZONE,
  most_recent_availability BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(restaurant_name, item_name)
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_snacks_restaurant ON snacks(restaurant_name);
CREATE INDEX IF NOT EXISTS idx_snacks_item ON snacks(item_name);
CREATE INDEX IF NOT EXISTS idx_snacks_category ON snacks(category);
CREATE INDEX IF NOT EXISTS idx_snacks_park ON snacks(park);
CREATE INDEX IF NOT EXISTS idx_snacks_ddp ON snacks(is_ddp_snack);
CREATE INDEX IF NOT EXISTS idx_snacks_rating ON snacks(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_snacks_restaurant_item ON snacks(restaurant_name, item_name);

-- Enable RLS (public can view all snacks)
ALTER TABLE snacks ENABLE ROW LEVEL SECURITY;

-- Create RLS policy - anyone can view snacks
CREATE POLICY "Anyone can view snacks"
  ON snacks FOR SELECT
  USING (TRUE);

-- Trigger to update average_rating when reviews change
CREATE OR REPLACE FUNCTION update_snack_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE snacks
  SET
    average_rating = (
      SELECT AVG(rating) FROM snack_reviews
      WHERE restaurant_name = NEW.restaurant_name AND item_name = NEW.item_name
    ),
    total_reviews = (
      SELECT COUNT(*) FROM snack_reviews
      WHERE restaurant_name = NEW.restaurant_name AND item_name = NEW.item_name
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE restaurant_name = NEW.restaurant_name AND item_name = NEW.item_name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_snack_stats_after_review
AFTER INSERT OR UPDATE ON snack_reviews
FOR EACH ROW EXECUTE FUNCTION update_snack_stats();

-- Trigger to update total_favorites when favorites change
CREATE OR REPLACE FUNCTION update_snack_favorites()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE snacks
  SET
    total_favorites = (
      SELECT COUNT(*) FROM favorites
      WHERE restaurant_name = NEW.restaurant_name AND item_name = NEW.item_name
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE restaurant_name = NEW.restaurant_name AND item_name = NEW.item_name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_snack_favorites_after_favorite
AFTER INSERT OR DELETE ON favorites
FOR EACH ROW EXECUTE FUNCTION update_snack_favorites();

-- Trigger to update availability when availability_updates change
CREATE OR REPLACE FUNCTION update_snack_availability()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE snacks
  SET
    most_recent_availability = (
      SELECT is_available FROM availability_updates
      WHERE restaurant_name = NEW.restaurant_name AND item_name = NEW.item_name
      ORDER BY reported_at DESC
      LIMIT 1
    ),
    last_availability_report = (
      SELECT reported_at FROM availability_updates
      WHERE restaurant_name = NEW.restaurant_name AND item_name = NEW.item_name
      ORDER BY reported_at DESC
      LIMIT 1
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE restaurant_name = NEW.restaurant_name AND item_name = NEW.item_name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_snack_availability_after_report
AFTER INSERT OR UPDATE ON availability_updates
FOR EACH ROW EXECUTE FUNCTION update_snack_availability();
