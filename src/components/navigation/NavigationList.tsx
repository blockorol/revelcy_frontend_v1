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
        iconActive='binoculars'
        iconNotActive='binoculars-outlined'
        label="Explore"
        route="/discover"
        horizontal={!isMobile}
      />
      <NavigationItem
        isMobile={isMobile}
        iconActive="books"
        iconNotActive="books"
        label="Resources"
        route="/resources"
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 24,
    alignSelf: 'flex-start',
  },
});
