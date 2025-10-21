import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, TextInput, Button, Switch, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useSessions } from '../../hooks/useSessions';
import { colors } from '../../theme/colors';

export const AddSessionScreen = () => {
  const navigation = useNavigation();
  const { createSession } = useSessions();

  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Distance and time inputs
  const [distance, setDistance] = useState('');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');

  // Heart rate
  const [avgHeartRate, setAvgHeartRate] = useState('');
  const [maxHeartRate, setMaxHeartRate] = useState('');

  // Other fields
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [completed, setCompleted] = useState(true);

  const calculatePace = () => {
    const dist = parseFloat(distance);
    const totalSeconds =
      parseInt(hours || '0') * 3600 +
      parseInt(minutes || '0') * 60 +
      parseInt(seconds || '0');

    if (dist > 0 && totalSeconds > 0) {
      const paceInMinPerKm = totalSeconds / dist / 60;
      return paceInMinPerKm;
    }
    return undefined;
  };

  const handleSave = async () => {
    const dist = parseFloat(distance);
    const totalSeconds =
      parseInt(hours || '0') * 3600 +
      parseInt(minutes || '0') * 60 +
      parseInt(seconds || '0');

    if (!dist || dist <= 0) {
      alert('Please enter a valid distance');
      return;
    }

    if (!totalSeconds || totalSeconds <= 0) {
      alert('Please enter a valid duration');
      return;
    }

    try {
      setLoading(true);

      await createSession({
        date: date.toISOString(),
        distance: dist,
        duration: totalSeconds,
        pace: calculatePace(),
        heart_rate_avg: avgHeartRate ? parseInt(avgHeartRate) : undefined,
        heart_rate_max: maxHeartRate ? parseInt(maxHeartRate) : undefined,
        calories: calories ? parseInt(calories) : undefined,
        notes: notes || undefined,
        completed,
        source: 'manual',
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to save session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Log Running Session
        </Text>

        {/* Date */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Date
          </Text>
          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
            contentStyle={styles.dateButtonContent}
          >
            {formatDate(date)}
          </Button>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
            />
          )}
        </View>

        {/* Distance */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Distance (km) *
          </Text>
          <TextInput
            mode="outlined"
            value={distance}
            onChangeText={setDistance}
            keyboardType="decimal-pad"
            placeholder="e.g., 5.5"
            style={styles.input}
          />
        </View>

        {/* Duration */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Duration *
          </Text>
          <View style={styles.durationContainer}>
            <View style={styles.durationField}>
              <TextInput
                mode="outlined"
                label="Hours"
                value={hours}
                onChangeText={setHours}
                keyboardType="number-pad"
                style={styles.durationInput}
              />
            </View>
            <Text variant="headlineSmall" style={styles.durationSeparator}>
              :
            </Text>
            <View style={styles.durationField}>
              <TextInput
                mode="outlined"
                label="Minutes"
                value={minutes}
                onChangeText={setMinutes}
                keyboardType="number-pad"
                style={styles.durationInput}
              />
            </View>
            <Text variant="headlineSmall" style={styles.durationSeparator}>
              :
            </Text>
            <View style={styles.durationField}>
              <TextInput
                mode="outlined"
                label="Seconds"
                value={seconds}
                onChangeText={setSeconds}
                keyboardType="number-pad"
                style={styles.durationInput}
              />
            </View>
          </View>
        </View>

        {/* Calculated Pace */}
        {distance && (parseInt(hours) > 0 || parseInt(minutes) > 0 || parseInt(seconds) > 0) && (
          <View style={styles.paceContainer}>
            <Text variant="titleSmall" style={styles.paceLabel}>
              Average Pace:
            </Text>
            <Text variant="titleMedium" style={styles.paceValue}>
              {(() => {
                const pace = calculatePace();
                if (pace) {
                  const mins = Math.floor(pace);
                  const secs = Math.round((pace - mins) * 60);
                  return `${mins}:${secs.toString().padStart(2, '0')} /km`;
                }
                return '--';
              })()}
            </Text>
          </View>
        )}

        {/* Heart Rate */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Heart Rate (optional)
          </Text>
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <TextInput
                mode="outlined"
                label="Average (bpm)"
                value={avgHeartRate}
                onChangeText={setAvgHeartRate}
                keyboardType="number-pad"
                style={styles.input}
              />
            </View>
            <View style={styles.halfWidth}>
              <TextInput
                mode="outlined"
                label="Max (bpm)"
                value={maxHeartRate}
                onChangeText={setMaxHeartRate}
                keyboardType="number-pad"
                style={styles.input}
              />
            </View>
          </View>
        </View>

        {/* Calories */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Calories Burned (optional)
          </Text>
          <TextInput
            mode="outlined"
            value={calories}
            onChangeText={setCalories}
            keyboardType="number-pad"
            placeholder="e.g., 450"
            style={styles.input}
          />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Notes (optional)
          </Text>
          <TextInput
            mode="outlined"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            placeholder="How did it feel? Weather conditions? Terrain?"
            style={styles.input}
          />
        </View>

        {/* Completed Toggle */}
        <View style={styles.switchContainer}>
          <View>
            <Text variant="titleMedium" style={styles.switchLabel}>
              Mark as Completed
            </Text>
            <Text variant="bodySmall" style={styles.switchDescription}>
              Check this if you finished the run
            </Text>
          </View>
          <Switch value={completed} onValueChange={setCompleted} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.button}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          style={[styles.button, styles.saveButton]}
          loading={loading}
          disabled={loading}
        >
          Save Session
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
  },
  dateButton: {
    borderColor: colors.border,
  },
  dateButtonContent: {
    paddingVertical: 8,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  durationField: {
    flex: 1,
  },
  durationInput: {
    backgroundColor: colors.background,
  },
  durationSeparator: {
    paddingHorizontal: 8,
    color: colors.textSecondary,
  },
  paceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    marginBottom: 24,
  },
  paceLabel: {
    color: colors.text,
  },
  paceValue: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    marginBottom: 24,
  },
  switchLabel: {
    color: colors.text,
  },
  switchDescription: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  button: {
    flex: 1,
    borderRadius: 12,
  },
  saveButton: {
    flex: 2,
  },
});
