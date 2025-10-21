import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export const DashboardScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Dashboard</Text>
      <Text variant="bodyLarge">Welcome to PaceFlow!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
