# Developer Notes - Disney DDP Snack Finder Redesign

## Architecture Overview

The app is a **Vite + React + TypeScript** SPA with zero backend. All data comes from a CSV file served as a static asset.

### Data Flow
```
CSV Data (data_aligned_with_ids.csv)
    ↓
parseCSV() → SnackItem[]
    ↓
Filter by: search, category, park, DDP status
    ↓
Sort by distance (from user location)
    ↓
Render card grid
```

### State Management

All state lives in `App.tsx` using React hooks:

```typescript
type GeoStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';

// Location
const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
const [userLocation, setUserLocation] = useState({ lat, lng });

// Search & filters
const [searchQuery, setSearchQuery] = useState('');
const [selectedDiningPlan, setSelectedDiningPlan] = useState('Included'); // Default DDP
const [selectedPark, setSelectedPark] = useState('');
const [selectedCategory, setSelectedCategory] = useState('');
const [selectedLand, setSelectedLand] = useState('');

// Data
const [snacks, setSnacks] = useState<SnackItem[]>([]);
const [dataLoaded, setDataLoaded] = useState(false);
const [showInfo, setShowInfo] = useState(false);
```

---

## Key Functions

### GPS Location Tracking
**File:** `src/App.tsx`

```typescript
const requestGPS = useCallback(() => {
  if (!navigator.geolocation) {
    setGeoStatus('unavailable');
    return;
  }
  setGeoStatus('requesting');
  navigator.geolocation.getCurrentPosition(
    (position) => {
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setGeoStatus('granted');
    },
    () => setGeoStatus('denied'),
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // Cache location for 1 minute
    }
  );
}, []);

useEffect(() => {
  requestGPS();
}, [requestGPS]);
```

**Notes:**
- `enableHighAccuracy: true` — requests precise location (uses cellular/WiFi)
- `timeout: 10000` — gives 10 seconds for browser to get location
- `maximumAge: 60000` — reuses cached location if < 1 minute old
- Falls back to Disney World center if denied/unavailable

---

### Distance Calculation
**File:** `src/App.tsx`

```typescript
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (x: number) => x * Math.PI / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
```

**Accuracy:** ±0.5% at Disney World scale (accurate enough for walking)

**Used in:**
- Sorting filtered snacks (closest first)
- Distance badge on each card ("2.5 km")

---

### Smart Map Link Generation
**File:** `src/mapLinkUtils.ts`

```typescript
export function isAppleDevice(): boolean {
  const ua = window.navigator.userAgent;
  return (
    ua.includes('iPhone') ||
    ua.includes('iPad') ||
    ua.includes('Mac') ||
    (/AppleWebKit/.test(ua) && !ua.includes('Chrome'))
  );
}

export function getDirectionsUrl(
  destLat: number,
  destLng: number,
  originLat?: number,
  originLng?: number
): string {
  if (isAppleDevice()) {
    // Apple Maps: maps://maps.apple.com/?daddr=LAT,LNG&dirflg=w
    const params = new URLSearchParams({
      daddr: `${destLat},${destLng}`,
      dirflg: 'w', // walking mode
    });
    if (originLat !== undefined && originLng !== undefined) {
      params.set('saddr', `${originLat},${originLng}`);
    }
    return 'maps://maps.apple.com/?' + params.toString();
  } else {
    // Google Maps: https://www.google.com/maps/dir/?api=1&...
    const params = {
      api: '1',
      destination: `${destLat},${destLng}`,
      travelmode: 'walking',
    };
    if (originLat !== undefined && originLng !== undefined) {
      params['origin'] = `${originLat},${originLng}`;
    }
    return 'https://www.google.com/maps/dir/?' + new URLSearchParams(params).toString();
  }
}
```

**Platform Detection Logic:**
- **Apple devices**: iPhone, iPad, Mac, or AppleWebKit (but not Chrome on Mac)
- **Everything else**: Falls back to Google Maps HTTP link

**Usage in JSX:**
```tsx
const directionsUrl = getDirectionsUrl(lat, lng, userLocation.lat, userLocation.lng);
<a href={directionsUrl} target="_blank" rel="noopener noreferrer">
  Get Directions
</a>
```

---

### CSV Data Parsing
**File:** `src/csvUtils.ts`

```typescript
export function parseCSV(text: string): SnackItem[] {
  return Papa.parse<SnackItem>(text, {
    header: true,
    skipEmptyLines: true,
  }).data;
}

export interface SnackItem {
  ID?: string;
  item: string;              // "Pineapple DOLE Whip"
  restaurant: string;        // "Aloha Isle - Snacks"
  category: string;          // "Ice Cream", "Snacks", "Beverages"
  diningPlan: string;        // "Snack" or empty
  location: string;          // "Adventureland"
  park: string;              // "Magic Kingdom"
  description: string;
  price: string;             // "$7.49"
  isDDPSnack: string;        // "true" or "false"
  lat?: number;
  lng?: number;
  distance?: number | null;
}
```

