# Demo Mode - Quick Testing Guide

Test PaceFlow immediately without setting up external services!

## Quick Start (2 minutes)

### 1. Install Dependencies

```bash
cd /home/user/github/PaceFlow/PaceFlow
npm install
```

### 2. Verify Demo Mode is Enabled

The `.env` file is already configured for demo mode:

```bash
cat .env
```

Should show:
```
EXPO_PUBLIC_DEV_MODE=true
```

### 3. Start the App

```bash
npm start
```

Then choose one of these options:
- Press **`w`** - Open in web browser (fastest)
- Press **`i`** - Open in iOS Simulator
- Press **`a`** - Open in Android Emulator
- **Scan QR code** - Test on physical device with Expo Go app

## What Works in Demo Mode

✅ **Full UI/UX:**
- Navigate all screens
- Bottom tab navigation
- Smooth transitions
- All layouts and styling

✅ **Forms & Validation:**
- Add Session screen with full validation
- Form field interactions
- Error messages
- Success confirmations

✅ **Components:**
- Empty states
- Loading indicators
- Error boundary
- Animations (FadeInView)

✅ **Navigation:**
- Dashboard tab
- Guides tab
- Sessions tab
- Profile tab
- Nested navigation

✅ **Profile Screen:**
- Mock user: "Demo Runner"
- Subscription status: "Trial" (7 days remaining)
- Settings options

## What Doesn't Work (Expected)

❌ **Database Operations:**
- Can't view real guides (will show empty state)
- Can't save sessions (form works, but won't persist)
- Can't view dashboard stats (will show empty state)

❌ **External Services:**
- Google OAuth login (skipped in demo mode)
- Stripe payments
- AI guide generation (requires Claude API)
- HealthKit sync (requires physical iOS device + setup)

## Testing Checklist

### Basic Navigation (2 min)
- [ ] Open app (should skip login screen)
- [ ] Navigate to Dashboard - see "Demo Runner" greeting
- [ ] Tap Guides tab - see empty state with "Create AI-Powered Custom Guide" button
- [ ] Tap Sessions tab - see empty list with + button
- [ ] Tap Profile tab - see mock user profile

### Forms & Validation (5 min)
- [ ] Sessions tab → Tap + button
- [ ] Try invalid data:
  - Distance: 0 → See error
  - Distance: 300 → See error
  - Duration: 0:00:00 → See error
  - Heart rate: 999 → See error
- [ ] Fill valid data:
  - Distance: 5.5 km
  - Duration: 0:30:00
  - Heart rate: 145 bpm
- [ ] Tap Save → See success alert
- [ ] Note: Session won't appear in list (no database)

### Profile Screen (2 min)
- [ ] Profile tab → See "Demo Runner"
- [ ] Check subscription status: "TRIAL" badge
- [ ] See "7 days remaining"
- [ ] Check Settings options (won't navigate in demo)

### UI/UX Polish (3 min)
- [ ] Test pull-to-refresh on Dashboard
- [ ] Check loading states
- [ ] Verify smooth animations
- [ ] Test bottom tab switching

## Switching to Production Mode

When ready to test with real services:

1. **Update `.env`:**
   ```bash
   EXPO_PUBLIC_DEV_MODE=false

   # Add real credentials:
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_real_key
   # ... other services
   ```

2. **Restart the app:**
   ```bash
   npm start
   # Press 'r' to reload
   ```

3. **You'll now see the login screen**

## Troubleshooting

### Issue: App shows login screen instead of main app

**Solution:** Verify `.env` has `EXPO_PUBLIC_DEV_MODE=true`

```bash
# Check current value
grep DEV_MODE .env

# If missing or false, set it:
echo "EXPO_PUBLIC_DEV_MODE=true" >> .env
```

Then restart: `npm start`

### Issue: "Cannot find module" errors

**Solution:** Reinstall dependencies

```bash
rm -rf node_modules
npm install
npm start
```

### Issue: TypeScript errors in terminal

**Solution:** These are OK in demo mode. To verify:

```bash
npx tsc --noEmit
```

All checks should pass.

### Issue: Web version shows blank screen

**Solution:**
1. Open browser console (F12)
2. Look for errors
3. Common fix: Hard reload (Cmd+Shift+R or Ctrl+Shift+R)

### Issue: iOS Simulator won't open

**Solution:**
```bash
# Make sure Xcode is installed
xcode-select --install

# Or use web instead:
npm start
# Press 'w'
```

## Next Steps

### To Test with Real Data:

Follow the setup guides in `docs/`:

1. **Supabase Setup** (15 min)
   - Create account at supabase.com
   - Run migrations
   - Get URL and keys
   - See: `docs/STRIPE_SETUP.md` section on Supabase

2. **Full Testing** (1 hour)
   - Follow: `docs/TEST_PLAN.md`
   - Set up all services
   - Test all features

### To Deploy to Production:

- Follow: `docs/DEPLOYMENT_CHECKLIST.md`

## Demo Mode Features Summary

**Purpose:** Test UI, navigation, forms, and validation without external dependencies

**Duration:** 5-10 minutes for full walkthrough

**Best For:**
- First-time app exploration
- UI/UX review
- Navigation testing
- Form validation testing
- Quick demonstrations

**Not For:**
- Database functionality testing
- Authentication flow testing
- Payment processing testing
- HealthKit integration testing

---

**Questions?** Check `README.md` or create an issue on GitHub.

**Ready for full setup?** See `docs/TEST_PLAN.md` for comprehensive testing.
