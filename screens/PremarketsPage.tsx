import React, { useMemo } from "react";
import { View, useWindowDimensions } from "react-native";
import { useTheme } from "react-native-paper";
import { useIsMobileForTwoScreenWithDemention } from "@hooks/useIsMobile";
import { PremarketList } from "@components/premarket/PremarketList";

const H_PADDING = 16;
const GAP = 24;

export default function PremarketsPage() {
  const theme = useTheme();
  const { colors } = theme;
  const dem = useIsMobileForTwoScreenWithDemention();
  const { width: vw } = useWindowDimensions();

  // Calculate innerWidth exactly the same way as NavigationTop
  const innerWidth = useMemo(() => {
    if (dem.isMobile) {
      return undefined; // Full width on mobile
    }
    const rightWidth = (() => {
      const raw = vw - H_PADDING * 2 - dem.left.width - GAP;
      return Math.min(Math.max(raw, 400), 800);
    })();
    return H_PADDING * 2 + dem.left.width + GAP + rightWidth;
  }, [vw, dem.left.width, dem.isMobile]);

  // Content width (innerWidth minus padding)
  const contentWidth = useMemo(() => {
    if (!innerWidth) return undefined;
    return innerWidth - H_PADDING * 2;
  }, [innerWidth]);

  return (
    <View
      style={{
        paddingTop: 12,
        paddingBottom: dem.isMobile ? 70 : undefined,
        backgroundColor: colors.background,
        flex: 1,
      }}
    >
      {dem.isMobile ? (
        <View style={{ flex: 1, width: "100%", paddingHorizontal: H_PADDING }}>
          <PremarketList initialLimit={30} style={{ flex: 1 }} />
        </View>
      ) : (
        <View style={{ width: "100%", alignItems: "center", flex: 1 }}>
          <View
            style={{
              width: innerWidth,
              paddingHorizontal: H_PADDING,
              flex: 1,
            }}
          >
            <PremarketList
              initialLimit={30}
              style={{ flex: 1 }}
              containerWidth={contentWidth}
            />
          </View>
        </View>
      )}
    </View>
  );
}