**Notes:**
- PapaParse handles CSV parsing with headers
- `isDDPSnack` is a string (`"true"` or `"false"`) from CSV, so comparison is: `snack.isDDPSnack === 'true'`
- Location coordinates are looked up from `restaurant_locations.json` via restaurant name normalization

---

### Filtering Pipeline
**File:** `src/App.tsx`

```typescript
const filteredSnacks = useMemo(() => {
  // 1. Apply all filters
  const filtered = snacks.filter(s => {
    const matchesLand = !selectedLand || s.location === selectedLand;
    const matchesCategory = !selectedCategory || s.category === selectedCategory;
    const matchesPark = !selectedPark || s.park === selectedPark;
    const matchesDiningPlan =
      selectedDiningPlan === '' || (selectedDiningPlan === 'Included' && s.isDDPSnack === 'true');
    const matchesQuery = !searchQuery ||
      (s.restaurant && s.restaurant.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.item && s.item.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesLand && matchesCategory && matchesPark && matchesDiningPlan && matchesQuery;
  });

  // 2. Look up coordinates for each snack
  const withLoc = [];
  const withoutLoc = [];
  for (const snack of filtered) {
    let lat, lng;
    // Try canonical name → alias list → fallback
    const canonicalName = getCanonicalLocationName(snack.restaurant);
    const allAliases = canonicalName && aliases[canonicalName]
      ? [canonicalName, ...aliases[canonicalName]]
      : [snack.restaurant];

    for (const alias of allAliases) {
      const loc = locationMap[normalizeName(alias)];
      if (loc) { lat = loc.lat; lng = loc.lng; break; }
    }

    if (lat && lng) {
      const dist = haversineDistance(userLocation.lat, userLocation.lng, lat, lng);
      withLoc.push({ snack, dist });
    } else {
      withoutLoc.push(snack);
    }
  }

  // 3. Sort by distance, then alphabetically
  withLoc.sort((a, b) => a.dist - b.dist);
  withoutLoc.sort((a, b) => (a.snack.item || '').localeCompare(b.snack.item || ''));

  return [...withLoc.map(w => w.snack), ...withoutLoc];
}, [snacks, selectedLand, selectedCategory, selectedPark, selectedDiningPlan, searchQuery, userLocation, aliases, locationMap]);
```

**Order of Operations:**
1. Filter by all criteria (user inputs)
2. Look up lat/lng from restaurant name (with alias resolution)
3. Calculate distance for located items
4. Sort located items by distance (ascending)
5. Sort non-located items alphabetically
6. Return combined list

---

## CSS Custom Properties

### Design Tokens
**File:** `src/index.css`

```css
:root {
  /* Colors */
  --disney-blue: #1a5fb4;
  --disney-blue-light: #3584e4;
  --disney-blue-dark: #0d3b7a;
  --disney-gold: #e5a50a;
  --disney-gold-light: #f5d547;

  /* DDP Badge */
  --ddp-badge-bg: linear-gradient(135deg, #b8860b 0%, #e5a50a 40%, #f5d547 70%, #e5a50a 100%);
  --ddp-badge-text: #3d2200;
  --ddp-badge-shadow: 0 2px 8px rgba(229, 165, 10, 0.5);

  /* Spacing scale (4px base) */
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
  --spacing-2xl: 3rem;     /* 48px */

  /* Border radius (8px base) */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
}
```

### CSS Custom Properties in JSX

When using custom properties from CSS variables in React inline styles:

```tsx
<div
  className="snack-card"
  style={{ '--card-index': idx } as React.CSSProperties}
>
```

The `as React.CSSProperties` cast is needed because TypeScript doesn't natively type custom properties.

**Usage in CSS:**
```css
.snack-card {
  animation-delay: calc(var(--card-index, 0) * var(--card-stagger-delay));
}
```

---

## TypeScript Tips

### Utility Types Used

```typescript
type GeoStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';

type SnackItem = {
  ID?: string;
  item: string;
  restaurant: string;
  // ... more fields
};

type FilterState = {
  searchQuery: string;
  selectedPark: string;
  // ...
};
```

### Casting

```typescript
// For inline styles with CSS custom properties
style={{ '--card-index': idx } as React.CSSProperties}

// For useRef on Leaflet map (external library)
const mapRef = useRef<any>(null);
```

---

## Performance Considerations

### Memoization
- `useMemo` for filtering (expensive array operations)
- `useMemo` for unique values in dropdowns
- `useCallback` for GPS request (stable reference)

### Optimizations
- Lazy load data: CSV fetched only on mount
- Staggered card entrance: Only first 20 cards get individual animation delays (prevents 3+ second delays on long lists)
- Efficient distance lookup: Pre-compute `locationMap` object for O(1) lookups

