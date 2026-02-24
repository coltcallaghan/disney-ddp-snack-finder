# Supabase Integration Setup Guide

Your Disney DDP Snack Finder app is configured to use Supabase for:
- User authentication
- Favorite snacks (persistence)
- Reviews & ratings
- Search history
- User preferences
- Community availability reports
- Usage analytics

## 🚀 Quick Start

### 1. Get Your Supabase Credentials

Go to your Supabase project: https://app.supabase.com/project/uqtpzheurfpxmlfkslvx

Navigate to: **Settings → API**

Copy:
- **Project URL**: `https://uqtpzheurfpxmlfkslvx.supabase.co`
- **Anon Key**: (the `anon` public key)

### 2. Set Environment Variables

Create `.env.local` file in your project root:

```bash
VITE_SUPABASE_URL=https://uqtpzheurfpxmlfkslvx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace `your_anon_key_here` with the actual anon key from step 1.

### 3. Set Up Database Schema

Go to **SQL Editor** in your Supabase dashboard and paste the contents of `src/supabaseSchema.sql`.

This creates:
- `favorites` table
- `snack_reviews` table
- `search_history` table
- `user_preferences` table
- `availability_updates` table
- `analytics` table
- Row-level security policies
- Performance indexes

### 4. Enable Authentication

In your Supabase dashboard:
1. Go to **Authentication → Providers**
2. Enable "Email" (enabled by default)
3. (Optional) Enable "Google" or "GitHub" for social login

### 5. Test the Setup

```bash
npm run dev
```

The app will work without Supabase, but all features will be gracefully disabled if not configured.

---

## 📋 Features & Usage

### User Favorites

```typescript
import { addFavorite, removeFavorite, getFavorites, isFavorite } from './supabaseUtils';

// Add to favorites
await addFavorite('Aloha Isle - Snacks', 'Pineapple DOLE Whip');

// Check if favorited
const liked = await isFavorite('Aloha Isle - Snacks', 'Pineapple DOLE Whip');

// Get all favorites
const favorites = await getFavorites();

// Remove from favorites
await removeFavorite('Aloha Isle - Snacks', 'Pineapple DOLE Whip');
```

### Reviews & Ratings

```typescript
import { addReview, getReviews, getAverageRating } from './supabaseUtils';

// Add a review
await addReview(
  'Aloha Isle - Snacks',
  'Pineapple DOLE Whip',
  5,
  'Absolutely delicious!',
  true // was available
);

// Get reviews for a snack
const reviews = await getReviews('Aloha Isle - Snacks', 'Pineapple DOLE Whip');

// Get average rating
const avgRating = await getAverageRating('Aloha Isle - Snacks', 'Pineapple DOLE Whip');
```

### Search History

```typescript
import { logSearch, getSearchHistory } from './supabaseUtils';

// Log a search
await logSearch('cookie', 12); // 12 results found

// Get recent searches
const history = await getSearchHistory(); // Returns last 10 searches
```

### User Preferences

```typescript
import { savePreferences, getPreferences } from './supabaseUtils';

// Save preferences
await savePreferences({
  defaultPark: 'Magic Kingdom',
  dietaryRestrictions: ['vegetarian', 'nut-free'],
  preferredCategories: ['Ice Cream', 'Desserts'],
  autoLocationEnabled: true,
});

// Get preferences
const prefs = await getPreferences();
```

### Availability Reports

```typescript
import { reportAvailability, getAvailabilityUpdates } from './supabaseUtils';

// Report that an item is available/unavailable
await reportAvailability('Aloha Isle - Snacks', 'Pineapple DOLE Whip', true);

// Get recent reports for a snack
const updates = await getAvailabilityUpdates('Aloha Isle - Snacks', 'Pineapple DOLE Whip');
```

### Authentication

```typescript
import { signUp, signIn, signOut, getCurrentUser } from './supabaseUtils';

// Sign up
await signUp('user@example.com', 'password123');

