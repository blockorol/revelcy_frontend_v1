import React, { useState, useMemo } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { useTheme, Menu, TouchableRipple, Divider } from "react-native-paper";
import { useIsMobileForTwoScreenWithDemention } from "@hooks/useIsMobile";
import { PremarketList } from "@components/premarket/PremarketList";
import { useRouter } from "expo-router";
import { PublicKey } from "@solana/web3.js";
import RevelcySegmentedButtons from "@components/ui/SegmentedButton";
import { SvgIcon } from "@components/base/SvgIcon";
import { AppTheme } from "@theme/types";
import { Text } from "@components/ui/Text";
import { useAuth } from "@providers/AuthContext";

const H_PADDING = 16;
const GAP = 24;

type OrderValue = "FRESH" | "ACHIEVED" | "TOP_MCAP" | "LOW_MCAP" | "EARLY_DEADLINE" | "LATE_DEADLINE";

type PropsOrderMenu = {
  value: OrderValue;
  onChange: (v: OrderValue) => void;
  anchor?: React.ReactNode;
  isMobile?: boolean;
};

const OrderMenu: React.FC<PropsOrderMenu> = ({ value, onChange, anchor, isMobile = false }) => {
  const { colors } = useTheme() as AppTheme;
  const [visible, setVisible] = useState(false);

  const open = () => setVisible(true);
  const close = () => setVisible(false);

  const defs = useMemo(
    () => ([
      { label: "Fresh", icon: "plant-outlined" as const, target: "FRESH" as const },
      { label: "Achieved", icon: "percent" as const, target: "ACHIEVED" as const },
      { label: "Top Mcap", icon: "two-coins" as const, target: "TOP_MCAP" as const },
      { label: "Low Mcap", icon: "one-coin" as const, target: "LOW_MCAP" as const },
      { label: "Early Deadline", icon: "rocket-side" as const, target: "EARLY_DEADLINE" as const },
      { label: "Late Deadline", icon: "rocket" as const, target: "LATE_DEADLINE" as const },
    ]),
    []
  );

  const items = useMemo(() => {
    const cur = defs.find(d => d.target === value)!;
    const rest = defs.filter(d => d.target !== value);
    return [cur, ...rest];
  }, [defs, value]);

  const commonItemStyle = {
    height: 40,
    paddingRight: 12,
    paddingLeft: 32,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  };

  const contentStyle = useMemo(
    () => ({
      backgroundColor: colors.surfaceContainerHigh,
      borderRadius: 8,
      padding: 0,
      overflow: "hidden" as const,
    }),
    [colors.surfaceContainerHigh]
  );

  const Item: React.FC<{ label: string; icon: "plant-outlined" | "percent" | "buy" | "rocket" | "rocket-side" | "one-coin" | "two-coins"; target: OrderValue; active?: boolean; }> =
  ({ label, icon, target, active }) => {
    const fg = active ? colors.primary : colors.onSurface;
    const bg = active ? colors.onPrimary : colors.surfaceContainerHigh;

    return (
      <TouchableRipple
        onPress={() => { onChange(target); close(); }}
        style={[commonItemStyle, { backgroundColor: bg }]}
      >
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: 'flex-end', gap: 4}}>
          <Text variant='labelMedium' prominent style={{ color: fg }}>{label}</Text>
          <SvgIcon name={icon as any} size={16} color={fg} />
        </View>
      </TouchableRipple>
    );
  };

  const currentDef = items[0];
  const anchorFg = visible ? colors.onSecondaryContainer : colors.primary;
  const anchorBg = visible ? colors.secondaryContainer : "transparent";

  const defaultAnchor = (
    <TouchableRipple
      onPress={open}
      style={{
        borderRadius: 8,
        backgroundColor: anchorBg,
        paddingRight: isMobile ? 12 : 0,
        paddingLeft: isMobile ? 12 : 32,
        height: 40,
        alignSelf: "flex-start",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {isMobile ? (
        <SvgIcon name="sort-arrows" size={20} color={colors.onBackground}/>
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text variant="labelMedium" prominent style={{ color: anchorFg }}>
            {currentDef.label}
          </Text>
          <SvgIcon name={currentDef.icon as any} size={16} color={anchorFg} />
        </View>
      )}
    </TouchableRipple>
  );

  return (
    <Menu
      visible={visible}
      onDismiss={close}
      anchor={anchor ?? defaultAnchor}
      contentStyle={contentStyle}
    >
      <Item label={items[0].label} icon={items[0].icon} target={items[0].target} active />

      <Divider style={{ opacity: 0.12 }} />

      {items.slice(1).map(it => (
        <Item key={it.target} label={it.label} icon={it.icon} target={it.target} />
      ))}
    </Menu>
  );
};

export default function PremarketsPage() {
  const theme = useTheme();
  const { colors } = theme;
  const dem = useIsMobileForTwoScreenWithDemention();
  const { isMobile } = dem;
  const { width: vw } = useWindowDimensions();
  const { user } = useAuth();
  const [filterValue, setFilterValue] = useState<"premarket" | "launched" | "my_tokens">("premarket");
  const [order, setOrder] = useState<OrderValue>("FRESH");

  const rightWidth = useMemo(() => {
    const raw = vw - H_PADDING * 2 - dem.left.width - GAP;
    return Math.min(Math.max(raw, 400), 800);
  }, [vw, dem.left.width]);

  const innerWidth = H_PADDING * 2 + dem.left.width + GAP + rightWidth;

  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 12,
        gap: 12,
        backgroundColor: colors.background,
        flex: 1,
      }}
    >
      <View style={[isMobile ? styles.topInnerMobile : styles.topInner, !isMobile && { width: innerWidth, paddingHorizontal: H_PADDING  }]}> 
        <View style={styles.segmentedButtonWrapper}>
          <RevelcySegmentedButtons
            value={filterValue}
            onValueChange={(value: string) => setFilterValue(value as "premarket" | "launched" | "my_tokens")}
            buttons={[
              {
                value: "premarket",
                label: "Premarket",
                checkedColor: theme.colors.secondary,
                uncheckedColor: theme.colors.onSurfaceVariant
              },
              {
                value: "launched",
                label: "Launched",
                checkedColor: theme.colors.primary,
                uncheckedColor: theme.colors.onSurfaceVariant
              },
              {
                value: "my_tokens",
                label: "My Tokens",
                checkedColor: theme.colors.onSurface,
                uncheckedColor: theme.colors.onSurfaceVariant
              },
            ]}
            baseBackgroundColor="transparent"
            baseTextColor={colors.onSurfaceVariant}
          />
        </View>
        <OrderMenu value={order} onChange={setOrder} isMobile={isMobile} />
      </View>

      <PremarketList 
        initialLimit={30} 
        style={{ flex: 1 }} 
        filter={filterValue}
        userWalletAddress={user?.walletAddress}
        order={order}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // desktop
  topInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "center",
    paddingVertical: 0,
  },
  topInnerMobile: {
    height: 56,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 0,
  },
  segmentedButtonWrapper: {
    alignSelf: "center",
  },
});
