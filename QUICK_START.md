# Quick Start Guide - Disney DDP Snack Finder

## ⚡ Get Started in 60 Seconds

### 1. Start the Dev Server
```bash
npm run dev
```
Opens on `http://localhost:5174`

### 2. Allow Location Permission
- Tap "Allow" when browser asks for location
- Watch the status change from blue → green

### 3. Search for a Snack
- Type "cookie" or "DOLE Whip" in search bar
- See results filtered in real-time

### 4. Get Directions
- Tap "Get Directions" on any card
- Opens Apple Maps (iOS) or Google Maps (Android/web)

---

## 📋 Before First Deploy

- [ ] Build succeeds: `npm run build` ✓
- [ ] No console errors: `npm run dev` + open DevTools (F12)
- [ ] GPS works: Allow location permission, see green banner
- [ ] Search works: Type "snack", see results filter
- [ ] Directions work: Tap button, maps opens
- [ ] Responsive: Resize browser, layout adapts
- [ ] DDP toggle: Click button, content updates

---

## 🚀 Deploy in 3 Steps

### Option 1: Vercel (Easiest)
```bash
npm i -g vercel
vercel deploy
# Follow prompts, done!
```

### Option 2: Netlify
```bash
npm i -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

### Option 3: GitHub Pages
1. Push to GitHub
2. In repo settings → Pages
3. Set source to "GitHub Actions"
4. Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: { node-version: 18 }
      - run: npm install && npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with: { github_token: ${{ secrets.GITHUB_TOKEN }}, publish_dir: ./dist }
```

---

## 📱 Test on Mobile

### iPhone
1. Deploy to Vercel/Netlify (gets HTTPS)
2. Open URL in Safari
3. Tap "Add to Home Screen" for app-like experience

### Android
1. Deploy to Vercel/Netlify (gets HTTPS)
2. Open URL in Chrome
3. Tap menu → "Install app" for PWA install

---

## 🎯 Key Features to Test

| Feature | Test | Expected |
|---|---|---|
| GPS | Click allow | Green banner appears |
| Search | Type "cookie" | Results filter in real-time |
| DDP toggle | Click button | Gold badge appears/disappears |
| Directions | Tap button | Maps opens with directions |
| Responsive | Resize 375px | 1 column layout |
| Responsive | Resize 768px | 2 column layout |
| Responsive | Resize 1200px | 3 column layout |

---

## 📚 Documentation

| File | For |
|---|---|
| **README.md** | Overview & features |
| **REDESIGN_SUMMARY.md** | What's new & how to use |
| **VISUAL_GUIDE.md** | Design system details |
| **DEVELOPER_NOTES.md** | Code architecture & examples |
| **IMPLEMENTATION_COMPLETE.md** | Troubleshooting & technical notes |

---

## 🔧 Common Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview build locally
npm run preview

# Check for TypeScript errors
npx tsc --noEmit

# Check for linting errors
npm run lint
```

---

## ✅ Deployment Checklist

Before going live:

- [ ] Updated `package.json` homepage (if needed)
- [ ] `npm run build` completes with ✓
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Tested on real mobile device
- [ ] GPS permission works
- [ ] Directions open correct maps app
- [ ] Search filters work
- [ ] All 4 parks load (if data available)
- [ ] Page title is correct
- [ ] Favicon displays

---

## 🎉 You're Ready!

Your Disney DDP Snack Finder is production-ready.

**Next steps:**
1. Deploy using one of the methods above
2. Share the URL with friends
3. Use at Disney World to find free snacks!

---

## 💬 Need Help?

1. **Build issues**: Check `npm run build` output
2. **Feature questions**: Read `REDESIGN_SUMMARY.md`
3. **Design questions**: Check `VISUAL_GUIDE.md`
4. **Code questions**: See `DEVELOPER_NOTES.md`
5. **Troubleshooting**: See `IMPLEMENTATION_COMPLETE.md`

---

**Enjoy! 🏰✨**
