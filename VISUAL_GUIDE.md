# Disney DDP Snack Finder - Visual Design Guide

## Layout Structure

```
┌─────────────────────────────────────────┐
│  🏰 DDP Snack Finder              ⓘ    │  ← Sticky Header (compact)
├─────────────────────────────────────────┤
│  [🔍 Search snacks... (e.g. cookie) ✕] │  ← Hero Search Bar (gradient bg)
├─────────────────────────────────────────┤
│ [★ FREE with DDP] [All Parks ▼] [All Types ▼] [Clear]  ← Compact Filters
├─────────────────────────────────────────┤
│ 🟢 Using your current location          │  ← GPS Status (conditional)
├─────────────────────────────────────────┤
│ 4 snacks found                          │  ← Results Count
├─────────────────────────────────────────┤
│ ┌──────────┐  ┌──────────┐              │
│ │ 📍 2.5km │  │ 📍 3.1km │  ← Card Grid
│ │          │  │          │     (1 col mobile,
│ │★FREE     │  │★FREE     │      2 col tablet,
│ │DOLE Whip │  │Cookie    │      3 col desktop,
│ │          │  │          │      4 col lg)
│ │Aloha Isle│  │Gaston's  │
│ │          │  │          │
│ │[Get Dir] │  │[Get Dir] │
│ └──────────┘  └──────────┘
│ ┌──────────┐  ┌──────────┐
│ │ 📍 3.8km │  │ 📍 4.2km │
│ └──────────┘  └──────────┘
│
│ (Cards animate in with stagger: 0ms, 50ms, 100ms, 150ms...)
└─────────────────────────────────────────┘
```

---

## Color Palette

### Brand Colors
| Use | Color | Hex |
|---|---|---|
| Primary action | Disney Blue | `#1a5fb4` |
| Hover state | Light Blue | `#3584e4` |
| Active state | Dark Blue | `#0d3b7a` |
| DDP badge | Gold Gradient | `#b8860b → #e5a50a → #f5d547` |
| Distance badge | Forest Green | `#1a8a44` |
| Accent text | Disney Purple | `#613583` |

### Background Colors
| Use | Color | Hex |
|---|---|---|
| Page background | Light Blue | `#f8faff` |
| Cards | White | `#ffffff` |
| Input fields | White | `#ffffff` |

### Text Colors
| Use | Color | Hex |
|---|---|---|
| Main text | Dark Gray | `#1e1e2e` |
| Secondary text | Muted Gray | `#4a4a6a` |
| Muted text | Light Gray | `#8b8ba7` |
| Inverse (on dark) | White | `#ffffff` |

---

## Component States

### Header
```
┌───────────────────────────────────────┐
│ 🏰 DDP Snack Finder              ⓘ   │  ← Always sticky, z-index: 100
│ ✦  ✦  ✦                               │  ← Subtle sparkles at bottom
└───────────────────────────────────────┘
```

**Styles:**
- Background: Blue gradient (`dark → medium → light`)
- Padding: 10px horizontal, 14px vertical (expandable at tablet+)
- Font: 1.1rem bold white
- Logo: 32px height (grows to 40px on tablet, 48px on desktop)
- Info button: 40×40px tap target with semi-transparent white background

---

### Search Hero
```
┌───────────────────────────────────────┐
│ 🔍  [Search snacks...] ✕              │  ← Pill shape, large shadow
└───────────────────────────────────────┘
```

**Styles:**
- Background: Blue gradient (dark → medium)
- Shape: `border-radius: 32px` (pill)
- Min-height: 52px (comfortable tap target)
- Shadow: Large (0 4px 20px with 20% opacity)
- Icon: Magnifier emoji (🔍)
- Clear button: × (X mark), 44×44px tap target, appears only when text entered

---

### GPS Status Banner

**Requesting (blue):**
```
┌───────────────────────────────────────┐
│ 🔵 Locating you...                    │  ← Pulse animation
└───────────────────────────────────────┘
```

**Granted (green):**
```
┌───────────────────────────────────────┐
│ 🟢 Using your current location        │
└───────────────────────────────────────┘
```

**Denied (amber):**
```
┌───────────────────────────────────────┐
│ Location unavailable — drag the pin.  │
│                          [Try again]  │  ← Button on right
└───────────────────────────────────────┘
```

