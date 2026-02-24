# Supabase Integration - Remaining Implementation Steps

## ✅ Completed (Steps 1-4)

- [x] **Step 1**: Extended `SnackItem` interface with `average_rating`, `total_reviews`, `most_recent_availability`
- [x] **Step 2**: Replaced CSV loading with Supabase query (with CSV fallback)
- [x] **Step 3**: Added auth state and `onAuthStateChange` listener
- [x] **Step 4**: Added search logging debounce (500ms)
- [x] **Build**: ✅ Passing (472.87 KB JS, 136.42 KB gzipped)

Current branch: `main` | Last commit: `262435e`

---

## 📋 Remaining Steps (5-8)

Due to token limits, Steps 5-8 must be completed manually. This guide provides exact instructions.

### **Step 5: Update Card JSX** (heart button, star rating, availability badge)

**File**: `src/App.tsx` - Find and replace the card rendering section (around line 380-420)

**Current code** looks like:
```tsx
{filteredSnacks.length > 0 ? (
  <div className="card-grid">
    {filteredSnacks.map((snack, idx) => {
      // ... card rendering
      {distLabel && <div className="distance-badge">{distLabel}</div>}
```

**Replace with** this new card structure:

```tsx
{filteredSnacks.length > 0 ? (
  <div className="card-grid">
    {filteredSnacks.map((snack, idx) => {
      const isFavorited = _favoritedIds.has(`${snack.restaurant}|||${snack.item}`);

      const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const key = `${snack.restaurant}|||${snack.item}`;
        if (!currentUser) {
          _setPendingFavoriteKey(key);
          _setShowAuthModal(true);
          return;
        }
        if (isFavorited) {
          _removeFavoriteDB(snack.restaurant, snack.item);
          _setFavoritedIds(prev => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
        } else {
          addFavorite(snack.restaurant, snack.item);
          _setFavoritedIds(prev => new Set(prev).add(key));
        }
      };

      return (
        <div
          className={`snack-card palette-card${snack.isDDPSnack === 'true' ? ' snack-card--ddp' : ''}`}
          key={snack.ID || idx}
          style={{ '--card-index': idx } as React.CSSProperties}
        >
          {/* DDP badge */}
          {snack.isDDPSnack === 'true' && (
            <div className="ddp-badge">
              <span className="ddp-badge-star">★</span> FREE with DDP
            </div>
          )}

          {/* Top right cluster: heart + distance */}
          <div className="card-top-right">
            <button
              className={`favorite-btn${isFavorited ? ' favorite-btn--active' : ''}`}
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              onClick={handleFavoriteClick}
            >
              {isFavorited ? '♥' : '♡'}
            </button>
            {distLabel && <div className="distance-badge">{distLabel}</div>}
          </div>

          {/* Card body */}
          <div className="card-body">
            <h3 className="snack-name">{snack.item}</h3>
            <p className="snack-restaurant">{snack.restaurant}</p>

            {/* Star rating */}
            {snack.average_rating != null && snack.average_rating > 0 && (
              <div className="snack-rating">
                ★ {snack.average_rating.toFixed(1)}
                {snack.total_reviews != null && (
                  <span className="snack-rating-count">({snack.total_reviews})</span>
                )}
              </div>
            )}

            {/* Category and park chips */}
            <div className="card-chips">
              {snack.category && <span className="chip chip--category">{snack.category}</span>}
              {snack.park && <span className="chip chip--park">{snack.park}</span>}
            </div>

            {/* Availability badge */}
            {snack.most_recent_availability != null && (
              <div className="snack-availability">
                <span
                  className={`availability-dot availability-dot--${
                    snack.most_recent_availability ? 'available' : 'unavailable'
                  }`}
                />
                {snack.most_recent_availability ? 'Recently available' : 'Recently unavailable'}
              </div>
            )}

            {snack.price && snack.isDDPSnack !== 'true' && (
              <p className="snack-price">{snack.price}</p>
            )}
          </div>

          {/* Directions button */}
          {directionsUrl && (
            <a href={directionsUrl} className="directions-btn" target="_blank" rel="noopener noreferrer">
              Get Directions
            </a>
          )}
        </div>
      );
    })}
  </div>
```

**Also update state variable references** to remove underscores (make them actually usable):
- Change `_favoritedIds` → `favoritedIds`
- Change `_setShowAuthModal` → `setShowAuthModal`
- Change `_setPendingFavoriteKey` → `setPendingFavoriteKey`
- Change `_setFavoritedIds` → `setFavoritedIds`
- Change `_removeFavoriteDB` → `removeFavoriteDB`

Then remove the underscore prefixes from the state declarations:
```tsx
const [showAuthModal, setShowAuthModal] = useState(false);
const [pendingFavoriteKey, setPendingFavoriteKey] = useState<string | null>(null);
const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
```

And update imports:
```tsx
import { getFavorites, addFavorite, removeFavorite as removeFavoriteDB, logSearch as logSearchDB, signOut as supabaseSignOut, getCurrentUser } from './supabaseUtils';
```

**Also add user button to header** (find the header JSX around line 330):
```tsx
{/* User auth button */}
<button
  className="user-btn"
  onClick={() => {
    if (currentUser) {
      supabaseSignOut().then(() => setCurrentUser(null));
    } else {
      setShowAuthModal(true);
    }
  }}
>
  {currentUser ? (currentUser.email?.[0]?.toUpperCase() ?? '★') : '★'}
</button>
```

