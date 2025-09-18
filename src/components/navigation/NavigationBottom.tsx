// components/NavigationBottom.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationList } from './NavigationList';
import { useTheme } from 'react-native-paper';
import { useIsMobileForTwoScreenWithDemention } from '@hooks/useIsMobile';

export function NavigationBottom() {
  const {colors} = useTheme();
  const dem = useIsMobileForTwoScreenWithDemention();
  
  if (!dem.isMobile) return <View/>;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} >
      <NavigationList isMobile={dem.isMobile} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});