**Styles:**
- Thin banner: 8px vertical padding
- Color-coded background (blue, green, amber)
- Pulsing dot animation on "requesting" state
- Font: 0.85rem, weight 600
- Retry button: Small bordered pill

---

### Compact Filter Row
```
┌──────────────────────────────────────────────┐
│ [★FREE][All Parks ▼][All Types ▼][Clear]   │
└──────────────────────────────────────────────┘
 ↕ Horizontal scroll on mobile
```

**DDP Pill Toggle:**
- **Inactive**: Gold border, gold text, transparent background
- **Active**: Gold gradient background, dark text, glowing shadow
- Min-height: 40px
- Font: 0.8rem, weight 800, uppercase

**Filter Selects:**
- `border-radius: 32px` (pill shape)
- 40px min-height
- Blue focus state with light shadow
- Custom dropdown arrow (SVG)

**Clear Button:**
- Appears only when non-default filters are active
- Subtle gray background, turns blue on hover

---

### Snack Card

```
┌─────────────────────────────────────┐
│ 📍 2.5 km              ← Distance   │
│ ★ FREE with DDP        ← DDP Badge  │
│ Pineapple DOLE Whip    ← Item name  │
│ Aloha Isle - Snacks    ← Restaurant │
│ [Snack] [Magic Kingdom]← Chips      │
│ $7.49                  ← Price      │
│                                     │
│ [GET DIRECTIONS]       ← Button     │
└─────────────────────────────────────┘
 │ ← Left border (4px gold, DDP items only)
```

**Entrance Animation:**
```
Initial:  opacity: 0, translateY(12px)
Final:    opacity: 1, translateY(0)
Timing:   320ms ease
Delay:    Index × 50ms (capped at 20 items = 1000ms max)
```

**Hover State:**
- Elevates 3px up (`translateY(-3px)`)
- Shadow darkens and glows blue

**Active State (on click):**
- Scales to 98% (`scale(0.98)`)
- Resets elevation

**Styles:**
- Border radius: 16px
- Shadow: Medium (0 4px 12px with 8% opacity)
- Padding: 1rem
- Gap between elements: 0.5rem
- Card body: Flex column, gap 0.25rem

**Badge Styles:**

*DDP Badge:*
- Background: Gold gradient (`#b8860b → #e5a50a → #f5d547`)
- Color: Dark brown (`#3d2200`)
- Font: 0.72rem, weight 900, uppercase, letter-spaced
- Shadow: Glow effect (0 2px 8px gold with 50% opacity)
- Star: Glowing white star (`★`) with text-shadow

*Distance Badge:*
- Position: Absolute, top-right corner
- Background: Forest green (`#1a8a44`)
- Color: White
- Font: 0.72rem, weight 800
- Examples: "2.5 km", "450 m"

**Text Hierarchy:**
- Item name: 1rem, weight 800, color primary (leaves right padding for distance badge)
- Restaurant: 0.85rem, weight 600, Disney blue
- Category chip: 0.7rem, light blue background
- Park chip: 0.7rem, light purple background
- Price: 0.85rem, muted gray (hidden if DDP snack)

**Directions Button:**
- Full-width, blue gradient
- Min-height: 48px (large tap target)
- Weight: 800, uppercase, letter-spaced
- Margin-top: auto (pins to bottom)
- Hover: Darker gradient, lifted 1px
- Active: Scaled 98%

---

### Skeleton Loading State

```
┌─────────────────────────────────────┐
│ ▒▒▒▒▒▒▒▒▒▒▒▒                        │
│ ▒▒▒▒▒▒▒▒                            │
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒           │
│                                     │
│ ▒▒▒▒▒▒▒▒▒▒▒▒                        │  ← 4 skeleton cards
│ ▒▒▒▒▒▒▒▒                            │     with shimmer
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒           │     animation
└─────────────────────────────────────┘
```

**Shimmer Animation:**
- Gradient: 25% base, 50% shine, 75% base
- Movement: Background-position shifts left-to-right
- Duration: 1.4s infinite ease-in-out

---

### Modal (Info)

```
┌─────────────────────────────────────┐
│ ✕ DDP Info                          │  ← Close button (rotates on hover)
│ ┌─────────────────────────────────┐ │
│ │ What is Disney Dining Plan?     │ │
│ │                                 │ │
│ │ • Table Service Credit          │ │
│ │ • Quick Service Credit          │ │
│ │ • Snack Credit ← You are here   │ │
│ │                                 │ │
│ │ [Links to AllEars.net]          │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
  ↑ Semi-transparent dark backdrop
```

