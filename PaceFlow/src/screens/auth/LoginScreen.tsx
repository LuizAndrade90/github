import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';

export const LoginScreen = () => {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in:', error);
      // TODO: Show error toast/snackbar
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="displayMedium" style={styles.title}>
            PaceFlow
          </Text>
          <Text variant="titleMedium" style={styles.subtitle}>
            AI-Powered Running Coach
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureItem
            icon="🏃"
            text="Personalized training plans"
          />
          <FeatureItem
            icon="📊"
            text="Track your progress"
          />
          <FeatureItem
            icon="⌚"
            text="Apple Watch integration"
          />
          <FeatureItem
            icon="🤖"
            text="AI-generated custom guides"
          />
        </View>

        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleGoogleSignIn}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              'Continue with Google'
            )}
          </Button>

          <Text variant="bodySmall" style={styles.disclaimer}>
            7-day free trial, then $7/month. Cancel anytime.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const FeatureItem = ({ icon, text }: { icon: string; text: string }) => (
  <View style={styles.featureItem}>
    <Text variant="headlineSmall">{icon}</Text>
    <Text variant="bodyLarge" style={styles.featureText}>
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  features: {
    gap: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureText: {
    flex: 1,
    color: colors.text,
  },
  footer: {
    gap: 16,
    marginBottom: 24,
  },
  button: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  disclaimer: {
    textAlign: 'center',
    color: colors.textSecondary,
  },
});
