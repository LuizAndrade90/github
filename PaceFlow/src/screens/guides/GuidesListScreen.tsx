import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useStandardGuides } from '../../hooks/useGuides';
import { colors } from '../../theme/colors';
import { StandardGuide } from '../../types';

export const GuidesListScreen = () => {
  const { guides, loading, error } = useStandardGuides();
  const navigation = useNavigation();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'beginner':
        return colors.success;
      case 'distance':
        return colors.primary;
      case 'speed':
        return colors.warning;
      case 'endurance':
        return colors.info;
      default:
        return colors.primary;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'beginner':
        return 'walk';
      case 'distance':
        return 'run';
      case 'speed':
        return 'speedometer';
      case 'endurance':
        return 'battery-charging-high';
      default:
        return 'book-open-variant';
    }
  };

  const handleGuidePress = (guide: StandardGuide) => {
    // @ts-ignore - Navigation typing will be fixed later
    navigation.navigate('GuideDetail', { guideId: guide.id });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="alert-circle" size={48} color={colors.error} />
        <Text variant="titleMedium" style={styles.errorText}>
          Failed to load guides
        </Text>
        <Text variant="bodyMedium" style={styles.errorSubtext}>
          Please check your connection and try again
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Training Guides
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Choose a plan that matches your goals
          </Text>
        </View>

        <View style={styles.guidesContainer}>
          {guides.map((guide) => (
            <TouchableOpacity
              key={guide.id}
              onPress={() => handleGuidePress(guide)}
              activeOpacity={0.7}
            >
              <Card style={styles.card} mode="elevated">
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <MaterialCommunityIcons
                      name={getCategoryIcon(guide.category)}
                      size={32}
                      color={getCategoryColor(guide.category)}
                    />
                    <Chip
                      style={[styles.categoryChip, { backgroundColor: `${getCategoryColor(guide.category)}20` }]}
                      textStyle={{ color: getCategoryColor(guide.category), fontSize: 12 }}
                    >
                      {guide.category.toUpperCase()}
                    </Chip>
                  </View>

                  <Text variant="titleLarge" style={styles.guideTitle}>
                    {guide.title}
                  </Text>

                  <Text variant="bodyMedium" style={styles.guideDescription} numberOfLines={2}>
                    {guide.description}
                  </Text>

                  <View style={styles.cardFooter}>
                    <View style={styles.stat}>
                      <MaterialCommunityIcons name="calendar" size={16} color={colors.textSecondary} />
                      <Text variant="bodySmall" style={styles.statText}>
                        {guide.duration_weeks} weeks
                      </Text>
                    </View>
                    <View style={styles.stat}>
                      <MaterialCommunityIcons name="run" size={16} color={colors.textSecondary} />
                      <Text variant="bodySmall" style={styles.statText}>
                        {guide.sessions?.length || 0} sessions
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {guides.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="book-open-variant" size={64} color={colors.textSecondary} />
            <Text variant="titleMedium" style={styles.emptyText}>
              No guides available
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Check back later for training plans
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  guidesContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryChip: {
    height: 24,
  },
  guideTitle: {
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  guideDescription: {
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 24,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: colors.textSecondary,
  },
  errorText: {
    color: colors.error,
    marginTop: 8,
  },
  errorSubtext: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    gap: 12,
  },
  emptyText: {
    color: colors.textSecondary,
  },
  emptySubtext: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
