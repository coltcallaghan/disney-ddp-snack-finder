# Deployment Guide

## Overview
This app is automatically deployed to GitHub Pages and served via Cloudflare at **dohertyholiday.co.uk**.

## Deployment Process

### Automatic Deployment (GitHub Actions)
Every push to the `main` branch triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`):

1. **Build**: Compiles the React app with Vite
2. **Upload**: Creates a build artifact
3. **Deploy**: Pushes to GitHub Pages (gh-pages branch)

### DNS Configuration
- Domain: **dohertyholiday.co.uk**
- DNS Provider: **Cloudflare**
- DNS Record Type: **CNAME**
- Points to: `coltcallaghan.github.io`

### How It Works
1. Code is pushed to GitHub `main` branch
2. GitHub Actions automatically runs the build job
3. Built files in `dist/` are uploaded as artifacts
4. Artifacts are deployed to the `gh-pages` branch
5. GitHub Pages serves content from `gh-pages`
6. Cloudflare DNS points domain to GitHub Pages
7. Site is live at dohertyholiday.co.uk

## Base Path Configuration
- **vite.config.ts**: `base: '/'`
  - Correct for root domain deployment
  - Assets resolve to `/assets/...` at the domain root

## Troubleshooting

### 404 on Asset Files
If CSS or JS files return 404:
1. Check that the workflow ran successfully in GitHub Actions
2. Verify the `gh-pages` branch exists on GitHub
3. Check GitHub Pages settings point to `gh-pages` branch
4. Wait 1-2 minutes for DNS/cache to propagate

### How to Check Deployment Status
1. Go to: https://github.com/coltcallaghan/disney-ddp-snack-finder
2. Click **Actions** tab
3. Look for the latest workflow run
4. Should show ✅ green checkmark if successful

### Manual Redeploy
If workflow doesn't trigger automatically:
```bash
# Push an empty commit to trigger workflow
git commit --allow-empty -m "trigger deployment"
git push origin main
```

## Environment Variables
The app uses Supabase credentials stored as environment variables:
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase public API key

These are embedded in the built JS at build time, so they don't need to be set in GitHub Actions.

## Building Locally
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview built app
npm run preview
```

The built files in `dist/` are what get deployed to GitHub Pages.
