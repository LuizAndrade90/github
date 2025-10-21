import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';

import { GuidesListScreen } from '../screens/guides/GuidesListScreen';
import { GuideDetailScreen } from '../screens/guides/GuideDetailScreen';
import { CreateCustomGuideScreen } from '../screens/guides/CreateCustomGuideScreen';
import { GuidesStackParamList } from '../types';

const Stack = createNativeStackNavigator<GuidesStackParamList>();

export const GuidesNavigator = () => {
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
        name="GuidesList"
        component={GuidesListScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="GuideDetail"
        component={GuideDetailScreen}
        options={{
          title: 'Guide Details',
          headerBackTitle: 'Guides',
        }}
      />
      <Stack.Screen
        name="CreateCustomGuide"
        component={CreateCustomGuideScreen}
        options={{
          title: 'Create Custom Guide',
          headerBackTitle: 'Guides',
        }}
      />
    </Stack.Navigator>
  );
};
