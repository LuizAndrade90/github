import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Divider, List } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useStandardGuides } from '../../hooks/useGuides';
import { colors } from '../../theme/colors';
import { StandardGuide, GuideSession } from '../../types';

type RouteParams = {
  GuideDetail: {
    guideId: string;
  };
};

export const GuideDetailScreen = () => {
  const route = useRoute<RouteProp<RouteParams, 'GuideDetail'>>();
  const { guideId } = route.params;
  const { getGuideById } = useStandardGuides();

  const [guide, setGuide] = useState<StandardGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));

  useEffect(() => {
    loadGuide();
  }, [guideId]);

  const loadGuide = async () => {
    try {
      setLoading(true);
      const data = await getGuideById(guideId);
      setGuide(data);
    } catch (error) {
      console.error('Error loading guide:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWeek = (week: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(week)) {
        next.delete(week);
      } else {
        next.add(week);
      }
      return next;
    });
  };

  const groupSessionsByWeek = (sessions: GuideSession[]) => {
    const grouped: { [week: number]: GuideSession[] } = {};

    sessions.forEach((session) => {
      if (!grouped[session.week]) {
        grouped[session.week] = [];
      }
      grouped[session.week].push(session);
    });

    return grouped;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return `${hours}h ${remainingMins}m`;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!guide) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="alert-circle" size={48} color={colors.error} />
        <Text variant="titleMedium" style={styles.errorText}>
          Guide not found
        </Text>
      </View>
    );
  }

  const sessionsByWeek = groupSessionsByWeek(guide.sessions);
  const weeks = Object.keys(sessionsByWeek)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            {guide.title}
          </Text>
          <Text variant="bodyLarge" style={styles.description}>
            {guide.description}
          </Text>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <MaterialCommunityIcons name="calendar" size={20} color={colors.primary} />
              <Text variant="bodyMedium" style={styles.statText}>
                {guide.duration_weeks} weeks
              </Text>
            </View>
            <View style={styles.stat}>
              <MaterialCommunityIcons name="run" size={20} color={colors.primary} />
              <Text variant="bodyMedium" style={styles.statText}>
                {guide.sessions.length} sessions
              </Text>
            </View>
          </View>

          <Chip
            style={styles.categoryChip}
            textStyle={{ color: colors.white }}
            mode="flat"
          >
            {guide.category.toUpperCase()}
          </Chip>
        </View>

        <Divider style={styles.divider} />

        {/* Weekly Breakdown */}
        <View style={styles.weeksContainer}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Weekly Breakdown
          </Text>

          {weeks.map((week) => {
            const weekSessions = sessionsByWeek[week];
            const isExpanded = expandedWeeks.has(week);

            return (
              <Card key={week} style={styles.weekCard} mode="elevated">
                <List.Accordion
                  title={`Week ${week}`}
                  description={`${weekSessions.length} sessions`}
                  expanded={isExpanded}
                  onPress={() => toggleWeek(week)}
                  left={(props) => (
                    <List.Icon {...props} icon="calendar-week" color={colors.primary} />
                  )}
                  style={styles.weekAccordion}
                >
                  {weekSessions.map((session, index) => (
                    <View key={index} style={styles.sessionContainer}>
                      <View style={styles.sessionHeader}>
                        <View style={styles.sessionDay}>
                          <MaterialCommunityIcons name="numeric" size={16} color={colors.textSecondary} />
                          <Text variant="bodySmall" style={styles.sessionDayText}>
                            Day {session.day}
                          </Text>
                        </View>
                        <Chip
                          compact
                          style={styles.sessionTypeChip}
                          textStyle={{ fontSize: 11 }}
                        >
                          {session.type}
                        </Chip>
                      </View>

                      <Text variant="bodyMedium" style={styles.sessionDescription}>
                        {session.description}
                      </Text>

                      <View style={styles.sessionMeta}>
                        {session.distance && (
                          <View style={styles.metaItem}>
                            <MaterialCommunityIcons name="map-marker-distance" size={14} color={colors.textSecondary} />
                            <Text variant="bodySmall" style={styles.metaText}>
                              {session.distance} km
                            </Text>
                          </View>
                        )}
                        {session.duration && (
                          <View style={styles.metaItem}>
                            <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textSecondary} />
                            <Text variant="bodySmall" style={styles.metaText}>
                              {formatDuration(session.duration)}
                            </Text>
                          </View>
                        )}
                      </View>

                      {index < weekSessions.length - 1 && <Divider style={styles.sessionDivider} />}
                    </View>
                  ))}
                </List.Accordion>
              </Card>
            );
          })}
        </View>
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
  header: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontWeight: 'bold',
    color: colors.text,
  },
  description: {
    color: colors.textSecondary,
    lineHeight: 24,
  },
  stats: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    color: colors.text,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
  },
  divider: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  weeksContainer: {
    padding: 16,
    gap: 12,
  },
  weekCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  weekAccordion: {
    backgroundColor: colors.white,
  },
  sessionContainer: {
    padding: 16,
    backgroundColor: colors.backgroundSecondary,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionDay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sessionDayText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  sessionTypeChip: {
    height: 24,
    backgroundColor: colors.primary + '20',
  },
  sessionDescription: {
    color: colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  sessionMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: colors.textSecondary,
  },
  sessionDivider: {
    marginTop: 12,
  },
  errorText: {
    color: colors.error,
    marginTop: 8,
  },
});
