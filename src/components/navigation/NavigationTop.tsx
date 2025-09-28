// components/NavigationTop.tsx
import React, { useMemo } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, useWindowDimensions } from 'react-native';
import {Text} from 'react-native-paper'
import { NavigationProfileWidget } from './NavigationProfileWidget';
import { NavigationList } from './NavigationList';
import { useIsMobileForTwoScreenWithDemention } from '@hooks/useIsMobile';
import { router } from 'expo-router';
import { useNetwork } from '@providers/NetworkContext';

const H_PADDING = 16;
const GAP = 24;

export function NavigationTop() {
  const {network} = useNetwork()
  const dem = useIsMobileForTwoScreenWithDemention();
  const { width: vw } = useWindowDimensions();

  const rightWidth = useMemo(() => {
    const raw = vw - H_PADDING * 2 - dem.left.width - GAP;
    return Math.min(Math.max(raw, 400), 800);
  }, [vw, dem.left.width]);

  const innerWidth = H_PADDING * 2 + dem.left.width + GAP + rightWidth;

  const goHome = () => router.push('/');

  if (dem.isMobile) {
    return (
      <View style={styles.topOuter}>
        <View style={[styles.topInnerMobile, { paddingHorizontal: H_PADDING }]}>
          <TouchableOpacity onPress={goHome}>
            <Image
              source={require('@assets/revelcy_logo_long.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
            {network === 'devnet'&&<Text variant='headlineLarge' style={{color:'red'}}>DEV</Text>}
          <View style={styles.profile}>
            <NavigationProfileWidget />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.topOuter}>
      <View style={[styles.topInner, { width: innerWidth, paddingHorizontal: H_PADDING }]}>
        <View style={{ width: dem.left.width, flexShrink: 0 }}>
          <View style={styles.leftRow}>
            <TouchableOpacity onPress={goHome}>
              <Image
                source={require('@assets/revelcy_logo_long.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </TouchableOpacity>
            {network === 'devnet'&&<Text variant='headlineLarge' style={{color:'red'}}>DEV</Text>}
            <View style={{ marginLeft: 16 }}>
              <NavigationList isMobile={dem.isMobile} />
            </View>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <View style={styles.profile}>
          <NavigationProfileWidget />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topOuter: {
    width: '100%',
    alignItems: 'center',
  },
  // desktop
  topInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 0,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // mobile
  topInnerMobile: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 0,
  },
  logo: {
    width: 110,
    height: 30,
  },
  profile: {
    flexShrink: 0,
  },
});
