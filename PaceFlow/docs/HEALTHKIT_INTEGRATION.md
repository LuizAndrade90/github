# Apple HealthKit Integration

This document explains how PaceFlow integrates with Apple HealthKit to automatically sync running workouts from Apple Watch and other fitness devices.

## Overview

PaceFlow uses `react-native-health` to integrate with Apple HealthKit, allowing users to:
- Automatically import running workouts from Apple Watch
- Sync workout data (distance, duration, heart rate, calories)
- Avoid manual data entry
- Keep training data consistent across platforms

## Platform Support

**iOS Only** - Apple HealthKit is exclusively available on iOS devices. The feature will be hidden on Android and web platforms.

## Permissions Required

The app requests the following HealthKit permissions:

### Read Permissions:
- **Workout** - Access to saved workout sessions
- **Distance Walking/Running** - Running distance data
- **Heart Rate** - Average and max heart rate during workouts
- **Active Energy Burned** - Calories burned during activity

### Write Permissions:
- **Workout** - Save workouts to Apple Health (future feature)
- **Distance Walking/Running** - Save running distance

## User Flow

### 1. Initial Connection

1. User navigates to **Profile** tab
2. Taps **"Apple Health Sync"** in Settings
3. iOS system shows HealthKit permission dialog
4. User grants read/write access
5. Green checkmark indicates successful connection

### 2. Syncing Workouts

1. User taps **"Apple Health Sync"** (when already connected)
2. App fetches running workouts from last 30 days
3. Creates `RunningSession` records for each workout
4. Shows success alert: "Successfully synced X workouts"
5. Workouts appear in Sessions tab with "Synced from Apple Health" note

### 3. Automatic Deduplication

- Each HealthKit workout has a unique ID stored in `healthkit_data.workoutId`
- The system tracks which workouts have been synced
- Duplicate workouts are automatically skipped

## Technical Implementation

### HealthKit Service (`src/services/healthkit.ts`)

Singleton service that handles all HealthKit interactions:

```typescript
class HealthKitService {
  async initialize(): Promise<boolean>
  async getRunningWorkouts(startDate: Date, endDate?: Date): Promise<HealthKitWorkout[]>
  async getRecentRunningWorkouts(): Promise<HealthKitWorkout[]>
  async saveWorkout(workout): Promise<boolean>
  async getHeartRate(startDate: Date, endDate: Date): Promise<number | null>
}
```

### useHealthKit Hook (`src/hooks/useHealthKit.ts`)

React hook that provides HealthKit functionality to components:

```typescript
const {
  isAvailable,      // Platform.OS === 'ios'
  isAuthorized,     // User has granted permissions
  isLoading,        // Requesting permissions
  isSyncing,        // Syncing workouts
  requestAuthorization,  // Request HealthKit access
  syncWorkouts,     // Sync recent workouts
  getWorkouts,      // Fetch workouts for date range
} = useHealthKit()
```

### Data Mapping

HealthKit workout data → PaceFlow session:

| HealthKit Field | PaceFlow Field | Transformation |
|----------------|----------------|----------------|
| `distance` | `distance` | meters → kilometers (÷ 1000) |
| `duration` | `duration` | seconds (no change) |
| `calories` | `calories` | kcal (no change) |
| `start` | `date` | ISO string → Date |
| `heartRate.average` | `heart_rate_avg` | bpm (no change) |
| `heartRate.max` | `heart_rate_max` | bpm (no change) |
| — | `pace` | duration ÷ distance (min/km) |
| — | `source` | Always `'healthkit'` |
| — | `completed` | Always `true` |
| entire workout | `healthkit_data` | Stores original data |

### Database Schema

Sessions table includes HealthKit metadata:

```sql
CREATE TABLE running_sessions (
  ...
  source TEXT CHECK (source IN ('manual', 'healthkit')),
  healthkit_data JSONB,
  ...
);
```

**HealthKit Data Structure:**
```json
{
  "workoutId": "HKWorkout-ABC123",
  "activityName": "Running",
  "startDate": "2025-01-15T06:30:00Z",
  "endDate": "2025-01-15T07:15:00Z"
}
```

## Configuration

### 1. App Configuration (`app.json`)

```json
{
  "ios": {
    "infoPlist": {
      "NSHealthShareUsageDescription": "PaceFlow needs access to your running workouts...",
      "NSHealthUpdateUsageDescription": "PaceFlow needs permission to save...",
      "UIBackgroundModes": ["fetch"]
    }
  }
}
```

### 2. Package Installation

```bash
npm install react-native-health
```

### 3. iOS Build

HealthKit requires a physical iOS device (not simulator):

```bash
# Prebuild for iOS
npx expo prebuild --platform ios

# Open in Xcode
open ios/PaceFlow.xcworkspace

# Build and run on device
```

**Important:** Ensure HealthKit capability is enabled in Xcode:
1. Open project in Xcode
2. Select target → Signing & Capabilities
3. Click + Capability
4. Add "HealthKit"

## Workout Detection

### Supported Activity Types

The integration filters for running-related activities:
- Running (activity ID 37)
- Walking
- Outdoor Run
- Indoor Run
- Any activity with "running" in the name

### Excluded Activity Types

- Cycling
- Swimming
- Strength training
- Other non-running activities

### Time Window

- **Default:** Last 30 days
- **Customizable:** Can query any date range via `getWorkouts(startDate, endDate)`

## User Experience

### Connection Status Indicators

