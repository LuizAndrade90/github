import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export const SessionsListScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Sessions</Text>
      <Text variant="bodyLarge">Your running sessions will appear here</Text>
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
