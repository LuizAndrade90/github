import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator, Chip, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useDashboard } from '../../hooks/useDashboard';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';

export const DashboardScreen = () => {
  const { user } = useAuth();
  const { stats, loading, refetch } = useDashboard();
  const navigation = useNavigation();

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatPace = (pace: number) => {
    if (!pace || pace === 0) return '--';
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const hasData = stats.totalRuns > 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.greeting}>
            Hello, {user?.full_name?.split(' ')[0] || 'Runner'}! 👋
          </Text>
          <Text variant="bodyLarge" style={styles.subgreeting}>
            {hasData ? "Here's your running summary" : 'Start your running journey today'}
          </Text>
        </View>

        {!hasData ? (
          /* Empty State */
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="run-fast" size={80} color={colors.primary} />
            <Text variant="titleLarge" style={styles.emptyTitle}>
              Start Running Today!
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Log your first run to see your stats and track your progress
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => {
                // @ts-ignore
                navigation.navigate('Sessions', { screen: 'AddSession' });
              }}
            >
              <Text style={styles.emptyButtonText}>Log First Run</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Main Stats Grid */}
            <Card style={styles.card} mode="elevated">
              <Card.Content>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  All Time Stats
                </Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <MaterialCommunityIcons name="map-marker-distance" size={28} color={colors.primary} />
                    <Text variant="headlineMedium" style={styles.statValue}>
                      {stats.totalDistance.toFixed(1)}
                    </Text>
                    <Text variant="bodySmall" style={styles.statLabel}>
                      KM RUN
                    </Text>
                  </View>

                  <View style={styles.statBox}>
                    <MaterialCommunityIcons name="run" size={28} color={colors.primary} />
                    <Text variant="headlineMedium" style={styles.statValue}>
                      {stats.totalRuns}
                    </Text>
                    <Text variant="bodySmall" style={styles.statLabel}>
                      RUNS
                    </Text>
                  </View>

                  <View style={styles.statBox}>
                    <MaterialCommunityIcons name="clock-outline" size={28} color={colors.primary} />
                    <Text variant="headlineMedium" style={styles.statValue}>
                      {formatDuration(stats.totalDuration)}
                    </Text>
                    <Text variant="bodySmall" style={styles.statLabel}>
                      TIME
                    </Text>
                  </View>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.secondaryStatsRow}>
                  <View style={styles.secondaryStat}>
                    <MaterialCommunityIcons name="speedometer" size={20} color={colors.textSecondary} />
                    <View>
                      <Text variant="titleMedium" style={styles.secondaryStatValue}>
                        {formatPace(stats.averagePace)} /km
                      </Text>
                      <Text variant="bodySmall" style={styles.secondaryStatLabel}>
                        Avg Pace
                      </Text>
                    </View>
                  </View>

                  <View style={styles.secondaryStat}>
                    <MaterialCommunityIcons name="fire" size={20} color={colors.warning} />
                    <View>
                      <Text variant="titleMedium" style={styles.secondaryStatValue}>
                        {stats.currentStreak} days
                      </Text>
                      <Text variant="bodySmall" style={styles.secondaryStatLabel}>
                        Current Streak
                      </Text>
                    </View>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* This Week & Month */}
            <View style={styles.periodRow}>
              <Card style={[styles.card, styles.halfCard]} mode="elevated">
                <Card.Content>
                  <Text variant="titleSmall" style={styles.periodTitle}>
                    This Week
                  </Text>
                  <View style={styles.periodStats}>
                    <View style={styles.periodStat}>
                      <Text variant="headlineSmall" style={styles.periodValue}>
                        {stats.thisWeekDistance.toFixed(1)} km
                      </Text>
                      <Text variant="bodySmall" style={styles.periodLabel}>
                        Distance
                      </Text>
                    </View>
                    <View style={styles.periodStat}>
                      <Text variant="headlineSmall" style={styles.periodValue}>
                        {stats.thisWeekRuns}
                      </Text>
                      <Text variant="bodySmall" style={styles.periodLabel}>
                        Runs
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>

              <Card style={[styles.card, styles.halfCard]} mode="elevated">
                <Card.Content>
                  <Text variant="titleSmall" style={styles.periodTitle}>
                    This Month
                  </Text>
                  <View style={styles.periodStats}>
                    <View style={styles.periodStat}>
                      <Text variant="headlineSmall" style={styles.periodValue}>
                        {stats.thisMonthDistance.toFixed(1)} km
                      </Text>
                      <Text variant="bodySmall" style={styles.periodLabel}>
                        Distance
                      </Text>
                    </View>
                    <View style={styles.periodStat}>
                      <Text variant="headlineSmall" style={styles.periodValue}>
                        {stats.thisMonthRuns}
                      </Text>
                      <Text variant="bodySmall" style={styles.periodLabel}>
                        Runs
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </View>

            {/* Recent Activity */}
            {stats.recentSessions.length > 0 && (
              <Card style={styles.card} mode="elevated">
                <Card.Content>
                  <View style={styles.sectionHeader}>
                    <Text variant="titleMedium" style={styles.cardTitle}>
                      Recent Activity
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        // @ts-ignore
                        navigation.navigate('Sessions');
                      }}
                    >
                      <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                  </View>

                  {stats.recentSessions.map((session, index) => (
                    <View key={session.id}>
                      <TouchableOpacity
                        style={styles.recentSession}
                        onPress={() => {
                          // @ts-ignore
                          navigation.navigate('Sessions', {
                            screen: 'SessionDetail',
                            params: { sessionId: session.id },
                          });
                        }}
                      >
                        <View style={styles.recentSessionLeft}>
                          <MaterialCommunityIcons name="run" size={20} color={colors.primary} />
                          <View>
                            <Text variant="bodyMedium" style={styles.recentSessionDistance}>
                              {session.distance?.toFixed(2)} km
                            </Text>
                            <Text variant="bodySmall" style={styles.recentSessionDate}>
                              {formatDate(session.date)}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.recentSessionRight}>
                          <Text variant="bodyMedium" style={styles.recentSessionPace}>
                            {formatPace(session.pace || 0)} /km
                          </Text>
                        </View>
                      </TouchableOpacity>
                      {index < stats.recentSessions.length - 1 && <Divider style={styles.sessionDivider} />}
                    </View>
                  ))}
                </Card.Content>
              </Card>
            )}

            {/* Quick Actions */}
            <Card style={styles.card} mode="elevated">
              <Card.Content>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  Quick Actions
                </Text>
                <View style={styles.quickActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      // @ts-ignore
                      navigation.navigate('Sessions', { screen: 'AddSession' });
                    }}
                  >
                    <MaterialCommunityIcons name="plus-circle" size={24} color={colors.primary} />
                    <Text variant="bodyMedium" style={styles.actionText}>
                      Log Run
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      // @ts-ignore
                      navigation.navigate('Guides');
                    }}
                  >
                    <MaterialCommunityIcons name="book-open-variant" size={24} color={colors.primary} />
                    <Text variant="bodyMedium" style={styles.actionText}>
                      Browse Guides
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </Card>
          </>
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
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subgreeting: {
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontSize: 10,
  },
  divider: {
    marginVertical: 16,
  },
  secondaryStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  secondaryStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryStatValue: {
    fontWeight: '600',
    color: colors.text,
  },
  secondaryStatLabel: {
    color: colors.textSecondary,
  },
  periodRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfCard: {
    flex: 1,
  },
  periodTitle: {
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  periodStats: {
    gap: 12,
  },
  periodStat: {
    gap: 2,
  },
  periodValue: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  periodLabel: {
    color: colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  recentSession: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  recentSessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recentSessionDistance: {
    fontWeight: '600',
    color: colors.text,
  },
  recentSessionDate: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  recentSessionRight: {},
  recentSessionPace: {
    color: colors.textSecondary,
  },
  sessionDivider: {
    marginVertical: 4,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
  },
  actionText: {
    color: colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 16,
  },
  emptyTitle: {
    fontWeight: 'bold',
    color: colors.text,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
});
