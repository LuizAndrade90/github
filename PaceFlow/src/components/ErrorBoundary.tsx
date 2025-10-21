import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // Here you could log to an error reporting service like Sentry
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <MaterialCommunityIcons name="alert-circle" size={64} color={colors.error} />
          <Text variant="headlineSmall" style={styles.title}>
            Oops! Something went wrong
          </Text>
          <Text variant="bodyMedium" style={styles.message}>
            We're sorry for the inconvenience. The app encountered an unexpected error.
          </Text>
          {__DEV__ && this.state.error && (
            <View style={styles.errorDetails}>
              <Text variant="bodySmall" style={styles.errorText}>
                {this.state.error.toString()}
              </Text>
            </View>
          )}
          <Button mode="contained" onPress={this.handleReset} style={styles.button}>
            Try Again
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
    color: colors.text,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  message: {
    marginBottom: 24,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorDetails: {
    padding: 12,
    marginBottom: 24,
    backgroundColor: colors.error + '20',
    borderRadius: 8,
    maxWidth: '100%',
  },
  errorText: {
    color: colors.error,
    fontFamily: 'monospace',
  },
  button: {
    borderRadius: 12,
    paddingHorizontal: 24,
  },
});
