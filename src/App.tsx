import { useState, useMemo, useEffect, useCallback } from 'react'
import { InfoModal } from './components/InfoModal';
import './App.css'

import restaurantLocationsRaw from '../restaurant_locations.json';
import aliasesDataRaw from '../restaurant_aliases.json';
import { getCanonicalLocationName } from './restaurantAliasUtils';
import { getDirectionsUrl } from './mapLinkUtils';
import { parseCSV } from './csvUtils';
import type { SnackItem } from './csvUtils';


function getUnique(arr: string[]): string[] {
  return Array.from(new Set(arr)).sort();
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (x: number) => x * Math.PI / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

type GeoStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';
const DISNEY_WORLD_CENTER = { lat: 28.37062494668054, lng: -81.51939009164909 };

function App() {
  // GPS state
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>(DISNEY_WORLD_CENTER);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLand, setSelectedLand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPark, setSelectedPark] = useState('');
  const [selectedDiningPlan, setSelectedDiningPlan] = useState('Included'); // Default to DDP-only
  const [snacks, setSnacks] = useState<SnackItem[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Request device GPS location on mount
  const requestGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus('unavailable');
      return;
    }
    setGeoStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(loc);
        setGeoStatus('granted');
      },
      () => {
        // User denied or error — fall back to Disney World center
        setGeoStatus('denied');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  useEffect(() => {
    requestGPS();
  }, [requestGPS]);

  // Load data immediately on mount
  const loadData = () => {
    fetch('/data_aligned_with_ids.csv')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch data.csv');
        return res.text();
      })
      .then(text => {
        const parsed = parseCSV(text);
        const normalized = parsed.map((row: any) => {
          let restaurant = row.RESTAURANT || row.restaurant || '';
          let item = row.ITEM || row.item || '';
          if (!restaurant && item && /Aloha Isle|Snacks|Egg Roll Wagon|Canteen|Terrace|Trolley|Market|Refreshment|Stand|Bakery|Cafe|Bar|Grill|Diner|Dock|Inn|Cantina|House|Lounge|Pub|Truck|Cart|Kiosk|Corner|Plaza|Pavilion|Palace|Bites|Beverages|Cones|Treats|Sweets|Churros|Popcorn|Ice Cream|Pizza|Sandwich|Saloon|Sundaes|Waffles|Wings|Wurst|Wok|Wok/i.test(item)) {
            restaurant = item;
            item = '';
          }
          return {
            ID: row.ID || row.id || row.Id || '',
            item,
            restaurant,
            category: row.CATEGORY || row.category || '',
            diningPlan: row['DINING PLAN'] || row.diningPlan || row.diningplan || '',
            location: row.LOCATION || row.location || '',
            park: (row['DISNEY PARK'] || row.DISNEY_PARK || row.PARK || row.park ||
              (['Magic Kingdom','EPCOT','Animal Kingdom','Hollywood Studios','Typhoon Lagoon','Blizzard Beach'].includes(row.LOCATION) ? row.LOCATION : '')
            ),
            description: row.DESCRIPTION || row.description || '',
            price: row.PRICE || row.price || '',
            isDDPSnack: row.IS_DDP_SNACK || row.isDDPSnack || '',
          };
        });
        setSnacks(normalized);
        setDataLoaded(true);
      })
      .catch(err => {
        console.error('Error loading data.csv:', err);
        setSnacks([]);
      });
  };

  // Load data on mount
  useEffect(() => {
    if (!dataLoaded) loadData();
  }, [dataLoaded]);

  // Only show non-empty, non-null, non-undefined filter values
  const availableCategories = useMemo(() => getUnique(snacks.map(s => s.category).filter(Boolean)), [snacks]);
  const availableParks = useMemo(() => getUnique(snacks.map(s => s.park).filter(Boolean)), [snacks]);
  // Dining plan filter now a checkbox, so no need for availableDiningPlans

  // Preprocess and index aliases and locations for fast lookup
  const aliases: Record<string, string[]> = useMemo(() => aliasesDataRaw as Record<string, string[]>, []);
  const locationMap: Record<string, { lat: number; lng: number }> = useMemo(() => {
    const map: Record<string, { lat: number; lng: number }> = {};
    for (const loc of restaurantLocationsRaw) {
      map[normalizeName(loc.name)] = { lat: loc.lat, lng: loc.lng };
    }
    return map;
  }, []);

  const filteredSnacks = useMemo(() => {
    // Filter first
    const filtered = snacks.filter(s => {
      if (!s) return false;
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

    // Attach lat/lng and distance if available
    const withLoc: { snack: SnackItem, dist: number }[] = [];
    const withoutLoc: SnackItem[] = [];
    for (const snack of filtered) {
      let canonicalName = getCanonicalLocationName(snack.restaurant);
      let allAliases: string[] = [];
      if (canonicalName && aliases[canonicalName]) {
        allAliases = [canonicalName, ...aliases[canonicalName]];
      } else if (snack.restaurant) {
        allAliases = [snack.restaurant];
      }
      let lat: number | undefined = undefined, lng: number | undefined = undefined;
      for (const alias of allAliases) {
        const loc = locationMap[normalizeName(alias)];
        if (loc) {
          lat = loc.lat;
          lng = loc.lng;
          break;
        }
      }
      if (typeof lat === 'number' && typeof lng === 'number') {
        const dist = haversineDistance(userLocation.lat, userLocation.lng, lat, lng);
        withLoc.push({ snack, dist });
      } else {
        withoutLoc.push(snack);
      }
    }
    // Sort with location by distance
    withLoc.sort((a, b) => a.dist - b.dist);
    // Sort without location alphabetically by item name
    withoutLoc.sort((a, b) => (a.item || '').localeCompare(b.item || ''));
    // Return combined
    return [
      ...withLoc.map(w => w.snack),
      ...withoutLoc
    ];
  }, [snacks, selectedLand, selectedCategory, selectedPark, selectedDiningPlan, searchQuery, userLocation, aliases, locationMap]);

  // Attach lat/lng to each snack if available
  function normalizeName(name: string) {
    return (name || '')
      .replace(/[^a-zA-Z0-9 ]/g, '') // remove punctuation
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }



  // getUserLocation removed (not used)



  // Compute nearest snack (if user location and restaurant coords available)


  // Sort by distance if available


  return (
    <div className="app">
      {/* ---- STICKY HEADER ---- */}
      <header className="header palette-header">
        <div className="header-inner">
          <img src="/Disney_wordmark.svg.png" alt="Disney" className="disney-logo" />
          <span className="header-title">DDP Snack Finder</span>
          <button
            className="info-btn"
            aria-label="About DDP"
            onClick={() => setShowInfo(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
          </button>
        </div>
      </header>

      <InfoModal open={showInfo} onClose={() => setShowInfo(false)} />

      {/* ---- HERO SEARCH BAR ---- */}
      <div className="search-hero">
        <div className="search-hero-inner">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            className="search-hero-input"
            type="search"
            placeholder='Search snacks... (e.g. cookie, DOLE Whip)'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* ---- GPS STATUS BANNER ---- */}
      {geoStatus === 'requesting' && (
        <div className="gps-banner gps-banner--loading">
          <span className="gps-dot gps-dot--pulse" /> Locating you...
        </div>
      )}
      {geoStatus === 'denied' && (
        <div className="gps-banner gps-banner--denied">
          Location unavailable — drag the pin on map to set position.
          <button className="gps-retry-btn" onClick={requestGPS}>Try again</button>
        </div>
      )}
      {geoStatus === 'granted' && (
        <div className="gps-banner gps-banner--granted">
          <span className="gps-dot gps-dot--green" /> Using your current location
        </div>
      )}

      {/* ---- COMPACT FILTER ROW ---- */}
      <div className="compact-filters">
        <button
          className={`ddp-pill ${selectedDiningPlan === 'Included' ? 'ddp-pill--active' : ''}`}
          onClick={() => setSelectedDiningPlan(s => s === 'Included' ? '' : 'Included')}
        >
          ★ FREE with DDP
        </button>

        <select
          className="compact-select"
          value={selectedPark}
          onChange={e => setSelectedPark(e.target.value)}
          aria-label="Filter by park"
        >
          <option value="">All Parks</option>
          {availableParks.filter(Boolean).map((park, idx) => (
            <option key={park || idx} value={park}>{park}</option>
          ))}
        </select>

        <select
          className="compact-select"
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All Types</option>
          {availableCategories.filter(Boolean).map((cat, idx) => (
            <option key={cat || idx} value={cat}>{cat}</option>
          ))}
        </select>

        {(searchQuery || selectedPark || selectedCategory || selectedDiningPlan !== 'Included') && (
          <button
            className="clear-filters-btn"
            onClick={() => {
              setSearchQuery('');
              setSelectedPark('');
              setSelectedCategory('');
              setSelectedDiningPlan('Included');
              setSelectedLand('');
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* ---- RESULTS ---- */}
      <main className="content">
        <div className="results-count">
          {dataLoaded
            ? `${filteredSnacks.length} snack${filteredSnacks.length !== 1 ? 's' : ''} found`
            : 'Loading snacks...'}
        </div>

        {!dataLoaded ? (
          <div className="locations-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="location-card skeleton-card" aria-hidden="true">
                <div className="skeleton-line skeleton-line--title" />
                <div className="skeleton-line skeleton-line--subtitle" />
                <div className="skeleton-line skeleton-line--body" />
              </div>
            ))}
          </div>
        ) : filteredSnacks.length > 0 ? (
          <div className="locations-grid">
            {filteredSnacks.map((snack, idx) => {
              let canonicalName = getCanonicalLocationName(snack.restaurant);
              let allAliases: string[] = [];
              if (canonicalName && aliases[canonicalName]) {
                allAliases = [canonicalName, ...aliases[canonicalName]];
              } else if (snack.restaurant) {
                allAliases = [snack.restaurant];
              }
              let lat: number | undefined = undefined, lng: number | undefined = undefined;
              for (const alias of allAliases) {
                const loc = locationMap[normalizeName(alias)];
                if (loc) {
                  lat = loc.lat;
                  lng = loc.lng;
                  break;
                }
              }

              const dist = (typeof lat === 'number' && typeof lng === 'number')
                ? haversineDistance(userLocation.lat, userLocation.lng, lat, lng)
                : null;

              const distLabel = dist !== null
                ? dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`
                : null;

              const directionsUrl = (typeof lat === 'number' && typeof lng === 'number')
                ? getDirectionsUrl(lat, lng, userLocation.lat, userLocation.lng)
                : null;

              return (
                <div
                  className={`snack-card palette-card${snack.isDDPSnack === 'true' ? ' snack-card--ddp' : ''}`}
                  key={snack.ID || idx}
                  style={{ '--card-index': idx } as React.CSSProperties}
                >
                  {/* DDP BADGE — top-left, visually dominant */}
                  {snack.isDDPSnack === 'true' && (
                    <div className="ddp-badge" aria-label="Free with Disney Dining Plan">
                      <span className="ddp-badge-star">★</span> FREE with DDP
                    </div>
                  )}

                  {/* DISTANCE BADGE — top-right */}
                  {distLabel && (
                    <div className="distance-badge">{distLabel}</div>
                  )}

                  {/* CARD BODY */}
                  <div className="card-body">
                    <h3 className="snack-name">{snack.item}</h3>
                    <p className="snack-restaurant">{snack.restaurant}</p>

                    <div className="card-chips">
                      {snack.category && (
                        <span className="chip chip--category">{snack.category}</span>
                      )}
                      {snack.park && (
                        <span className="chip chip--park">{snack.park}</span>
                      )}
                    </div>

                    {snack.price && snack.isDDPSnack !== 'true' && (
                      <p className="snack-price">{snack.price}</p>
                    )}
                  </div>

                  {/* DIRECTIONS BUTTON */}
                  {directionsUrl && (
                    <a
                      href={directionsUrl}
                      className="directions-btn"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                    >
                      Get Directions
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-results">
            <p>No snacks found. Try adjusting your filters.</p>
            <button onClick={() => {
              setSearchQuery('');
              setSelectedPark('');
              setSelectedCategory('');
              setSelectedDiningPlan('Included');
            }}>
              Reset Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App
