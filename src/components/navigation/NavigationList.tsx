// components/NavigationList.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationItem } from './NavigationItem';
import { useTheme } from 'react-native-paper';

export interface Props {
  isMobile: boolean
}

export function NavigationList({isMobile}:Props) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        { backgroundColor: colors.background },
        isMobile ? styles.mobileContainer : styles.desktopContainer,
      ]}
    >
      <NavigationItem
        isMobile={isMobile}
        iconActive="revelcy-r"
        iconNotActive="revelcy-r"
        label="How it works"
        route="/following"
        horizontal={!isMobile}
      />
      <NavigationItem
        isMobile={isMobile}
        iconActive="plus"
        iconNotActive="plus"
        label="Create Premarket"
        route="/token/create"
        horizontal={!isMobile}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mobileContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  desktopContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // прижать влево
    alignItems: 'center',
    gap: 24,
    alignSelf: 'flex-start',
  },
});
