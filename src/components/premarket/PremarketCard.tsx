import React, { memo, useMemo } from "react";
import { View, Pressable } from "react-native";
import { Text, Avatar, useTheme } from "react-native-paper";
import { formatDistanceToNow } from "date-fns";
import { router } from "expo-router";
import { SvgIcon } from "@components/base/SvgIcon";
import { TokenMainInfo } from "@api/token";

type PremarketCardProps = {
  mainInfo: TokenMainInfo;
  raisedLamports?: string | number; 
  compact?: boolean; // for future
};

export const PremarketCard: React.FC<PremarketCardProps> = memo(({ mainInfo, raisedLamports, compact = true }) => {
  const { colors } = useTheme();

  const goalSOL = useMemo(() => {
    const lamp = mainInfo.premarketGoalSolLamp.toString();
    return lamportsToSol(lamp);
  }, [mainInfo.premarketGoalSolLamp]);

  const raisedSOL = useMemo(() => {
    if (raisedLamports == null) return undefined;
    const lamp = typeof raisedLamports === "number" ? raisedLamports : parseInt(String(raisedLamports), 10);
    return lamportsToSol(lamp);
  }, [raisedLamports]);

  const deadlineIn = useMemo(() => {
    const ms = (mainInfo.premarketDeadline ?? 0) * 1000;
    if (!ms) return undefined;
    return formatDistanceToNow(ms, { addSuffix: false });
  }, [mainInfo.premarketDeadline]);

  const createdAgo = useMemo(() => {
    const ms = (mainInfo.premarketCreated ?? 0) * 1000;
    if (!ms) return undefined;
    return formatDistanceToNow(ms, { addSuffix: false });
  }, [mainInfo.premarketCreated]);

  const stateColor = useMemo(() => {
    switch (mainInfo.state) {
      case "premarket": return colors.primary;
      case "canceled": return colors.error;
      case "finished": return colors.secondary;
      default: return colors.onSurfaceVariant;
    }
  }, [mainInfo.state, colors]);

  const pubkeyStr = useMemo(() => {
    if (!mainInfo.premarketPubkey) return "";
    if (typeof mainInfo.premarketPubkey === "string") return mainInfo.premarketPubkey;
    if (typeof mainInfo.premarketPubkey?.toBase58 === "function") return mainInfo.premarketPubkey.toBase58();
    return String(mainInfo.premarketPubkey);
  }, [mainInfo.premarketPubkey]);

  const progressPct = useMemo(() => {
    if (raisedSOL == null || !goalSOL) return undefined;
    const pct = Math.max(0, Math.min(100, (raisedSOL / goalSOL) * 100));
    return pct;
  }, [raisedSOL, goalSOL]);

  const goToDetails = () => {
    if (pubkeyStr) router.push(`/token/${pubkeyStr}`);
  };

  return (
    <Pressable onPress={goToDetails} style={{ width: 368 }}>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 24,
          padding: 20,
          width: 368,
          minHeight: 140,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <Avatar.Image
            size={48}
            source={
              mainInfo.imageURL
                ? { uri: mainInfo.imageURL }
                : require("@assets/avatar-placeholder.png")
            }
          />
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="labelLarge" style={{ color: colors.onSurface }}>
              {mainInfo.name}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>
                {mainInfo.symbol}
              </Text>
              {mainInfo.state && (
                <View
                  style={{
                    backgroundColor: colors.surfaceVariant,
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }}
                >
                  <Text variant="labelSmall" style={{ color: stateColor }}>
                    {mainInfo.state}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Goal */}
          <View style={{ alignItems: "flex-end", gap: 2 }}>
            <Text variant="labelLarge" style={{ color: colors.onSurface, fontWeight: "700" }}>
              {goalSOL.toFixed(1)} SOL
            </Text>
            <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>
              Goal
            </Text>
          </View>
        </View>

        {/* Body rows */}
        <View style={{ height: 12 }} />

        {/* Progress / Deadline */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <SvgIcon name='binoculars' size={20} color={colors.onSurface} style={{ paddingRight: 4 }} />
          {deadlineIn && (
            <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>
              Deadline <Text variant="labelMedium" style={{ color: colors.onSurface, fontWeight: "700" }}>{deadlineIn}</Text>
            </Text>
          )}
          {createdAgo && (
            <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>
              Created <Text variant="labelMedium" style={{ color: colors.onSurface, fontWeight: "700" }}>{createdAgo}</Text>
            </Text>
          )}
        </View>

        {/* Links row */}
        {(mainInfo.links?.telegram || mainInfo.links?.twitter || mainInfo.links?.webSite) && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 }}>
            {mainInfo.links?.telegram && <SvgIcon name='tg-logo' size={20} color={colors.onSurface} />}
            {mainInfo.links?.twitter && <SvgIcon name='x-logo' size={20} color={colors.onSurface} />}
            {mainInfo.links?.webSite && <SvgIcon name='world-outlined' size={20} color={colors.onSurface} />}
          </View>
        )}

        {/* Progress bar (if raised exist) */}
        {progressPct != null && (
          <View style={{ marginTop: 12 }}>
            <View
              style={{
                height: 8,
                borderRadius: 999,
                backgroundColor: colors.surfaceVariant,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${progressPct}%`,
                  height: "100%",
                  backgroundColor: colors.primary,
                }}
              />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
              <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
                {raisedSOL?.toFixed(2)} / {goalSOL.toFixed(2)} SOL
              </Text>
              <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
                {progressPct.toFixed(0)}%
              </Text>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
});

const lamportsToSol = (x: string | number) => {
  const n = typeof x === "number" ? x : parseInt(x, 10);
  return n / 1_000_000_000;
};