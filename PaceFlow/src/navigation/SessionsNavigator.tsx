import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';

import { SessionsListScreen } from '../screens/sessions/SessionsListScreen';
import { AddSessionScreen } from '../screens/sessions/AddSessionScreen';
import { SessionDetailScreen } from '../screens/sessions/SessionDetailScreen';
import { SessionsStackParamList } from '../types';

const Stack = createNativeStackNavigator<SessionsStackParamList>();

export const SessionsNavigator = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen
        name="SessionsList"
        component={SessionsListScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AddSession"
        component={AddSessionScreen}
        options={{
          title: 'Add Running Session',
          headerBackTitle: 'Sessions',
        }}
      />
      <Stack.Screen
        name="SessionDetail"
        component={SessionDetailScreen}
        options={{
          title: 'Session Details',
          headerBackTitle: 'Sessions',
        }}
      />
    </Stack.Navigator>
  );
};