**Styles:**
- Backdrop: 60% opacity black, blurred
- Content: Max 500px width, centered
- Border radius: 24px
- Padding: 2rem
- Animation: Fade-in + slide-up (300ms)
- Close button: 36px, rotates 90° on hover

---

## Typography

| Element | Font | Size | Weight | Style |
|---|---|---|---|---|
| Header title | Nunito | 1.1rem | 800 | Uppercase letter-spaced |
| Card name | Nunito | 1rem | 800 | Bold |
| Restaurant | Nunito | 0.85rem | 600 | Colored blue |
| Badge | Nunito | 0.72rem | 900 | Uppercase, spaced |
| Body text | Nunito | 0.85-0.95rem | 500-600 | Regular |
| Muted text | Nunito | 0.8rem | 500 | Secondary color |

**Font:** Google Fonts "Nunito" (weights 400-800) with system font fallback

---

## Spacing System

| Token | Value | Use |
|---|---|---|
| `--spacing-xs` | 0.25rem (4px) | Tiny gaps |
| `--spacing-sm` | 0.5rem (8px) | Small gaps, padding |
| `--spacing-md` | 1rem (16px) | Default padding, gaps |
| `--spacing-lg` | 1.5rem (24px) | Large padding, section gaps |
| `--spacing-xl` | 2rem (32px) | Extra large spacing |
| `--spacing-2xl` | 3rem (48px) | Section gaps, modal padding |

---

## Border Radius System

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 8px | Skeleton lines |
| `--radius-md` | 12px | Buttons, inputs |
| `--radius-lg` | 16px | Cards |
| `--radius-xl` | 24px | Modals |
| `--radius-full` | 9999px | Pills, badges, full-round buttons |

---

## Shadows

| Token | Value | Use |
|---|---|---|
| `--shadow-sm` | 0 1px 2px rgba(0,0,0,5%) | Subtle buttons |
| `--shadow-md` | 0 4px 12px rgba(0,0,0,8%) | Cards, badges |
| `--shadow-lg` | 0 8px 24px rgba(0,0,0,12%) | Modals, hovers |
| `--shadow-glow` | 0 0 20px rgba(26,95,180,25%) | Blue glow on card hover |

---

## Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Mobile (default) | < 600px | 1 column grid, vertical filter sections |
| Tablet | 600px+ | 2 column grid, horizontal filter bar |
| Desktop | 900px+ | 3 column grid, expanded spacing |
| Large desktop | 1200px+ | 4 column grid |

---

## Animations

### Card Entrance
```
Keyframe: @keyframes cardEnter {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
Duration: 320ms
Timing: ease
Delay: Index × 50ms (capped at 20)
```

### GPS Pulse
```
Keyframe: @keyframes gpsPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.4); }
}
Duration: 1s
Timing: ease-in-out
Repeat: infinite
```

### Shimmer
```
Keyframe: @keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
Duration: 1.4s
Timing: ease-in-out
Repeat: infinite
```

### Modal Slide-Up
```
Keyframe: @keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
Duration: 300ms
Timing: ease
```

---

## Accessibility

- All buttons have 44×44px minimum tap targets
- Color not sole indicator (distance badge has text + color)
- Contrast ratios exceed WCAG AA
- Semantic HTML with ARIA labels
- Keyboard navigation supported
- Focus states clearly visible (blue outline)
- Safe area insets for notched phones

---

## Mobile Considerations

- ✅ Touch-friendly tap targets (44px minimum)
- ✅ Horizontal scrolling filters (no horizontal scroll trap)
- ✅ Viewport meta tag set
- ✅ Safe area support for iPhone notch/dynamic island
- ✅ -webkit-tap-highlight-color: transparent (custom focus)
- ✅ Font-smoothing optimized

---

## Disney Theme Elements

- 🏰 **Castle logo** in header (Disney wordmark)
- ⭐ **Sparkles** (`✦  ✦  ✦`) decorative accent
- 💫 **Gold gradient** DDP badge with glowing star
- 🎨 **Blue palette** inspired by Disney brand
- ✨ **Magical animations** (stagger, glow, pulse)
- 🎭 **Playful emoji** icons (🔍, 🟢, 📍, ★)
- 📱 **Mobile-native** interactions (smooth scrolls, haptic-ready)