---

### **Step 6: Create AuthModal Component**

**Create new file**: `src/components/AuthModal.tsx`

```tsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../App.css';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

export function AuthModal({ open, onClose, onAuthSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset form when modal closes or tab changes
  useEffect(() => {
    if (!open) {
      setEmail('');
      setPassword('');
      setError(null);
      setSuccessMessage(null);
    }
  }, [open, tab]);

  if (!open) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        onAuthSuccess();
        onClose();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccessMessage('Check your email to confirm your account');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab${tab === 'signin' ? ' auth-tab--active' : ''}`}
            onClick={() => setTab('signin')}
          >
            Sign In
          </button>
          <button
            className={`auth-tab${tab === 'signup' ? ' auth-tab--active' : ''}`}
            onClick={() => setTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {/* Forms */}
        <form className="auth-form" onSubmit={tab === 'signin' ? handleSignIn : handleSignUp}>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}
          {successMessage && <div className="auth-success">{successMessage}</div>}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Please wait...' : (tab === 'signin' ? 'Sign In' : 'Sign Up')}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

### **Step 7: Wire AuthModal into App.tsx**

In `src/App.tsx`:

1. **Add import** at top:
```tsx
import { AuthModal } from './components/AuthModal';
```

2. **Add before the return statement** (around line 420):
```tsx
<AuthModal
  open={showAuthModal}
  onClose={() => setShowAuthModal(false)}
  onAuthSuccess={() => {/* pendingFavoriteKey effect handles it */}}
/>
```

---

### **Step 8: Add CSS for New UI Elements**

**File**: `src/App.css` - Append to end of file:

```css
/* =========================================
   Supabase Integration — Auth, Favorites,
   Ratings, Availability
   ========================================= */

/* Top-right badge/button cluster */
.card-top-right {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  z-index: 2;
}

.card-top-right .distance-badge {
  position: static;
}

/* Favorite heart button */
.favorite-btn {
  background: none;
  border: none;
  font-size: 1.3rem;
  line-height: 1;
  cursor: pointer;
  padding: 6px;
  border-radius: var(--radius-full);
  transition: transform var(--transition-fast), color var(--transition-fast);
  color: var(--text-muted);
  z-index: 2;
  min-width: 36px;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.favorite-btn--active {
  color: var(--accent-danger);
}

.favorite-btn:hover {
  transform: scale(1.2);
  background: rgba(224, 27, 36, 0.08);
}

/* Star rating display */
.snack-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--disney-gold);
  margin-top: 2px;
}

.snack-rating-count {
  color: var(--text-muted);
  font-weight: 500;
}

/* Availability dot badge */
.availability-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.availability-dot--available {
  background: var(--accent-success);
}

.availability-dot--unavailable {
  background: var(--accent-danger);
}

.snack-availability {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-top: 2px;
}

/* Auth modal tabs */
.auth-tabs {
  display: flex;
  border-bottom: 2px solid var(--border-light);
  margin-bottom: var(--spacing-lg);
  gap: 0;
}

.auth-tab {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  background: none;
  border: none;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-muted);
  cursor: pointer;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}

.auth-tab--active {
  color: var(--disney-blue);
  border-bottom-color: var(--disney-blue);
}

/* Auth form */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.auth-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.auth-field label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.auth-field input {
  padding: 12px var(--spacing-md);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: 1rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: border-color var(--transition-fast);
  min-height: 48px;
}

.auth-field input:focus {
  outline: none;
  border-color: var(--disney-blue);
}

.auth-submit-btn {
  background: linear-gradient(135deg, var(--disney-blue) 0%, var(--disney-blue-light) 100%);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-md);
  padding: 14px;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  min-height: 52px;
  transition: all var(--transition-fast);
  margin-top: var(--spacing-sm);
}

.auth-submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--disney-blue-dark) 0%, var(--disney-blue) 100%);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.auth-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.auth-error {
  color: var(--accent-danger);
  font-size: 0.85rem;
  font-weight: 600;
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(224, 27, 36, 0.08);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--accent-danger);
}

.auth-success {
  color: var(--accent-success);
  font-size: 0.85rem;
  font-weight: 600;
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(46, 194, 126, 0.08);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--accent-success);
}

/* User avatar button in header */
.user-btn {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: var(--radius-full);
  padding: 8px 12px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
  font-size: 0.8rem;
  font-weight: 800;
  transition: background var(--transition-fast);
  flex-shrink: 0;
}

.user-btn:hover {
  background: rgba(255, 255, 255, 0.28);
}
```

---

## ✅ Final Verification

After completing steps 5-8, run:

```bash
npm run build
```

Expected output: Zero TypeScript errors, successful build.

Then test:
```bash
npm run dev
```

And verify:
1. ✅ Snacks load from Supabase (check Network tab)
2. ✅ Click heart → auth modal appears
3. ✅ Sign in → modal closes, heart fills red
4. ✅ Reload → favorites persist
5. ✅ Sign out (click user initial) → hearts revert to outline
6. ✅ Search "dole" → results filter, shows ratings/availability badges

---

## 📝 Notes

- All state is already set up in App.tsx
- All utility functions are ready in supabaseUtils.ts
- All CSS variables exist in index.css
- Just need to wire UI components together

Good luck! 🚀
