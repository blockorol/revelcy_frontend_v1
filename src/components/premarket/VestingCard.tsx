import React, { useMemo, useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { IconButton, Text, useTheme } from "react-native-paper";
import { ExtendedMD3Colors } from "@theme/types";
import { TokenDynamicInfo } from "@api/token";
import { toVestingVMFromTokenDecBN } from "@utils/vesting";
import { SvgIcon } from "@components/base/SvgIcon";
import { clamp } from "@utils/numbers";
import { hexToRgba } from "@utils/colors";
import { formatDateTime } from "@utils/premarket";

export function VestingCard({
  vesting,
  isMobile,
}: {
  vesting?: TokenDynamicInfo["vesting"];
  isMobile: boolean;
}) {
  const theme = useTheme();
  const colors = theme.colors as ExtendedMD3Colors;

  const vm = useMemo(() => {
    if (!vesting) return null;
    return toVestingVMFromTokenDecBN({
      total: vesting.total_amount,
      vested: vesting.total_vested,
      claimed: vesting.total_claimed,
    });
  }, [vesting]);

  if (!vesting || !vm) return null;

  const start = Number(vesting.starttime_ms ?? 0);
  const end = Number(vesting.endtime_ms ?? 0);
  const showTimeline = start > 0 && end > start;

  const GAP_Y = 14;
  const GAP_BEFORE_BAR = 8;
  const BAR_H = 4;
  const R = BAR_H / 2;
  const SEGMENT_GAP_PX = 4;
  const NOW_WRAP_HALF_W = 12;

  const vestedPct = clamp(vm.vestedPct, 0, 100);
  const claimedPct = clamp(vm.claimedPct, 0, vestedPct);

  const vestedColor = hexToRgba(theme.colors.primary, 0.2); 
  const claimedColor = theme.colors.primary; 
  const trackColor = colors.outlineVariant;

  const [trackW, setTrackW] = useState(0);
  const onBarLayout = useCallback((e: any) => {
    const w = e?.nativeEvent?.layout?.width ?? 0;
    if (typeof w === "number" && w > 0) setTrackW(w);
  }, []);

  const { vestedW, restW, gapW, claimedW, markerX } = useMemo(() => {
    if (trackW <= 0) return { vestedW: 0, restW: 0, gapW: 0, claimedW: 0, markerX: 0 };

    const vested = clamp(vestedPct, 0, 100);
    const claimed = clamp(claimedPct, 0, vested);
    const claimedInsideVested = vested > 0 ? claimed / vested : 0;

    const hasGreen = vestedPct > 0;
    const hasGrey = vestedPct < 100;
    const rawVestedW = (trackW * vested) / 100;

    const gW = hasGreen && hasGrey ? SEGMENT_GAP_PX : 0;

    const vW = Math.max(0, rawVestedW - (hasGrey ? gW : 0));
    const rW = Math.max(0, trackW - rawVestedW - gW);

    const cW = vW > 0 ? vW * claimedInsideVested : 0;

    const now = Date.now();
    const timelineProgress = showTimeline ? (now - start) / (end - start) : vested / 100;
    const mX = clamp(trackW * timelineProgress, 0, trackW);

    return { vestedW: vW, gapW: gW, restW: rW, claimedW: cW, markerX: mX };
  }, [trackW, vestedPct, claimedPct, showTimeline, start, end]);

  return (
    <View
      style={[
        styles.card,
        {
          width: "100%",
          backgroundColor: isMobile ? "transparent" : colors.surfaceContainerLowest,
          borderRadius: isMobile ? 0 : 20,
          padding: isMobile ? 16 : 24,
        },
      ]}
    >
      {/* 1) Header */}
      <View style={styles.headerRow}>
        <Text variant="titleMedium" style={{ color: colors.onSurface, fontWeight: "700" }}>
          Vesting
        </Text>
        <IconButton
          icon="information-outline"
          size={18}
          iconColor={colors.onSurfaceVariant}
          style={{ margin: 0 }}
          onPress={() => {}}
        />
      </View>

      <View style={{ height: GAP_Y }} />

      {/* 2) Percent row */}
      <View style={styles.percentRow}>
        <View style={styles.pill}>
          <View style={[styles.dot, { backgroundColor: vestedColor }]} />
          <Text style={{ color: colors.onSurface, fontWeight: "700" }}>
            {Math.round(vestedPct)}%
          </Text>
          <Text style={{ color: colors.onSurfaceVariant, fontWeight: "500" }}>
            Vested
          </Text>
        </View>

        <View style={styles.pill}>
          <View style={[styles.dot, { backgroundColor: claimedColor }]} />
          <Text style={{ color: colors.onSurface, fontWeight: "700" }}>
            {Math.round(claimedPct)}%
          </Text>
          <Text style={{ color: colors.onSurfaceVariant, fontWeight: "500" }}>
            Claimed
          </Text>
        </View>
      </View>

      <View style={{ height: GAP_Y + GAP_BEFORE_BAR }} />

      {/* 3) Bar + Today marker */}
      <View style={{ position: "relative" }} onLayout={onBarLayout}>
        {/* Marker (Now) below the bar, triangle points UP */}
        {trackW > 0 && (
          <View style={[styles.nowWrap, { left: clamp(markerX, NOW_WRAP_HALF_W, Math.max(NOW_WRAP_HALF_W, trackW - NOW_WRAP_HALF_W)) }]}>
            <View
              style={[
                styles.triangleUp,
                { borderBottomColor: theme.colors.primary },
              ]}
            />
            <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: "700", marginTop: 2 }}>
              Now
            </Text>
          </View>
        )}

        {/* Track */}
        <View style={{ height: BAR_H }}>
          <View style={{ flexDirection: "row", height: "100%", alignItems: "center" }}>
            {/* Vested capsule */}
            {vestedW > 0 && (
              <View
                style={{
                  width: vestedW,
                  height: "100%",
                  backgroundColor: vestedColor,
                  borderRadius: R,
                  overflow: "hidden",
                }}
              >
                {/* Claimed inside vested */}
                {claimedW > 0 && (
                  <View
                    style={{
                      width: claimedW,
                      height: "100%",
                      backgroundColor: claimedColor,
                      borderRadius: R,
                    }}
                  />
                )}
              </View>
            )}

              {/* GAP */}
            {gapW > 0 && <View style={{ width: gapW, height: "100%" }} />}

              {/* Серый сегмент */}
            {restW > 0 && (
              <View
                style={{
                  width: restW,
                  height: "100%",
                  backgroundColor: trackColor,
                  borderRadius: R,
                }}
              />
            )}
          </View>
        </View>

        {showTimeline && (
          <View style={styles.datesRow}>
            <Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>
              {formatDateTime(start)}
            </Text>
            <Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>
              {formatDateTime(end)}
            </Text>
          </View>
        )}
      </View>

      <View style={{ height: GAP_Y + GAP_BEFORE_BAR }} />

      {/* 4) Footer hint */}
      <View style={styles.hintRow}>
        <SvgIcon name="info-circle" color={colors.primary} size={24} />
        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, flex: 1 }}>
          All premarket participants, including creator, follow same vesting schedule
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "visible",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  percentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  datesRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  nowWrap: {
    position: "absolute",
    bottom: -3,
    transform: [{ translateX: -12 }],
    alignItems: "center",
  },
  triangleUp: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
  },
});
