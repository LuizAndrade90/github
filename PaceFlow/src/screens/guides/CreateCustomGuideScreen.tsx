import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  Card,
  TextInput,
  Button,
  SegmentedButtons,
  Switch,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors } from '../../theme/colors';
import { GuidesStackParamList, FitnessLevel, GoalType } from '../../types';
import { useCustomGuides } from '../../hooks/useCustomGuides';

type NavigationProp = NativeStackNavigationProp<GuidesStackParamList>;

const GOAL_OPTIONS = [
  { value: '5k', label: '5K Race' },
  { value: '10k', label: '10K Race' },
  { value: 'half_marathon', label: 'Half Marathon' },
  { value: 'marathon', label: 'Marathon' },
  { value: 'fitness', label: 'General Fitness' },
];

const FITNESS_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const DURATION_OPTIONS = [
  { value: '4', label: '4 weeks' },
  { value: '8', label: '8 weeks' },
  { value: '12', label: '12 weeks' },
  { value: '16', label: '16 weeks' },
];

const DAYS_PER_WEEK = [
  { value: '3', label: '3 days' },
  { value: '4', label: '4 days' },
  { value: '5', label: '5 days' },
  { value: '6', label: '6 days' },
];

export const CreateCustomGuideScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { generateCustomGuide, loading } = useCustomGuides();

  const [goal, setGoal] = useState<GoalType>('5k');
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>('beginner');
  const [durationWeeks, setDurationWeeks] = useState('8');
  const [daysPerWeek, setDaysPerWeek] = useState('4');
  const [hasInjuries, setHasInjuries] = useState(false);
  const [injuryDetails, setInjuryDetails] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const handleGenerate = async () => {
    try {
      const guide = await generateCustomGuide({
        goal,
        fitnessLevel,
        durationWeeks: parseInt(durationWeeks),
        daysPerWeek: parseInt(daysPerWeek),
        hasInjuries,
        injuryDetails: hasInjuries ? injuryDetails : undefined,
        additionalNotes: additionalNotes || undefined,
      });

      if (guide) {
        Alert.alert(
          'Success!',
          'Your custom training guide has been generated.',
          [
            {
              text: 'View Guide',
              onPress: () => navigation.navigate('GuideDetail', { guideId: guide.id }),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate custom guide. Please try again.');
      console.error('Generate guide error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              AI-Powered Custom Guide
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Tell us about your goals and we'll create a personalized training plan just for you.
            </Text>
          </Card.Content>
        </Card>

        {/* Goal Selection */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              What's your goal?
            </Text>
            <SegmentedButtons
              value={goal}
              onValueChange={(value) => setGoal(value as GoalType)}
              buttons={GOAL_OPTIONS}
              style={styles.segmented}
            />
          </Card.Content>
        </Card>

        {/* Fitness Level */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Fitness Level
            </Text>
            <SegmentedButtons
              value={fitnessLevel}
              onValueChange={(value) => setFitnessLevel(value as FitnessLevel)}
              buttons={FITNESS_LEVELS}
              style={styles.segmented}
            />
          </Card.Content>
        </Card>

        {/* Duration */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Training Duration
            </Text>
            <SegmentedButtons
              value={durationWeeks}
              onValueChange={setDurationWeeks}
              buttons={DURATION_OPTIONS}
              style={styles.segmented}
            />
          </Card.Content>
        </Card>

        {/* Days Per Week */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Days Per Week
            </Text>
            <SegmentedButtons
              value={daysPerWeek}
              onValueChange={setDaysPerWeek}
              buttons={DAYS_PER_WEEK}
              style={styles.segmented}
            />
          </Card.Content>
        </Card>

        {/* Injuries */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Do you have any injuries?
                </Text>
                <Text variant="bodySmall" style={styles.hint}>
                  We'll adjust the plan accordingly
                </Text>
              </View>
              <Switch value={hasInjuries} onValueChange={setHasInjuries} />
            </View>

            {hasInjuries && (
              <TextInput
                mode="outlined"
                label="Injury Details"
                value={injuryDetails}
                onChangeText={setInjuryDetails}
                placeholder="E.g., Knee pain, shin splints, etc."
                multiline
                numberOfLines={3}
                style={styles.textInput}
              />
            )}
          </Card.Content>
        </Card>

        {/* Additional Notes */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Additional Notes (Optional)
            </Text>
            <TextInput
              mode="outlined"
              label="Any other preferences or constraints?"
              value={additionalNotes}
              onChangeText={setAdditionalNotes}
              placeholder="E.g., Prefer morning runs, limited time on weekdays, etc."
              multiline
              numberOfLines={4}
              style={styles.textInput}
            />
          </Card.Content>
        </Card>

        {/* Generate Button */}
        <Button
          mode="contained"
          onPress={handleGenerate}
          loading={loading}
          disabled={loading}
          style={styles.generateButton}
          contentStyle={styles.generateButtonContent}
        >
          {loading ? 'Generating Your Custom Plan...' : 'Generate Custom Guide'}
        </Button>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text variant="bodySmall" style={styles.loadingText}>
              Our AI is crafting your personalized training plan...
            </Text>
          </View>
        )}
      </ScrollView>
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
    paddingBottom: 32,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textSecondary,
    lineHeight: 22,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  hint: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  segmented: {
    marginTop: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  switchLabel: {
    flex: 1,
  },
  textInput: {
    marginTop: 16,
  },
  generateButton: {
    borderRadius: 12,
    marginBottom: 16,
  },
  generateButtonContent: {
    paddingVertical: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