// Sign in
const { data } = await signIn('user@example.com', 'password123');

// Get current user
const user = await getCurrentUser();

// Sign out
await signOut();
```

### Analytics

```typescript
import { logEvent } from './supabaseUtils';

// Log custom events
await logEvent('snack_searched', {
  query: 'ice cream',
  park: 'Magic Kingdom',
  resultsCount: 8,
});
```

---

## 🔐 Security

### Row Level Security (RLS)

All user-specific tables have RLS enabled:
- Users can only see/modify their own data
- Availability updates are public (community feature)
- Analytics don't store sensitive user info

### Safe Defaults

- Anon key is used (limited permissions)
- Service role key is for admin operations only
- Never commit `.env.local` with real keys

---

## 📊 Database Schema

### `favorites`
- `id`: Unique identifier
- `user_id`: Owner of favorite
- `restaurant_name`: Restaurant name
- `item_name`: Food item name
- `created_at`: When favorited

### `snack_reviews`
- `id`: Unique identifier
- `user_id`: Review author
- `restaurant_name`: Restaurant
- `item_name`: Food item
- `rating`: 1-5 stars
- `review_text`: Review comment
- `was_available`: Item availability
- `created_at`, `updated_at`: Timestamps

### `search_history`
- `id`: Unique identifier
- `user_id`: Searcher
- `search_query`: The search term
- `results_count`: Number of results
- `searched_at`: When searched

### `user_preferences`
- `id`: Unique identifier
- `user_id`: User
- `default_park`: Preferred park
- `dietary_restrictions`: Array of restrictions
- `preferred_categories`: Array of categories
- `auto_location_enabled`: Boolean
- `created_at`, `updated_at`: Timestamps

### `availability_updates`
- `id`: Unique identifier
- `restaurant_name`: Restaurant
- `item_name`: Item
- `is_available`: Boolean
- `reported_by`: User ID (optional)
- `reported_at`: When reported
- `verified`: Admin verification

### `analytics`
- `id`: Unique identifier
- `event_type`: Event name (e.g., 'snack_searched')
- `event_data`: JSON data
- `user_id`: User ID (null for anonymous)
- `session_id`: Session identifier
- `created_at`: Timestamp

---

## 🛠️ Troubleshooting

### "Supabase not configured" warning

This is normal! It means:
1. `.env.local` is not set up yet, OR
2. Environment variables aren't loaded

**Solution**: Create `.env.local` with your credentials (see Quick Start).

### Features not working after sign-in

Check:
1. Are environment variables set correctly?
2. Did you create the database schema?
3. Is the user authenticated? (Check RLS policies)

### Can't add to favorites / write data

Likely RLS issue:
1. Go to **Authentication → Users** and verify user exists
2. Go to **SQL Editor** and re-run RLS policy creation
3. Check user_id matches auth.users(id)

---

## 🎯 Next Steps

### Recommended Integrations

1. **Add Favorites Button to UI**
   - Show heart icon on snack cards
   - Click to toggle favorite
   - Show in separate "Favorites" tab

2. **Add Review System**
   - Show 5-star rating selector
   - Display average rating on cards
   - Show recent reviews

3. **User Account Page**
   - Display saved preferences
   - Show favorites and reviews
   - Manage dietary restrictions

4. **Community Availability**
   - Show if item reported available recently
   - Let users report unavailable items
   - Display community consensus

5. **Analytics Dashboard** (admin only)
   - Popular searches
   - Most reviewed snacks
   - Peak visiting times

---

## 📖 Resources

- [Supabase Docs](https://supabase.com/docs)
- [JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Authentication](https://supabase.com/docs/guides/auth)

---

## 🔗 Your Project

**URL**: https://app.supabase.com/project/uqtpzheurfpxmlfkslvx

**API Endpoint**: https://uqtpzheurfpxmlfkslvx.supabase.co

**Dashboard**: https://app.supabase.com

---

**Status**: ✅ Ready to use
**Created**: February 23, 2026
