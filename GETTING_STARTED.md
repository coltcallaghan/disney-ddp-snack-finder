# Getting Started with Disney DDP Snack Finder

## 📋 First Time? Read These in Order

1. **[docs/README.md](docs/README.md)** - Project overview and features
2. **[docs/guides/QUICK_START.md](docs/guides/QUICK_START.md)** - Installation and running locally
3. **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - How the code is organized

## 🚀 Quick Start (TL;DR)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

## 📂 For Developers

### Understanding the Code

```
src/
├── App.tsx              # Main app (all features here for now)
├── components/          # Reusable React components
├── utils/              # Helper functions (CSV, maps, aliases)
├── services/           # Supabase client and functions
└── types/              # TypeScript interfaces
```

### Key Features

- **Pagination**: 20/100/250/500 snacks per page
- **Dependent Filtering**: Category dropdowns update based on park selection
- **Authentication**: Sign in/sign up with email
- **Favorites**: Heart button to save favorite snacks
- **Ratings**: Show average ratings if available
- **Search**: Real-time search with debounce logging
- **GPS**: Auto-detect location and show nearest snacks

### Common Development Tasks

**Run the app**
```bash
npm run dev
```

**Build for production**
```bash
npm run build
```

**Type check**
```bash
npx tsc -b
```

**Seed database**
```bash
npm run seed:snacks
```

## 🔧 Configuration

### Environment Variables (.env.local)

Required for Supabase:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get these from your Supabase project settings.

### Database Setup

See [docs/setup/SUPABASE_SETUP.md](docs/setup/SUPABASE_SETUP.md) for:
- Creating Supabase account
- Setting up database schema
- Configuring authentication

## 📚 Documentation

- **[docs/README.md](docs/README.md)** - Full project documentation
- **[docs/guides/](docs/guides/)** - User and developer guides
- **[docs/setup/](docs/setup/)** - Setup instructions
- **[docs/reference/](docs/reference/)** - Detailed API documentation
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Code organization guide

## 🎨 Customization

### Styling
- Global styles: `src/App.css`
- CSS variables defined in `index.css`
- Disney theme colors already configured

### Data
- Snacks data: `data/disney_restaurant_food_data.json`
- Restaurant locations: `data/locations/restaurant_locations.json`
- Restaurant aliases: `data/locations/restaurant_aliases.json`

## 🚢 Deployment

### Deploy to Vercel (Recommended)

```bash
# 1. Push to GitHub (already done)
git push origin main

# 2. Connect to Vercel at https://vercel.com
# 3. Add environment variables
# 4. Deploy automatically on push
```

### Deploy to Other Platforms

The built files are in `dist/` after `npm run build`. Can be deployed to:
- Netlify
- GitHub Pages
- Any static hosting

## 🐛 Troubleshooting

**Build errors?**
```bash
# Clear cache and rebuild
rm -rf dist/ node_modules/.vite
npm run build
```

**TypeScript errors?**
```bash
# Type check
npx tsc -b
```

**Supabase not loading snacks?**
- Check `.env.local` has correct credentials
- Verify snacks table exists: `npm run seed:snacks`
- Check browser console for errors

## 📈 Performance

- Build size: ~478 KB JS (138 KB gzipped)
- Load time: < 1 second
- Pagination: Loads 20-500 snacks per page
- GPS detection: Auto-updates as you move

## 🎯 Next Features to Consider

- Real-time availability updates
- Mobile app wrapper (React Native)
- Dark mode theme
- Export favorites to PDF
- Share snack lists with friends
- Widget for wait times

## 📞 Need Help?

1. Check [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for code organization
2. Look at [docs/reference/](docs/reference/) for detailed docs
3. Check browser console for errors
4. Verify `.env.local` configuration

## ✨ You're Ready!

The app is fully functional and production-ready. Start by running:

```bash
npm run dev
```

Then explore the code in `src/App.tsx` - everything is well-organized and documented!
