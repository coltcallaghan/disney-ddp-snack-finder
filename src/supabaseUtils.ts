import { supabase, isSupabaseAvailable } from './supabaseClient';

// ==================== FAVORITES ====================

export async function addFavorite(restaurantName: string, itemName: string) {
  if (!isSupabaseAvailable()) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from('favorites').insert({
    user_id: user.id,
    restaurant_name: restaurantName,
    item_name: itemName,
  });

  if (error) console.error('Error adding favorite:', error);
  return data;
}

export async function removeFavorite(restaurantName: string, itemName: string) {
  if (!isSupabaseAvailable()) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('restaurant_name', restaurantName)
    .eq('item_name', itemName);

  if (error) console.error('Error removing favorite:', error);
  return data;
}

export async function getFavorites() {
  if (!isSupabaseAvailable()) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) console.error('Error fetching favorites:', error);
  return data || [];
}

export async function isFavorite(restaurantName: string, itemName: string) {
  if (!isSupabaseAvailable()) return false;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('restaurant_name', restaurantName)
    .eq('item_name', itemName)
    .single();

  return !!data;
}

// ==================== REVIEWS & RATINGS ====================

export async function addReview(
  restaurantName: string,
  itemName: string,
  rating: number,
  reviewText?: string,
  wasAvailable?: boolean
) {
  if (!isSupabaseAvailable()) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from('snack_reviews').insert({
    user_id: user.id,
    restaurant_name: restaurantName,
    item_name: itemName,
    rating,
    review_text: reviewText,
    was_available: wasAvailable,
  });

  if (error) console.error('Error adding review:', error);
  return data;
}

export async function getReviews(restaurantName: string, itemName: string) {
  if (!isSupabaseAvailable()) return [];

  const { data, error } = await supabase
    .from('snack_reviews')
    .select('*')
    .eq('restaurant_name', restaurantName)
    .eq('item_name', itemName)
    .order('created_at', { ascending: false });

  if (error) console.error('Error fetching reviews:', error);
  return data || [];
}

export async function getAverageRating(restaurantName: string, itemName: string) {
  if (!isSupabaseAvailable()) return null;

  const { data, error } = await supabase.rpc('get_average_rating', {
    p_restaurant_name: restaurantName,
    p_item_name: itemName,
  });

  if (error) console.error('Error fetching average rating:', error);
  return data;
}

// ==================== SEARCH HISTORY ====================

export async function logSearch(query: string, resultsCount: number) {
  if (!isSupabaseAvailable()) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from('search_history').insert({
    user_id: user.id,
    search_query: query,
    results_count: resultsCount,
  });

  if (error) console.error('Error logging search:', error);
  return data;
}

export async function getSearchHistory() {
  if (!isSupabaseAvailable()) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('search_history')
    .select('*')
    .eq('user_id', user.id)
    .order('searched_at', { ascending: false })
    .limit(10);

  if (error) console.error('Error fetching search history:', error);
  return data || [];
}

// ==================== USER PREFERENCES ====================

export async function savePreferences(preferences: {
  defaultPark?: string;
  dietaryRestrictions?: string[];
  preferredCategories?: string[];
  autoLocationEnabled?: boolean;
}) {
  if (!isSupabaseAvailable()) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      default_park: preferences.defaultPark,
      dietary_restrictions: preferences.dietaryRestrictions,
      preferred_categories: preferences.preferredCategories,
      auto_location_enabled: preferences.autoLocationEnabled,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) console.error('Error saving preferences:', error);
  return data;
}

export async function getPreferences() {
  if (!isSupabaseAvailable()) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found, which is expected for new users
    console.error('Error fetching preferences:', error);
  }
  return data || null;
}

// ==================== AVAILABILITY UPDATES ====================

export async function reportAvailability(
  restaurantName: string,
  itemName: string,
  isAvailable: boolean
) {
  if (!isSupabaseAvailable()) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.from('availability_updates').insert({
    restaurant_name: restaurantName,
    item_name: itemName,
    is_available: isAvailable,
    reported_by: user?.id || null,
  });

  if (error) console.error('Error reporting availability:', error);
  return data;
}

export async function getAvailabilityUpdates(restaurantName: string, itemName: string) {
  if (!isSupabaseAvailable()) return [];

  const { data, error } = await supabase
    .from('availability_updates')
    .select('*')
    .eq('restaurant_name', restaurantName)
    .eq('item_name', itemName)
    .order('reported_at', { ascending: false })
    .limit(5);

  if (error) console.error('Error fetching availability updates:', error);
  return data || [];
}

// ==================== AUTHENTICATION ====================

export async function signUp(email: string, password: string) {
  if (!isSupabaseAvailable()) return null;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) console.error('Error signing up:', error);
  return data;
}

export async function signIn(email: string, password: string) {
  if (!isSupabaseAvailable()) return null;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) console.error('Error signing in:', error);
  return data;
}

export async function signOut() {
  if (!isSupabaseAvailable()) return null;

  const { error } = await supabase.auth.signOut();

  if (error) console.error('Error signing out:', error);
  return !error;
}

export async function getCurrentUser() {
  if (!isSupabaseAvailable()) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

// ==================== ANALYTICS ====================

export async function logEvent(eventType: string, eventData?: Record<string, any>) {
  if (!isSupabaseAvailable()) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.from('analytics').insert({
    event_type: eventType,
    event_data: eventData,
    user_id: user?.id || null,
    session_id: sessionStorage.getItem('session_id'),
  });

  if (error) console.error('Error logging event:', error);
  return data;
}

// Initialize session ID for analytics
if (typeof window !== 'undefined' && !sessionStorage.getItem('session_id')) {
  sessionStorage.setItem('session_id', `session_${Date.now()}_${Math.random()}`);
}
