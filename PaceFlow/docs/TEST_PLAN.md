# PaceFlow - Comprehensive Test Plan

This document provides a complete testing guide for the PaceFlow running app.

## Test Environment

**Recommended:**
- Physical iOS device (iPhone 12 or newer)
- iOS 15.0 or higher
- macOS with Xcode 14+
- Node.js 18+
- Expo CLI

**Limitations:**
- HealthKit features require physical iOS device (won't work in simulator)
- Stripe payment testing requires test mode configuration

## Pre-Test Setup

### 1. Environment Variables

Create `.env` file in PaceFlow directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_test_publishable_key
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### 2. Supabase Setup

1. Run migrations:
   ```bash
   cd PaceFlow
   supabase db push
   ```

2. Deploy Edge Functions:
   ```bash
   supabase functions deploy generate-custom-guide
   ```

3. Set secrets:
   ```bash
   supabase secrets set ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

### 3. Start Development Server

```bash
cd PaceFlow
npm install
npm start
```

## Feature Testing

### 1. Authentication (Step 3)

#### Test 1.1: Google OAuth Login
**Steps:**
1. Launch app (fresh install)
2. Tap "Continue with Google"
3. Select Google account
4. Grant permissions

**Expected:**
- OAuth flow completes successfully
- User is redirected to Onboarding screen
- Session persists after app restart

**Pass Criteria:**
- ✅ Can log in with Google account
- ✅ Session stored in AsyncStorage
- ✅ No login required on app restart

#### Test 1.2: Onboarding Flow
**Steps:**
1. After login, complete onboarding:
   - Step 1: Select fitness level (Beginner/Intermediate/Advanced)
   - Step 2: Select goals (5K, 10K, Half Marathon, Marathon, Fitness)
   - Step 3: Enter experience, injuries, training days

**Expected:**
- All 3 steps complete smoothly
- Data saves to `user_profiles` table
- User navigates to Dashboard after completion

**Pass Criteria:**
- ✅ Can complete all onboarding steps
- ✅ User profile created in database
- ✅ Redirected to Dashboard

---

### 2. Dashboard & Analytics (Step 7)

#### Test 2.1: Empty State
**Steps:**
1. Log in as new user (no sessions)
2. View Dashboard

**Expected:**
- Empty state shows "Start Running Today!"
- "Log First Run" button visible
- No stats cards shown

**Pass Criteria:**
- ✅ Empty state displays correctly
- ✅ Button navigates to Add Session screen

#### Test 2.2: Dashboard with Data
**Steps:**
1. Log at least 5 running sessions
2. Return to Dashboard
3. Pull to refresh

**Expected:**
- Total distance, runs, time displayed
- Average pace calculated correctly
- This Week / This Month stats accurate
- Current streak calculated
- Recent activity list shows last 5 sessions

**Pass Criteria:**
- ✅ All stats display correct values
- ✅ Calculations are accurate
- ✅ Pull-to-refresh works

---

### 3. Standard Guides (Step 5)

#### Test 3.1: View Guides List
**Steps:**
1. Navigate to Guides tab
2. Scroll through guides

**Expected:**
- 5 standard guides visible:
  1. Couch to 5K
  2. 10K Training Plan
  3. Half Marathon Prep
  4. Marathon Training
  5. Speed & Interval Training
- Each shows category, duration, session count

**Pass Criteria:**
- ✅ All 5 guides load
- ✅ Category colors correct
- ✅ Icons display properly

#### Test 3.2: View Guide Details
**Steps:**
1. Tap any guide
2. Expand week 1
3. Scroll through all weeks

**Expected:**
- Guide title and description shown
- Weeks displayed as expandable accordion
- Each session shows: day, type, distance, duration, description
- Can expand/collapse weeks

**Pass Criteria:**
- ✅ All weeks present
- ✅ Session details complete
- ✅ Accordion works smoothly

---

### 4. Running Sessions (Step 6)

#### Test 4.1: Add Manual Session
**Steps:**
1. Navigate to Sessions tab
2. Tap + button
3. Fill in:
   - Date: Today
   - Distance: 5.5 km
   - Duration: 0:30:00
   - Heart Rate Avg: 145 bpm
   - Heart Rate Max: 165 bpm
   - Calories: 350
   - Notes: "Great morning run"
   - Completed: Yes
4. Tap Save

**Expected:**
- Success alert shown
- Returns to Sessions list
- New session appears at top
- Pace auto-calculated (~5:27 min/km)

**Pass Criteria:**
- ✅ Session saves successfully
- ✅ All fields stored correctly
- ✅ Pace calculated accurately

#### Test 4.2: Form Validation
**Steps:**
1. Try to save session with invalid data:
   - Distance: 0
   - Distance: 250 km
   - Duration: 0:00:00
   - Heart rate: 300 bpm
   - Calories: -100

**Expected:**
- Validation alerts appear for each invalid input
- Form does not submit until valid

**Pass Criteria:**
- ✅ Distance validation (0 < x < 200)
- ✅ Duration validation (> 0, < 24 hours)
- ✅ Heart rate validation (30-250 bpm)
- ✅ Avg HR ≤ Max HR check
- ✅ Calories validation (0-10000)

#### Test 4.3: View Session Details
**Steps:**
1. Tap any session from list
2. View details
3. Tap Delete

**Expected:**
- Session details screen shows all data
- Stats grid displays distance, duration, pace
- Health metrics shown if available
- Delete confirmation dialog appears
- Session removed after confirmation

**Pass Criteria:**
- ✅ All session data displays
- ✅ Delete confirmation works
- ✅ Session removed from list

---

### 5. AI Custom Guide Generation (Step 9)

#### Test 5.1: Create Custom Guide
**Steps:**
1. Navigate to Guides tab
2. Tap "Create AI-Powered Custom Guide"
3. Fill in:
   - Goal: 5K Race
   - Fitness: Beginner
   - Duration: 8 weeks
   - Days/week: 4
   - Injuries: No
4. Tap "Generate Custom Guide"
5. Wait for generation (~5-15 seconds)

**Expected:**
- Loading indicator shows
- "Generating..." message displays
- Success alert after generation
- Auto-navigates to guide detail screen
- Guide has 8 weeks × 4 days = 32 sessions
- Sessions have realistic distances/durations

**Pass Criteria:**
- ✅ Generation completes successfully
- ✅ Guide created with correct parameters
- ✅ AI-generated sessions make sense
- ✅ Guide saved to database

#### Test 5.2: Custom Guide with Injuries
**Steps:**
1. Create custom guide with:
   - Injuries: Yes
   - Details: "Knee pain, need low-impact plan"
2. Review generated sessions

**Expected:**
- AI accounts for injury in plan
- Includes recovery/rest days
- Lower intensity workouts
- Mentions modifications in descriptions

**Pass Criteria:**
- ✅ Injury considerations reflected in plan
- ✅ Plan is safe and progressive

**Note:** Requires valid ANTHROPIC_API_KEY

---

### 6. Stripe Subscription (Step 8)

#### Test 6.1: View Subscription Status
**Steps:**
1. Navigate to Profile tab
2. View subscription card

**Expected:**
- Subscription status displayed (Trial/Active/Cancelled/Expired)
- Days remaining shown for trial/active
- Manage subscription button visible

**Pass Criteria:**
- ✅ Status displays correctly
- ✅ Badge color matches status
- ✅ Days remaining accurate

#### Test 6.2: Subscription Flow (Manual)
**Prerequisites:** Stripe account configured (see STRIPE_SETUP.md)

**Steps:**
1. Tap "Subscribe Now" or "Manage Subscription"
2. Follow Stripe checkout flow
3. Use test card: 4242 4242 4242 4242

**Expected:**
- Stripe UI appears
- Test payment succeeds
- Subscription status updates

**Pass Criteria:**
- ✅ Checkout flow works
- ✅ Payment processing successful
- ✅ Status updates in app

**Note:** Requires Stripe configuration

---

### 7. Apple HealthKit Integration (Step 10)

**Prerequisites:** Physical iOS device with Apple Health data

#### Test 7.1: Request Authorization
**Steps:**
1. Navigate to Profile tab
2. Tap "Apple Health Sync"
3. Grant permissions in system dialog

**Expected:**
- iOS permission dialog appears
- After granting, status changes to "Connected"
- Green checkmark icon shown

**Pass Criteria:**
- ✅ Permission request works
- ✅ Authorization status updates
- ✅ UI reflects connected state

#### Test 7.2: Sync Workouts
**Prerequisites:** At least one running workout in Apple Health

**Steps:**
1. Ensure workouts exist in Apple Health app
2. Tap "Apple Health Sync" (while connected)
3. Wait for sync

**Expected:**
- Syncing indicator shows
- Success alert: "Successfully synced X workouts"
- Synced sessions appear in Sessions tab
- Sessions marked as "Synced from Apple Health"
- Data accurate: distance, duration, heart rate, calories

**Pass Criteria:**
- ✅ Workouts fetched from HealthKit
- ✅ Sessions created automatically
- ✅ Data matches Apple Health
- ✅ No duplicates on re-sync

#### Test 7.3: Android/Simulator Behavior
**Steps:**
1. Run app on Android or iOS simulator
2. Navigate to Profile

**Expected:**
- "Apple Health Sync" shows "Only available on iOS devices"
- Option is disabled

**Pass Criteria:**
- ✅ Feature gracefully hidden on non-iOS
- ✅ No errors or crashes

---

### 8. Error Handling & Polish (Step 11)

#### Test 8.1: Error Boundary
**Steps:**
1. Trigger a runtime error (if in dev mode)
2. Observe error screen

**Expected:**
- Error boundary catches error
- User-friendly error screen shows
- "Try Again" button visible
- Error details shown in dev mode

**Pass Criteria:**
- ✅ App doesn't crash completely
- ✅ User can recover with "Try Again"

#### Test 8.2: Network Errors
**Steps:**
1. Disable WiFi/cellular
2. Try to:
   - Log in
   - Fetch guides
   - Create session
3. Re-enable network
4. Retry

**Expected:**
- Error messages appear (not silent failures)
- User can retry after network restored

**Pass Criteria:**
- ✅ Errors handled gracefully
- ✅ User informed of network issues
- ✅ Retry functionality works

#### Test 8.3: Loading States
**Steps:**
1. Navigate through app quickly
2. Observe loading indicators

**Expected:**
- Loading spinners show during data fetching
- Smooth transitions between states
- No layout jumps

**Pass Criteria:**
- ✅ All loading states present
- ✅ Indicators clear and visible
- ✅ UX is smooth

---

## Performance Testing

### Test P.1: App Launch Time
**Steps:**
1. Force quit app
2. Launch app cold
3. Measure time to interactive

**Expected:**
- < 3 seconds to first screen
- < 5 seconds to interactive

**Pass Criteria:**
- ✅ Launch time acceptable
- ✅ No ANR (Application Not Responding)

### Test P.2: List Scrolling
**Steps:**
1. Create 50+ sessions
2. Scroll Sessions list rapidly
3. Observe performance

**Expected:**
- Smooth 60fps scrolling
- No lag or stuttering

**Pass Criteria:**
- ✅ Scrolling is smooth
- ✅ List items render quickly

### Test P.3: Memory Usage
**Steps:**
1. Navigate through all screens
2. Monitor memory usage

**Expected:**
- No memory leaks
- Memory usage < 150 MB

**Pass Criteria:**
- ✅ Memory stable
- ✅ No excessive consumption

---

## Regression Testing

After any code changes, re-run:

1. **Authentication Flow** (Test 1.1, 1.2)
2. **Add Session** (Test 4.1)
3. **View Dashboard** (Test 2.2)
4. **View Guide** (Test 3.2)
5. **TypeScript Compilation** (no errors)

---

## Test Summary Report

### Critical Tests (Must Pass)

- [ ] Google OAuth login
- [ ] Onboarding flow
- [ ] Add manual session
- [ ] View Dashboard with data
- [ ] View guide details
- [ ] Form validation
- [ ] TypeScript compilation

### Important Tests (Should Pass)

- [ ] AI custom guide generation
- [ ] HealthKit sync (iOS only)
- [ ] Subscription status display
- [ ] Error boundary
- [ ] Network error handling

### Optional Tests (Nice to Have)

- [ ] Stripe subscription flow (requires setup)
- [ ] Performance benchmarks
- [ ] Memory profiling

---

## Bug Reporting Template

When filing bugs, include:

```
**Title:** [Brief description]

**Steps to Reproduce:**
1.
2.
3.

**Expected Behavior:**


**Actual Behavior:**


**Environment:**
- Device:
- iOS version:
- App version:

**Screenshots:**
[Attach if applicable]

**Logs:**
[Paste console errors]
```

---

## Test Automation (Future)

Recommended tools for automated testing:

- **Unit Tests:** Jest
- **Component Tests:** React Native Testing Library
- **E2E Tests:** Detox
- **API Tests:** Supertest (for Supabase Edge Functions)

---

## Sign-Off

**Tested By:** ________________

**Date:** ________________

**Build Version:** ________________

**Test Results:** PASS / FAIL

**Notes:**


---

**Last Updated:** January 2025
