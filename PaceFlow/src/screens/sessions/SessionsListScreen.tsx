import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, FAB, ActivityIndicator, Chip, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useSessions } from '../../hooks/useSessions';
import { colors } from '../../theme/colors';
import { RunningSession } from '../../types';

export const SessionsListScreen = () => {
  const { sessions, loading, error } = useSessions();
  const navigation = useNavigation();

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
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPace = (pace?: number) => {
    if (!pace) return '--';
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
  };

  const handleAddSession = () => {
    // @ts-ignore
    navigation.navigate('AddSession');
  };

  const handleSessionPress = (session: RunningSession) => {
    // @ts-ignore
    navigation.navigate('SessionDetail', { sessionId: session.id });
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
          Failed to load sessions
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Running Sessions
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Track your running progress
          </Text>
        </View>

        {sessions.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="run-fast" size={64} color={colors.textSecondary} />
            <Text variant="titleMedium" style={styles.emptyText}>
              No sessions yet
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Tap the + button to log your first run
            </Text>
          </View>
        ) : (
          <View style={styles.sessionsContainer}>
            {sessions.map((session) => (
              <TouchableOpacity
                key={session.id}
                onPress={() => handleSessionPress(session)}
                activeOpacity={0.7}
              >
                <Card style={styles.card} mode="elevated">
                  <Card.Content>
                    <View style={styles.cardHeader}>
                      <View style={styles.dateContainer}>
                        <MaterialCommunityIcons
                          name="calendar"
                          size={16}
                          color={colors.textSecondary}
                        />
                        <Text variant="bodyMedium" style={styles.date}>
                          {formatDate(session.date)}
                        </Text>
                      </View>
                      {session.completed && (
                        <Chip
                          compact
                          style={styles.completedChip}
                          textStyle={{ fontSize: 11 }}
                          icon="check-circle"
                        >
                          Completed
                        </Chip>
                      )}
                    </View>

                    <View style={styles.stats}>
                      <View style={styles.stat}>
                        <MaterialCommunityIcons
                          name="map-marker-distance"
                          size={24}
                          color={colors.primary}
                        />
                        <View>
                          <Text variant="headlineSmall" style={styles.statValue}>
                            {session.distance ? `${session.distance.toFixed(2)}` : '--'}
                          </Text>
                          <Text variant="bodySmall" style={styles.statLabel}>
                            km
                          </Text>
                        </View>
                      </View>

                      <View style={styles.stat}>
                        <MaterialCommunityIcons
                          name="clock-outline"
                          size={24}
                          color={colors.primary}
                        />
                        <View>
                          <Text variant="headlineSmall" style={styles.statValue}>
                            {formatDuration(session.duration)}
                          </Text>
                          <Text variant="bodySmall" style={styles.statLabel}>
                            time
                          </Text>
                        </View>
                      </View>

                      <View style={styles.stat}>
                        <MaterialCommunityIcons
                          name="speedometer"
                          size={24}
                          color={colors.primary}
                        />
                        <View>
                          <Text variant="headlineSmall" style={styles.statValue}>
                            {formatPace(session.pace)}
                          </Text>
                          <Text variant="bodySmall" style={styles.statLabel}>
                            pace
                          </Text>
                        </View>
                      </View>
                    </View>

                    {session.notes && (
                      <Text variant="bodyMedium" style={styles.notes} numberOfLines={2}>
                        {session.notes}
                      </Text>
                    )}

                    {session.heart_rate_avg && (
                      <View style={styles.heartRate}>
                        <MaterialCommunityIcons
                          name="heart-pulse"
                          size={16}
                          color={colors.error}
                        />
                        <Text variant="bodySmall" style={styles.heartRateText}>
                          Avg: {session.heart_rate_avg} bpm
                        </Text>
                        {session.heart_rate_max && (
                          <Text variant="bodySmall" style={styles.heartRateText}>
                            Max: {session.heart_rate_max} bpm
                          </Text>
                        )}
                      </View>
                    )}
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddSession}
        label="Add Run"
        color={colors.white}
      />
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
    paddingBottom: 100, // Space for FAB
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
  sessionsContainer: {
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
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  date: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  completedChip: {
    height: 24,
    backgroundColor: colors.success + '20',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontWeight: 'bold',
    color: colors.text,
    lineHeight: 28,
  },
  statLabel: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  notes: {
    color: colors.text,
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  heartRate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  heartRateText: {
    color: colors.textSecondary,
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
  errorText: {
    color: colors.error,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: colors.primary,
  },
});
