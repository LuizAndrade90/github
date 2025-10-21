import { Platform } from 'react-native';
import AppleHealthKit, {
  HealthValue,
  HealthKitPermissions,
  HealthInputOptions,
} from 'react-native-health';

// HealthKit is iOS only
export const isHealthKitAvailable = Platform.OS === 'ios';

// Permissions we need
const permissions: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.Workout,
      AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
    ],
    write: [
      AppleHealthKit.Constants.Permissions.Workout,
      AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
    ],
  },
};

export interface HealthKitWorkout {
  id: string;
  activityName: string;
  calories: number;
  distance: number; // in meters
  duration: number; // in seconds
  start: string; // ISO date
  end: string; // ISO date
  heartRate?: {
    average?: number;
    max?: number;
  };
}

class HealthKitService {
  private initialized = false;

  /**
   * Initialize HealthKit and request permissions
   */
  async initialize(): Promise<boolean> {
    if (!isHealthKitAvailable) {
      console.log('HealthKit is not available on this platform');
      return false;
    }

    return new Promise((resolve) => {
      AppleHealthKit.initHealthKit(permissions, (error: string) => {
        if (error) {
          console.error('Error initializing HealthKit:', error);
          this.initialized = false;
          resolve(false);
        } else {
          console.log('HealthKit initialized successfully');
          this.initialized = true;
          resolve(true);
        }
      });
    });
  }

  /**
   * Check if HealthKit is available and authorized
   */
  async isAuthorized(): Promise<boolean> {
    if (!isHealthKitAvailable) return false;

    return new Promise((resolve) => {
      AppleHealthKit.isAvailable((err, available) => {
        if (err) {
          resolve(false);
          return;
        }
        resolve(available && this.initialized);
      });
    });
  }

  /**
   * Fetch running workouts from HealthKit
   * @param startDate - Start date for query
   * @param endDate - End date for query (defaults to now)
   */
  async getRunningWorkouts(
    startDate: Date,
    endDate: Date = new Date()
  ): Promise<HealthKitWorkout[]> {
    if (!isHealthKitAvailable || !this.initialized) {
      throw new Error('HealthKit is not available or not initialized');
    }

    return new Promise((resolve, reject) => {
      const options: HealthInputOptions = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      AppleHealthKit.getSamples(
        options,
        (err: Object, results: HealthValue[]) => {
          if (err) {
            reject(err);
            return;
          }

          // Filter for running/walking workouts
          const runningWorkouts = (results || [])
            .filter((workout: any) => {
              const activityName = workout.activityName?.toLowerCase() || '';
              return (
                activityName.includes('running') ||
                activityName.includes('walk') ||
                workout.activityId === 37 // Running activity ID
              );
            })
            .map((workout: any) => ({
              id: workout.id || workout.uuid || `${workout.start}-${workout.end}`,
              activityName: workout.activityName || 'Running',
              calories: workout.calories || 0,
              distance: workout.distance || 0, // meters
              duration: workout.duration || 0, // seconds
              start: workout.start,
              end: workout.end,
              heartRate: workout.heartRate
                ? {
                    average: workout.heartRate.average,
                    max: workout.heartRate.max,
                  }
                : undefined,
            }));

          resolve(runningWorkouts);
        }
      );
    });
  }

  /**
   * Get the most recent running workouts (last 30 days)
   */
  async getRecentRunningWorkouts(): Promise<HealthKitWorkout[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days

    return this.getRunningWorkouts(startDate, endDate);
  }

  /**
   * Save a workout to HealthKit
   */
  async saveWorkout(workout: {
    start: Date;
    end: Date;
    distance: number; // in meters
    calories?: number;
  }): Promise<boolean> {
    if (!isHealthKitAvailable || !this.initialized) {
      throw new Error('HealthKit is not available or not initialized');
    }

    return new Promise((resolve, reject) => {
      const options = {
        type: AppleHealthKit.Constants.Activities.Running,
        startDate: workout.start.toISOString(),
        endDate: workout.end.toISOString(),
        energyBurned: workout.calories || 0,
        distance: workout.distance,
      };

      AppleHealthKit.saveWorkout(options, (err: string, result: HealthValue) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(true);
      });
    });
  }

  /**
   * Get average heart rate for a specific time period
   */
  async getHeartRate(startDate: Date, endDate: Date): Promise<number | null> {
    if (!isHealthKitAvailable || !this.initialized) {
      return null;
    }

    return new Promise((resolve) => {
      const options: HealthInputOptions = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      AppleHealthKit.getHeartRateSamples(
        options,
        (err: Object, results: HealthValue[]) => {
          if (err || !results || results.length === 0) {
            resolve(null);
            return;
          }

          // Calculate average heart rate
          const sum = results.reduce(
            (acc: number, sample: any) => acc + (sample.value || 0),
            0
          );
          const average = sum / results.length;
          resolve(Math.round(average));
        }
      );
    });
  }
}

// Export singleton instance
export const healthKitService = new HealthKitService();
