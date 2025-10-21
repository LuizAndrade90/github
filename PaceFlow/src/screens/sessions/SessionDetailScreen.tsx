import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Button, IconButton, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useSessions } from '../../hooks/useSessions';
import { colors } from '../../theme/colors';
import { RunningSession } from '../../types';

type RouteParams = {
  SessionDetail: {
    sessionId: string;
  };
};

export const SessionDetailScreen = () => {
  const route = useRoute<RouteProp<RouteParams, 'SessionDetail'>>();
  const navigation = useNavigation();
  const { sessionId } = route.params;
  const { getSessionById, deleteSession } = useSessions();

  const [session, setSession] = useState<RunningSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const data = await getSessionById(sessionId);
      setSession(data);
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this running session? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              const success = await deleteSession(sessionId);
              if (success) {
                navigation.goBack();
              } else {
                Alert.alert('Error', 'Failed to delete session');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete session');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  };

  const formatPace = (pace?: number) => {
    if (!pace) return '--';
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="alert-circle" size={48} color={colors.error} />
        <Text variant="titleMedium" style={styles.errorText}>
          Session not found
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text variant="headlineMedium" style={styles.title}>
                Running Session
              </Text>
              <View style={styles.dateTimeContainer}>
                <MaterialCommunityIcons name="calendar" size={16} color={colors.textSecondary} />
                <Text variant="bodyMedium" style={styles.dateText}>
                  {formatDate(session.date)}
                </Text>
              </View>
            </View>
            {session.completed && (
              <Chip style={styles.completedChip} textStyle={{ color: colors.white }}>
                Completed
              </Chip>
            )}
          </View>
        </View>

        {/* Main Stats */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <MaterialCommunityIcons name="map-marker-distance" size={32} color={colors.primary} />
                <Text variant="headlineLarge" style={styles.statValue}>
                  {session.distance ? session.distance.toFixed(2) : '--'}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  KILOMETERS
                </Text>
              </View>

              <View style={styles.statBox}>
                <MaterialCommunityIcons name="clock-outline" size={32} color={colors.primary} />
                <Text variant="headlineLarge" style={styles.statValue}>
                  {formatDuration(session.duration)}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  DURATION
                </Text>
              </View>

              <View style={styles.statBox}>
                <MaterialCommunityIcons name="speedometer" size={32} color={colors.primary} />
                <Text variant="headlineLarge" style={styles.statValue}>
                  {session.pace ? formatPace(session.pace).split(' ')[0] : '--'}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  PACE (/KM)
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Heart Rate & Calories */}
        {(session.heart_rate_avg || session.calories) && (
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Health Metrics
              </Text>

              <View style={styles.metricsRow}>
                {session.heart_rate_avg && (
                  <View style={styles.metric}>
                    <MaterialCommunityIcons name="heart-pulse" size={24} color={colors.error} />
                    <View>
                      <Text variant="headlineSmall" style={styles.metricValue}>
                        {session.heart_rate_avg} bpm
                      </Text>
                      <Text variant="bodySmall" style={styles.metricLabel}>
                        Avg Heart Rate
                      </Text>
                    </View>
                  </View>
                )}

                {session.heart_rate_max && (
                  <View style={styles.metric}>
                    <MaterialCommunityIcons name="heart-pulse" size={24} color={colors.error} />
                    <View>
                      <Text variant="headlineSmall" style={styles.metricValue}>
                        {session.heart_rate_max} bpm
                      </Text>
                      <Text variant="bodySmall" style={styles.metricLabel}>
                        Max Heart Rate
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {session.calories && (
                <>
                  <Divider style={styles.divider} />
                  <View style={styles.metric}>
                    <MaterialCommunityIcons name="fire" size={24} color={colors.warning} />
                    <View>
                      <Text variant="headlineSmall" style={styles.metricValue}>
                        {session.calories} cal
                      </Text>
                      <Text variant="bodySmall" style={styles.metricLabel}>
                        Calories Burned
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Notes */}
        {session.notes && (
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Notes
              </Text>
              <Text variant="bodyLarge" style={styles.notes}>
                {session.notes}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Session Info */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Session Details
            </Text>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                Source:
              </Text>
              <Chip compact style={styles.sourceChip}>
                {session.source === 'manual' ? 'Manual Entry' : 'Apple Watch'}
              </Chip>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                Logged:
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                {formatDate(session.created_at)} at {formatTime(session.created_at)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Delete Button */}
        <Button
          mode="outlined"
          onPress={handleDelete}
          style={styles.deleteButton}
          textColor={colors.error}
          loading={deleting}
          disabled={deleting}
          icon="delete"
        >
          Delete Session
        </Button>
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
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontWeight: 'bold',
    color: colors.text,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  dateText: {
    color: colors.textSecondary,
  },
  completedChip: {
    backgroundColor: colors.success,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  cardTitle: {
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  metricsRow: {
    gap: 16,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metricValue: {
    fontWeight: 'bold',
    color: colors.text,
  },
  metricLabel: {
    color: colors.textSecondary,
  },
  divider: {
    marginVertical: 16,
  },
  notes: {
    color: colors.text,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    color: colors.textSecondary,
  },
  infoValue: {
    color: colors.text,
  },
  sourceChip: {
    backgroundColor: colors.primary + '20',
  },
  deleteButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderColor: colors.error,
    borderRadius: 12,
  },
  errorText: {
    color: colors.error,
    marginTop: 8,
  },
});
