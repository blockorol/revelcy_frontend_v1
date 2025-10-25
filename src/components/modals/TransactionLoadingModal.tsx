import React from 'react';
import { View } from 'react-native';
import { useTheme, ActivityIndicator } from 'react-native-paper';
import { Text } from '@components/ui/Text';
import { ExtendedMD3Colors } from '@theme/types';

interface TransactionLoadingModalProps {
  launchState: string;
}

export default function TransactionLoadingModal({ launchState }: TransactionLoadingModalProps) {
  const theme = useTheme();
  const colors = theme.colors as ExtendedMD3Colors;

  return (
    <View
      style={{
        backgroundColor: colors.surfaceContainerHighest,
        gap: 20,
        padding: 24,
        borderRadius: 16,
        minWidth: 300,
        maxWidth: 400,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text variant="titleMedium" style={{ textAlign: 'center' }}>
        {launchState}
      </Text>
      <ActivityIndicator
        animating
        color={theme.colors.primary}
        size="large"
      />
    </View>
  );
}
