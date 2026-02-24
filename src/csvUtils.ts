// csvUtils.ts
import Papa from 'papaparse';

export interface SnackItem {
  ID?: string;
  item: string;
  restaurant: string;
  category: string;
  diningPlan: string;
  location: string;
  park: string;
  description: string;
  price: string;
  isDDPSnack: string; // 'true' or 'false' from CSV
  lat?: number; // optional latitude for geolocation
  lng?: number; // optional longitude for geolocation
  distance?: number | null; // distance in meters (optional)
  average_rating?: number | null; // average rating from Supabase
  total_reviews?: number | null; // total reviews from Supabase
  most_recent_availability?: boolean | null; // most recent availability from Supabase
}

export function parseCSV(csvText: string): SnackItem[] {
  const { data } = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  return data as SnackItem[];
}