**Not Connected:**
- Icon: Gray heart pulse
- Description: "Not connected - Tap to authorize"
- Action: Opens iOS permission dialog

**Connected:**
- Icon: Green heart pulse
- Description: "Connected - Tap to sync workouts"
- Action: Syncs recent workouts

**Syncing:**
- Shows loading spinner
- Disables tap action
- Prevents duplicate sync requests

### Success Messages

```
"Successfully synced 5 workouts from Apple Health."
```

### Error Messages

```
"No running workouts found in the last 30 days."
"All recent workouts have already been synced."
"Failed to sync workouts from Apple Health."
```

## Privacy & Security

### Data Handling

- **No Cloud Storage:** HealthKit data stays on device
- **User Control:** User can revoke permissions anytime in iOS Settings
- **Transparent Usage:** Clear permission descriptions explain data use
- **Minimal Access:** Only request necessary permissions

### Permission Descriptions

Users see these messages when granting access:

**NSHealthShareUsageDescription:**
> "PaceFlow needs access to your running workouts to automatically sync your training data and provide personalized insights."

**NSHealthUpdateUsageDescription:**
> "PaceFlow needs permission to save your running sessions to Apple Health."

### Revoking Access

Users can revoke HealthKit access:
1. Open iOS **Settings** app
2. Scroll to **Privacy & Security**
3. Tap **Health**
4. Select **PaceFlow**
5. Disable specific permissions or revoke all access

## Troubleshooting

### Issue: "HealthKit not available"

**Cause:** Running on Android, web, or iOS simulator

**Solution:** Test on physical iOS device only

### Issue: "Permission denied"

**Cause:** User declined HealthKit permissions

**Solution:**
1. Go to iOS Settings → Privacy → Health → PaceFlow
2. Enable required permissions
3. Return to app and try again

### Issue: "No workouts synced"

**Possible Causes:**
- No running workouts in Apple Health
- Workouts older than 30 days
- Workouts already synced previously

**Solutions:**
- Check Apple Health app for workout data
- Verify workout type is "Running"
- Check Sessions tab for existing synced workouts

### Issue: Duplicate workouts

**Should Not Happen:** The system uses `healthkit_data.workoutId` to prevent duplicates

**If it occurs:**
- File a bug report with details
- Manually delete duplicate sessions
- Check database for missing `workoutId` in `healthkit_data`

## Testing

### Manual Testing Steps

1. **Setup:**
   - Build app on physical iPhone
   - Complete at least one running workout with Apple Watch
   - Ensure workout appears in Apple Health app

2. **Authorization:**
   - Open PaceFlow → Profile
   - Tap "Apple Health Sync"
   - Grant all requested permissions
   - Verify green checkmark and "Connected" status

3. **Sync:**
   - Tap "Apple Health Sync" again
   - Wait for sync to complete (2-5 seconds)
   - Verify success alert shows correct count
   - Navigate to Sessions tab
   - Confirm synced workouts appear with correct data

4. **Deduplication:**
   - Tap "Apple Health Sync" again
   - Verify alert: "All recent workouts have already been synced"
   - Check Sessions tab - no duplicates

5. **Data Accuracy:**
   - Compare workout data in PaceFlow vs Apple Health
   - Verify: distance, duration, heart rate, calories match
   - Check pace calculation: duration ÷ distance (min/km)

### Test Scenarios

| Scenario | Expected Behavior |
|----------|-------------------|
| No HealthKit permission | Shows "Not connected - Tap to authorize" |
| Fresh authorization | Permission dialog → Success alert |
| Permission denied | Alert: "Please allow PaceFlow to access..." |
| First sync with 3 workouts | "Successfully synced 3 workouts" |
| Sync again immediately | "All recent workouts have already been synced" |
| No workouts in last 30 days | "No running workouts found in the last 30 days" |
| Android device | HealthKit option hidden |
| Workout without heart rate | Session created, heart_rate_avg/max = null |

## Limitations

### Current Limitations

1. **Read-Only:** App only reads HealthKit data, doesn't write sessions back
2. **30-Day Window:** Only syncs workouts from last 30 days by default
3. **Running Only:** Ignores cycling, swimming, other activities
4. **iOS Only:** Not available on Android (Google Fit integration could be added)
5. **Manual Sync:** User must tap to sync (no automatic background sync)

### Future Enhancements

- [ ] Write sessions to HealthKit (bidirectional sync)
- [ ] Automatic background sync (every 24 hours)
- [ ] Custom date range selection for sync
- [ ] Support for other activity types (cycling, swimming)
- [ ] Sync individual workout notes/route data
- [ ] GPS route visualization from HealthKit
- [ ] Google Fit integration for Android parity

## Cost Analysis

**Package:** react-native-health (Free, Open Source)

**Apple Developer:**
- Individual: $99/year (required for App Store)
- Enterprise: $299/year

**HealthKit:**
- Free (no additional cost)
- No API rate limits
- No usage fees

## Support Resources

- [Apple HealthKit Documentation](https://developer.apple.com/documentation/healthkit)
- [react-native-health GitHub](https://github.com/agencyenterprise/react-native-health)
- [HealthKit Authorization](https://developer.apple.com/documentation/healthkit/authorizing_access_to_health_data)
- [Workout Types Reference](https://developer.apple.com/documentation/healthkit/hkworkoutactivitytype)

---

**Status:** Functional (requires iOS device for testing)
**Complexity:** Medium (native iOS integration)
**User Value:** Very High (eliminates manual data entry)