### Potential Improvements
- Virtualize card list for 1000+ items
- Cache location permission result
- Pre-fetch restaurant coordinates on mount
- Debounce search input

---

## Browser APIs Used

### `navigator.geolocation`
- Requestpermission from user
- Get latitude/longitude
- Fallback if denied

**Compatibility:** All modern browsers

### `fetch()` + `text()`
- Load CSV file
- Stream as text for parsing

**Compatibility:** All modern browsers

### `URLSearchParams`
- Build query strings for map links

**Compatibility:** All modern browsers

---

## File Structure

```
/src
  /components
    RestaurantMap.tsx         ← Leaflet map (now unused in main view)
    InfoModal.tsx             ← DDP info modal
    userIcon.ts               ← Red marker icon for Leaflet
    [other components]
  App.tsx                      ← Main app (all logic here)
  App.css                      ← Component styles
  index.css                    ← Global styles + design tokens
  main.tsx                     ← React entry point
  csvUtils.ts                  ← CSV parsing
  restaurantAliasUtils.ts      ← Restaurant name normalization
  mapLinkUtils.ts              ← Smart map links (NEW)
  disneyFoodTypes.ts           ← Old type defs (legacy)

/public
  data_aligned_with_ids.csv    ← Food data source
  Disney_wordmark.svg.png      ← Header logo
  restaurant_locations.json    ← Lat/lng lookup
  restaurant_aliases.json      ← Name variants

package.json
vite.config.ts
tsconfig.json
```

---

## Testing Checklist

### Unit Testing
```bash
npm run test  # (not configured yet, would test mapLinkUtils, haversineDistance)
```

### E2E Testing (manual)
- [ ] GPS prompt on load
- [ ] Search filters cards in real-time
- [ ] DDP toggle shows/hides non-DDP items
- [ ] Distance badge updates on location drag
- [ ] Get Directions opens correct map app
- [ ] Modal opens/closes
- [ ] Responsive layout (mobile, tablet, desktop)

### Build Verification
```bash
npm run build  # Should produce dist/ with no TS errors
```

---

## Future Enhancement Ideas

### High Priority
1. **Map View Toggle**: Button to show/hide Leaflet map in bottom sheet
2. **Favorites**: Save favorite snacks to localStorage
3. **History**: Remember recent searches

### Medium Priority
1. **Dark Mode**: Toggle with localStorage persistence
2. **Offline Support**: Service worker + localStorage caching
3. **Multiple Parks**: Support EPCOT, Hollywood Studios, etc.

### Low Priority
1. **Smart Notifications**: "Rare snack nearby!"
2. **Rating System**: User ratings of snacks
3. **QR Code Sharing**: Share snack locations with group
4. **AR View**: Point camera at map to see snacks in real world

---

## Common Issues & Solutions

### Issue: GPS never completes
**Solution:** Location permission not granted, or GPS unavailable indoors. App shows amber banner and falls back to draggable pin.

### Issue: Cards not sorted by distance
**Solution:** Check that `locationMap` has the restaurant. Use browser DevTools to inspect `restaurant_locations.json` content.

### Issue: Map directions open Google Maps on iOS
**Solution:** `isAppleDevice()` check failed. Try adding `|| ua.includes('WebKit')` to detection.

### Issue: Search is case-sensitive
**Solution:** Convert search input to lowercase in filter: `.toLowerCase().includes(query.toLowerCase())`

---

## Deployment

### Build & Serve
```bash
npm run build          # Creates dist/
npm run preview        # Local preview of dist/
npx http-server dist/  # Serve on localhost
```

### Hosting
- **Vercel**: `vercel deploy` (detects Vite automatically)
- **Netlify**: `netlify deploy --prod`
- **GitHub Pages**: Configure in vite.config.ts with `base: '/Disney/'`
- **AWS S3**: `aws s3 sync dist/ s3://bucket-name/`

### Environment Variables
- Currently none used
- Could add API keys for map services (not needed, using web links)

---

## References

- **Haversine Formula**: https://en.wikipedia.org/wiki/Haversine_formula
- **Geolocation API**: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
- **Apple Maps Deep Links**: https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html
- **Google Maps URLs**: https://developers.google.com/maps/documentation/urls
- **React Docs**: https://react.dev/
- **Vite Docs**: https://vitejs.dev/

---

## Contact & Support

For questions about the codebase:
1. Check `REDESIGN_SUMMARY.md` for feature overview
2. Check `VISUAL_GUIDE.md` for design system
3. Read inline code comments in source files
4. Inspect browser DevTools (React DevTools extension helpful)

---

**Last Updated:** 2026-02-23
**Version:** 1.0.0 (Post-Redesign)
