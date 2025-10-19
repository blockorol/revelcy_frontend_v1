// components/NavigationTop.tsx
import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { NavigationProfileWidget } from "./NavigationProfileWidget";
import { NavigationList } from "./NavigationList";
import { useIsMobileForTwoScreenWithDemention } from "@hooks/useIsMobile";
import { router } from "expo-router";
import { useNetwork } from "@providers/NetworkContext";
import NavigationBurgerMenu from "@components/navigation/NavigationBurgerMenu";
import { useTheme } from "react-native-paper";
import { Text } from "@components/ui/Text";

const H_PADDING = 16;
const GAP = 24;

export function NavigationTop() {
  const { colors } = useTheme();
  const { network } = useNetwork();
  const dem = useIsMobileForTwoScreenWithDemention();
  const { width: vw } = useWindowDimensions();

  const rightWidth = useMemo(() => {
    const raw = vw - H_PADDING * 2 - dem.left.width - GAP;
    return Math.min(Math.max(raw, 400), 800);
  }, [vw, dem.left.width]);

  const innerWidth = H_PADDING * 2 + dem.left.width + GAP + rightWidth;

  const goHome = () => router.push("/");

  if (dem.isMobile) {
    return (
      <View style={[styles.topInnerMobile, { paddingHorizontal: H_PADDING }]}>
        <TouchableOpacity onPress={goHome}>
          <View style={{ flexDirection: "row", alignItems: 'center' }}>
            <Image
              source={require("@assets/revelcy_logo_long.png")}
              style={{width: 96, height:24}}
              resizeMode="contain"
            />
            {network === "devnet" && (
              <Text
                variant="labelSmall"
                prominent
                style={{
                  marginBottom: 20,
                  marginLeft: 5,
                  paddingHorizontal: 5,
                  color: colors.onSecondary,
                  backgroundColor: colors.secondary,
                  borderRadius: 5,
                }}
              >
                DEV
              </Text>
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.profile}>
          <NavigationProfileWidget isMobile />
          <NavigationBurgerMenu />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.topOuter}>
      <View
        style={[
          styles.topInner,
          { width: innerWidth, paddingHorizontal: H_PADDING },
        ]}
      >
        <View style={{ width: dem.left.width, flexShrink: 0 }}>
          <View style={styles.leftRow}>
            <TouchableOpacity onPress={goHome}>
              <Image
                source={require("@assets/revelcy_logo_long.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </TouchableOpacity>
            {network === "devnet" && (
              <Text
                variant="labelSmall"
                prominent
                style={{
                  marginBottom: 20,
                  marginLeft: 5,
                  paddingHorizontal: 5,
                  color: colors.onSecondary,
                  backgroundColor: colors.secondary,
                  borderRadius: 5,
                }}
              >
                DEV
              </Text>
            )}
            <View style={{ marginLeft: 64 }}>
              <NavigationList isMobile={dem.isMobile} />
            </View>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <View style={styles.profile}>
          <NavigationProfileWidget isMobile={false} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topOuter: {
    width: "100%",
    alignItems: "center",
  },
  // desktop
  topInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 0,
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  // mobile
  topInnerMobile: {
    height: 56,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 0,
  },
  logo: {
    paddingVertical: 16,
    width: 96,
    height: 24,
  },
  profile: {
    paddingVertical: 13,
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
