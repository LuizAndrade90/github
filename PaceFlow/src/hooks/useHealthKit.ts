import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { healthKitService, isHealthKitAvailable, HealthKitWorkout } from '../services/healthkit';
import { useSessions } from './useSessions';
import { useAuth } from './useAuth';

export const useHealthKit = () => {
  const { user } = useAuth();
  const { createSession, refetch } = useSessions();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Check authorization status on mount
  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    if (!isHealthKitAvailable) {
      setIsAuthorized(false);
      return false;
    }

    try {
      const authorized = await healthKitService.isAuthorized();
      setIsAuthorized(authorized);
      return authorized;
    } catch (error) {
      console.error('Error checking HealthKit authorization:', error);
      return false;
    }
  };

  const requestAuthorization = async (): Promise<boolean> => {
    if (!isHealthKitAvailable) {
      Alert.alert(
        'Not Available',
        'Apple HealthKit is only available on iOS devices.'
      );
      return false;
    }

    try {
      setIsLoading(true);
      const success = await healthKitService.initialize();

      if (success) {
        setIsAuthorized(true);
        Alert.alert(
          'Success',
          'HealthKit access granted! You can now sync your workouts.'
        );
        return true;
      } else {
        Alert.alert(
          'Permission Denied',
          'Please allow PaceFlow to access your Health data in Settings > Privacy > Health.'
        );
        return false;
      }
    } catch (error) {
      console.error('Error requesting HealthKit authorization:', error);
      Alert.alert('Error', 'Failed to request HealthKit access.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const syncWorkouts = async (): Promise<number> => {
    if (!isAuthorized || !user) {
      Alert.alert('Error', 'Please authorize HealthKit access first.');
      return 0;
    }

    try {
      setIsSyncing(true);

      // Get recent workouts from HealthKit (last 30 days)
      const workouts = await healthKitService.getRecentRunningWorkouts();

      if (workouts.length === 0) {
        Alert.alert('No Workouts', 'No running workouts found in the last 30 days.');
        return 0;
      }

      // Get existing sessions to avoid duplicates
      await refetch();

      let syncedCount = 0;

      // Create sessions for each HealthKit workout
      for (const workout of workouts) {
        try {
          // Convert meters to kilometers
          const distanceKm = workout.distance / 1000;

          // Calculate pace (min/km) if we have distance and duration
          let pace: number | undefined;
          if (distanceKm > 0 && workout.duration > 0) {
            // pace = duration (seconds) / distance (km) = seconds per km
            pace = workout.duration / distanceKm;
          }

          await createSession({
            date: new Date(workout.start).toISOString(),
            distance: distanceKm,
            duration: workout.duration,
            pace,
            heart_rate_avg: workout.heartRate?.average,
            heart_rate_max: workout.heartRate?.max,
            calories: workout.calories || undefined,
            notes: `Synced from Apple Health: ${workout.activityName}`,
            completed: true,
            source: 'healthkit',
            healthkit_data: {
              workoutId: workout.id,
              activityName: workout.activityName,
              startDate: workout.start,
              endDate: workout.end,
            },
          });

          syncedCount++;
        } catch (error) {
          console.error('Error creating session from workout:', error);
          // Continue with other workouts even if one fails
        }
      }

      if (syncedCount > 0) {
        Alert.alert(
          'Sync Complete',
          `Successfully synced ${syncedCount} workout${syncedCount > 1 ? 's' : ''} from Apple Health.`
        );
      } else {
        Alert.alert(
          'Already Synced',
          'All recent workouts have already been synced.'
        );
      }

      return syncedCount;
    } catch (error) {
      console.error('Error syncing workouts:', error);
      Alert.alert('Sync Failed', 'Failed to sync workouts from Apple Health.');
      return 0;
    } finally {
      setIsSyncing(false);
    }
  };

  const getWorkouts = async (
    startDate: Date,
    endDate?: Date
  ): Promise<HealthKitWorkout[]> => {
    if (!isAuthorized) {
      throw new Error('HealthKit not authorized');
    }

    try {
      return await healthKitService.getRunningWorkouts(startDate, endDate);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      throw error;
    }
  };

  return {
    isAvailable: isHealthKitAvailable,
    isAuthorized,
    isLoading,
    isSyncing,
    requestAuthorization,
    checkAuthorization,
    syncWorkouts,
    getWorkouts,
  };
};
