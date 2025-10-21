import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FadeInView } from './FadeInView';
import { colors } from '../theme/colors';

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <FadeInView style={styles.container}>
      <MaterialCommunityIcons name={icon as any} size={80} color={colors.textSecondary} />
      <Text variant="headlineSmall" style={styles.title}>
        {title}
      </Text>
      <Text variant="bodyLarge" style={styles.message}>
        {message}
      </Text>
      {actionLabel && onAction && (
        <Button
          mode="contained"
          onPress={onAction}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          {actionLabel}
        </Button>
      )}
    </FadeInView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    marginTop: 24,
    marginBottom: 12,
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  message: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    borderRadius: 12,
    marginTop: 8,
  },
  buttonContent: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
});
