import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, SegmentedButtons, TextInput, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import { FitnessLevel, GoalType } from '../../types';
import { colors } from '../../theme/colors';

export const OnboardingScreen = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Form state
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>('beginner');
  const [goals, setGoals] = useState<GoalType[]>([]);
  const [experienceLevel, setExperienceLevel] = useState('');
  const [injuries, setInjuries] = useState('');
  const [trainingDays, setTrainingDays] = useState(3);

  const toggleGoal = (goal: GoalType) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter((g) => g !== goal));
    } else {
      setGoals([...goals, goal]);
    }
  };

  const handleSubmit = async () => {
    if (!session?.user) return;

    try {
      setLoading(true);

      // Create user record
      const { error: userError } = await supabase.from('users').insert({
        id: session.user.id,
        email: session.user.email || '',
        full_name: session.user.user_metadata?.full_name || '',
        google_id: session.user.user_metadata?.sub || '',
        subscription_status: 'trial',
        subscription_end_date: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(), // 7 days from now
      });

      if (userError && userError.code !== '23505') {
        // Ignore duplicate key errors
        throw userError;
      }

      // Create user profile
      const { error: profileError } = await supabase.from('user_profiles').insert({
        user_id: session.user.id,
        fitness_level: fitnessLevel,
        experience_level: experienceLevel,
        goals,
        injuries_limitations: injuries,
        preferred_training_days: trainingDays,
      });

      if (profileError) throw profileError;

      // Reload the app to fetch the new user data
      window.location.reload();
    } catch (error) {
      console.error('Error creating profile:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text variant="headlineMedium" style={styles.stepTitle}>
        What's your fitness level?
      </Text>
      <Text variant="bodyLarge" style={styles.stepDescription}>
        This helps us recommend the right training plans for you.
      </Text>

      <SegmentedButtons
        value={fitnessLevel}
        onValueChange={(value) => setFitnessLevel(value as FitnessLevel)}
        buttons={[
          { value: 'beginner', label: 'Beginner' },
          { value: 'intermediate', label: 'Intermediate' },
          { value: 'advanced', label: 'Advanced' },
        ]}
        style={styles.segmentedButtons}
      />

      <Text variant="bodyMedium" style={styles.levelDescription}>
        {fitnessLevel === 'beginner' && 'New to running or just getting started'}
        {fitnessLevel === 'intermediate' && 'Can run 5K-10K comfortably'}
        {fitnessLevel === 'advanced' && 'Experienced runner, regular training'}
      </Text>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text variant="headlineMedium" style={styles.stepTitle}>
        What are your goals?
      </Text>
      <Text variant="bodyLarge" style={styles.stepDescription}>
        Select all that apply
      </Text>

      <View style={styles.chipsContainer}>
        <Chip
          selected={goals.includes('5k')}
          onPress={() => toggleGoal('5k')}
          style={styles.chip}
        >
          5K
        </Chip>
        <Chip
          selected={goals.includes('10k')}
          onPress={() => toggleGoal('10k')}
          style={styles.chip}
        >
          10K
        </Chip>
        <Chip
          selected={goals.includes('half_marathon')}
          onPress={() => toggleGoal('half_marathon')}
          style={styles.chip}
        >
          Half Marathon
        </Chip>
        <Chip
          selected={goals.includes('marathon')}
          onPress={() => toggleGoal('marathon')}
          style={styles.chip}
        >
          Marathon
        </Chip>
        <Chip
          selected={goals.includes('fitness')}
          onPress={() => toggleGoal('fitness')}
          style={styles.chip}
        >
          General Fitness
        </Chip>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text variant="headlineMedium" style={styles.stepTitle}>
        Tell us about yourself
      </Text>

      <TextInput
        label="Running Experience"
        value={experienceLevel}
        onChangeText={setExperienceLevel}
        placeholder="e.g., 2 years, ran a half marathon last year"
        mode="outlined"
        style={styles.input}
        multiline
      />

      <TextInput
        label="Any injuries or limitations? (Optional)"
        value={injuries}
        onChangeText={setInjuries}
        placeholder="e.g., knee issues, asthma"
        mode="outlined"
        style={styles.input}
        multiline
      />

      <Text variant="titleMedium" style={styles.label}>
        Days per week you can train
      </Text>
      <SegmentedButtons
        value={trainingDays.toString()}
        onValueChange={(value) => setTrainingDays(parseInt(value))}
        buttons={[
          { value: '3', label: '3' },
          { value: '4', label: '4' },
          { value: '5', label: '5' },
          { value: '6', label: '6' },
        ]}
        style={styles.segmentedButtons}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text variant="bodyMedium" style={styles.stepIndicator}>
            Step {step} of 3
          </Text>
        </View>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <Button mode="outlined" onPress={() => setStep(step - 1)} style={styles.button}>
            Back
          </Button>
        )}
        <Button
          mode="contained"
          onPress={() => {
            if (step < 3) {
              setStep(step + 1);
            } else {
              handleSubmit();
            }
          }}
          loading={loading}
          disabled={loading || (step === 2 && goals.length === 0)}
          style={[styles.button, styles.primaryButton]}
        >
          {step === 3 ? 'Get Started' : 'Continue'}
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
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  stepIndicator: {
    color: colors.textSecondary,
  },
  stepContainer: {
    gap: 24,
  },
  stepTitle: {
    fontWeight: 'bold',
    color: colors.text,
  },
  stepDescription: {
    color: colors.textSecondary,
  },
  segmentedButtons: {
    marginTop: 8,
  },
  levelDescription: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: -8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    marginRight: 0,
  },
  input: {
    backgroundColor: colors.background,
  },
  label: {
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  button: {
    flex: 1,
    borderRadius: 12,
  },
  primaryButton: {
    flex: 2,
  },
});
