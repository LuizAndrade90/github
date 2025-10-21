import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, List, Divider, Dialog, Portal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';

export const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const [signOutDialog, setSignOutDialog] = useState(false);

  const getSubscriptionStatusColor = (status?: string) => {
    switch (status) {
      case 'trial':
        return colors.info;
      case 'active':
        return colors.success;
      case 'cancelled':
        return colors.warning;
      case 'expired':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getSubscriptionStatusText = (status?: string) => {
    switch (status) {
      case 'trial':
        return 'Free Trial';
      case 'active':
        return 'Active';
      case 'cancelled':
        return 'Cancelled';
      case 'expired':
        return 'Expired';
      default:
        return 'Unknown';
    }
  };

  const getDaysRemaining = () => {
    if (!user?.subscription_end_date) return null;

    const endDate = new Date(user.subscription_end_date);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const daysRemaining = getDaysRemaining();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* User Info */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <View style={styles.userHeader}>
              <View style={styles.avatar}>
                <MaterialCommunityIcons name="account" size={40} color={colors.primary} />
              </View>
              <View style={styles.userInfo}>
                <Text variant="titleLarge" style={styles.userName}>
                  {user?.full_name || 'Runner'}
                </Text>
                <Text variant="bodyMedium" style={styles.userEmail}>
                  {user?.email}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Subscription Info */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Subscription
            </Text>

            <View style={styles.subscriptionInfo}>
              <View style={styles.subscriptionRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Status
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getSubscriptionStatusColor(user?.subscription_status) + '20' },
                  ]}
                >
                  <Text
                    variant="bodyMedium"
                    style={[styles.statusText, { color: getSubscriptionStatusColor(user?.subscription_status) }]}
                  >
                    {getSubscriptionStatusText(user?.subscription_status)}
                  </Text>
                </View>
              </View>

              {daysRemaining !== null && user?.subscription_status !== 'expired' && (
                <View style={styles.subscriptionRow}>
                  <Text variant="bodyMedium" style={styles.label}>
                    {user?.subscription_status === 'trial' ? 'Trial ends in' : 'Renews in'}
                  </Text>
                  <Text variant="bodyMedium" style={styles.value}>
                    {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
                  </Text>
                </View>
              )}

              <View style={styles.subscriptionRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Plan
                </Text>
                <Text variant="bodyMedium" style={styles.value}>
                  {user?.subscription_status === 'expired' ? 'Free' : 'Premium - $7/month'}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            {user?.subscription_status === 'trial' && (
              <Button
                mode="contained"
                onPress={() => Alert.alert('Coming Soon', 'Stripe integration requires setup. See docs/STRIPE_SETUP.md')}
                style={styles.button}
              >
                Subscribe Now
              </Button>
            )}

            {user?.subscription_status === 'active' && (
              <Button
                mode="outlined"
                onPress={() => Alert.alert('Coming Soon', 'Manage subscription via Stripe Customer Portal')}
                style={styles.button}
              >
                Manage Subscription
              </Button>
            )}

            {user?.subscription_status === 'expired' && (
              <Button
                mode="contained"
                onPress={() => Alert.alert('Coming Soon', 'Stripe integration requires setup')}
                style={styles.button}
              >
                Start 7-Day Trial
              </Button>
            )}
          </Card.Content>
        </Card>

        {/* Settings */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Settings
            </Text>

            <List.Item
              title="Edit Profile"
              left={(props) => <List.Icon {...props} icon="account-edit" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Coming Soon', 'Edit profile feature')}
            />

            <Divider />

            <List.Item
              title="Units & Preferences"
              left={(props) => <List.Icon {...props} icon="cog" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Coming Soon', 'Settings feature')}
            />

            <Divider />

            <List.Item
              title="Connect Apple Watch"
              left={(props) => <List.Icon {...props} icon="watch" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Apple HealthKit', 'HealthKit integration requires iOS device. See Step 10.')}
            />
          </Card.Content>
        </Card>

        {/* About */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              About
            </Text>

            <List.Item
              title="Help & Support"
              left={(props) => <List.Icon {...props} icon="help-circle" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Help', 'Contact support: support@paceflow.app')}
            />

            <Divider />

            <List.Item
              title="Privacy Policy"
              left={(props) => <List.Icon {...props} icon="shield-account" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Privacy', 'Privacy policy link')}
            />

            <Divider />

            <List.Item
              title="Terms of Service"
              left={(props) => <List.Icon {...props} icon="file-document" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Terms', 'Terms of service link')}
            />

            <Divider />

            <List.Item
              title="App Version"
              description="1.0.0"
              left={(props) => <List.Icon {...props} icon="information" />}
            />
          </Card.Content>
        </Card>

        {/* Sign Out */}
        <Button
          mode="outlined"
          onPress={() => setSignOutDialog(true)}
          style={[styles.button, styles.signOutButton]}
          textColor={colors.error}
        >
          Sign Out
        </Button>
      </ScrollView>

      {/* Sign Out Confirmation Dialog */}
      <Portal>
        <Dialog visible={signOutDialog} onDismiss={() => setSignOutDialog(false)}>
          <Dialog.Title>Sign Out</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to sign out?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSignOutDialog(false)}>Cancel</Button>
            <Button
              onPress={() => {
                setSignOutDialog(false);
                handleSignOut();
              }}
              textColor={colors.error}
            >
              Sign Out
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  sectionTitle: {
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    color: colors.text,
  },
  userEmail: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  subscriptionInfo: {
    gap: 12,
  },
  subscriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: colors.textSecondary,
  },
  value: {
    color: colors.text,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 14,
  },
  divider: {
    marginVertical: 16,
  },
  button: {
    borderRadius: 12,
  },
  signOutButton: {
    borderColor: colors.error,
    marginBottom: 16,
  },
});
