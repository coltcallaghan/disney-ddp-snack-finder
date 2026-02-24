# Project Structure

This document describes the folder organization of the Disney DDP Snack Finder project.

## Directory Overview

```
disney-ddp-snack-finder/
├── docs/                      # Documentation
│   ├── README.md             # Main project README
│   ├── guides/               # User & developer guides
│   │   ├── QUICK_START.md    # Quick start guide
│   │   └── START_HERE.md     # Getting started
│   ├── setup/                # Setup & configuration
│   │   └── SUPABASE_SETUP.md # Supabase backend setup
│   └── reference/            # Reference documentation
│       └── SUPABASE_INTEGRATION_TODO.md
│
├── src/                       # Source code
│   ├── components/           # React components
│   │   ├── AuthModal.tsx    # Authentication modal
│   │   ├── InfoModal.tsx    # Info modal
│   │   └── ...              # Other components
│   ├── utils/               # Utility functions
│   │   ├── csvUtils.ts      # CSV parsing
│   │   ├── mapLinkUtils.ts  # Map integration
│   │   └── restaurantAliasUtils.ts
│   ├── services/            # External service integrations
│   │   ├── supabaseClient.ts    # Supabase client
│   │   └── supabaseUtils.ts     # Supabase functions
│   ├── types/               # TypeScript type definitions
│   │   ├── disneyFoodTypes.ts
│   │   └── papaparse.d.ts
│   ├── App.tsx              # Main app component
│   ├── App.css              # App styles
│   └── main.tsx             # App entry point
│
├── data/                      # Data files & resources
│   ├── locations/           # Location data
│   │   ├── restaurant_locations.json
│   │   └── restaurant_aliases.json
│   ├── migrations/          # Database migrations
│   │   └── MIGRATIONS.md
│   └── disney_restaurant_food_data.json
│
├── scripts/                   # Build & utility scripts
│   ├── seed_snacks.ts       # Database seeding script
│   └── verify_data.ts       # Data verification script
│
├── public/                    # Static assets
│   ├── data_aligned_with_ids.csv
│   └── Disney_wordmark.svg.png
│
├── archive/                   # Old/deprecated files
│   ├── DEVELOPER_NOTES.md
│   ├── IMPLEMENTATION_COMPLETE.md
│   ├── *.py, *.js, *.cjs    # Old scripts
│   └── ...
│
├── package.json             # Dependencies & scripts
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── .env.local              # Environment variables (local only)
```

## Key Folders

### `/docs`
All documentation files organized by purpose:
- **guides/**: User and developer guides
- **setup/**: Configuration and setup instructions
- **reference/**: API references and detailed documentation

### `/src`
Application source code following clean architecture:
- **components/**: Reusable React components
- **utils/**: Pure utility functions (no side effects)
- **services/**: External service clients (Supabase, etc.)
- **types/**: Shared TypeScript types

### `/data`
All data files and resources:
- **locations/**: Restaurant and location data
- **migrations/**: Database schema and migration files
- JSON data files for snacks and references

### `/scripts`
Build and utility scripts:
- Database seeding
- Data verification
- Other automation tasks

### `/archive`
Deprecated and old files kept for reference but not used in the current build.

## Important Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main application component |
| `src/App.css` | Global application styles |
| `src/services/supabaseClient.ts` | Supabase configuration & client |
| `data/locations/restaurant_aliases.json` | Restaurant name mappings |
| `data/locations/restaurant_locations.json` | GPS coordinates for restaurants |
| `scripts/seed_snacks.ts` | Database seeding script |
| `package.json` | Dependencies and npm scripts |

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Type check
npx tsc -b

# Seed database
npm run seed:snacks
```

## Naming Conventions

- **Components**: PascalCase (e.g., `AuthModal.tsx`)
- **Utils/Services**: camelCase (e.g., `csvUtils.ts`)
- **Types**: PascalCase interfaces (e.g., `SnackItem`)
- **Folders**: lowercase (e.g., `/components`, `/utils`)

## Import Paths

Use relative imports from the root `src/` folder:
```typescript
// ✅ Correct
import { csvUtils } from '../utils/csvUtils'
import { supabase } from '../services/supabaseClient'

// ❌ Avoid
import { csvUtils } from './utils/csvUtils'
```

## When to Move Files

- **Add new component?** → `src/components/`
- **Add new utility?** → `src/utils/`
- **Add new service?** → `src/services/`
- **Add new type?** → `src/types/`
- **Old/unused code?** → `archive/`
- **Documentation?** → `docs/` (guides/ setup/ or reference/)
