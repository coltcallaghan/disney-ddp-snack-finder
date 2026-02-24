// Types for Disney food picker app


export type FoodType = 'quick-service' | 'snack' | 'avoid';

export interface SnackItem {
  item: string;
  restaurant: string;
  category: string;
  diningPlan: string;
  location: string;
  park: string;
}

export interface FoodItem {
  name: string;
  type: FoodType;
  details?: string;
}

export interface Location {
  name: string;
  type: 'quick-service' | 'snack' | 'avoid';
  description?: string;
  foodItems: FoodItem[];
}

export interface Land {
  name: string;
  locations: Location[];
}

export interface Park {
  name: string;
  lands: Land[];
}
