import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider, ActivityIndicator } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';

import { theme } from './src/theme/theme';
import { MainNavigator } from './src/navigation/MainNavigator';
import { AuthProvider, useAuth } from './src/hooks/useAuth';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { OnboardingScreen } from './src/screens/auth/OnboardingScreen';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { colors } from './src/theme/colors';

function RootNavigator() {
  const { session, user, loading } = useAuth();

  // DEV MODE: Skip authentication for testing
  const DEV_MODE = process.env.EXPO_PUBLIC_DEV_MODE === 'true';

  if (DEV_MODE) {
    return <MainNavigator />;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Not authenticated - show login
  if (!session) {
    return <LoginScreen />;
  }

  // Authenticated but no user profile - show onboarding
  if (!user) {
    return <OnboardingScreen />;
  }

  // Authenticated and has profile - show main app
  return <MainNavigator />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <NavigationContainer>
              <StatusBar style="dark" />
              <RootNavigator />
            </NavigationContainer>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
