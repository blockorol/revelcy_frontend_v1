import React, { memo, useMemo } from "react";
import { View, Pressable, Image } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { router } from "expo-router";
import { SvgIcon } from "@components/base/SvgIcon";
import { ChipDisplay } from '@components/ui/Chip';
import { RoundIconLink } from "@components/premarket/RoundIcons";
import { getTimeLeftLabel, convertDecimalToToken, convertLamportToSmallCount, formatNumberCompact, convertTimeStampToDataMonth } from "@utils/premarket";
import shortString from "@utils/address_shorter";
import { TokenMainInfo, TokenDynamicInfo } from "@api/token";
import { AvatarGroup } from "@components/base/AvatarGroup";
import Svg, { Path } from 'react-native-svg';
import { ExtendedMD3Colors } from "@theme/types";

type PremarketCardProps = {
  mainInfo: TokenMainInfo;
  dynamicInfo?: TokenDynamicInfo;
  raisedLamports?: string | number; 
  compact?: boolean; // for future
};

export const PremarketCard: React.FC<PremarketCardProps> = memo(({ mainInfo, dynamicInfo, raisedLamports, compact = true }) => {
  const theme = useTheme();
  const colors = theme.colors as ExtendedMD3Colors;

  const goalSOL = useMemo(() => {
    const lamp = mainInfo.premarketGoalSolLamp.toString();
    return lamportsToSol(lamp);
  }, [mainInfo.premarketGoalSolLamp]);

  const raisedSOL = useMemo(() => {
    if (raisedLamports == null) return undefined;
    const lamp = typeof raisedLamports === "number" ? raisedLamports : parseInt(String(raisedLamports), 10);
    return lamportsToSol(lamp);
  }, [raisedLamports]);

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

  // Determine the effective state based on conditions
  const getEffectiveState = () => {
    const now = Math.floor(Date.now() / 1000);
    const isPremarket = mainInfo.state === 'premarket';
    const isDeadlinePassed = mainInfo.premarketDeadline < now;
    
    // Use dynamicInfo.reservedSolLamp if available, otherwise fall back to raisedSOL
    const isGoalNotReached = dynamicInfo 
      ? dynamicInfo.reservedSolLamp.lt(mainInfo.premarketGoalSolLamp)
      : (raisedSOL == null || raisedSOL < goalSOL);
    
    // If it's premarket and deadline passed and goal reached, show "times_up"
    if (isPremarket && isDeadlinePassed && !isGoalNotReached) {
      return 'times_up';
    }
    if (isPremarket && isDeadlinePassed && isGoalNotReached) {
      return 'expired';
    }
    
    return mainInfo.state;
  };

  const button = (state: "premarket" | "canceled" | "finished" | "times_up" | "expired") => {
    return state === 'premarket' ? 
    (<ChipDisplay
      variant="secondary"
      size="normal"
      mode="flat"
    >Premarket</ChipDisplay>
    ) : state === 'finished' ? (
    <ChipDisplay
      variant="primary"
      size="normal"
      mode="flat"
    >Launched</ChipDisplay>
  ) : state === 'canceled' ? (
    <ChipDisplay
      variant="error"
      size="normal"
      mode="flat"
    >Refunded</ChipDisplay>
  ) : state === 'times_up' ? (
    <ChipDisplay
      variant="primary"
      size="normal"
      mode="flat"
    >Times Up</ChipDisplay>
  ) : state === 'expired' ? (
    <ChipDisplay
      variant="error"
      size="normal"
      mode="flat"
    >Expired</ChipDisplay>
  ) : (
    <ChipDisplay
      variant="primary"
      size="normal"
      mode="flat"
    >{state}</ChipDisplay>
  ) 
  }

  let deadlineText = ""
  if (mainInfo.state === "premarket") {
    const deadline = getTimeLeftLabel(mainInfo.premarketDeadline)
    deadlineText = deadline === 'Expired' ? "" :  deadline+" left"
  }

  const goToDetails = () => {
    if (pubkeyStr) router.push(`/token/${pubkeyStr}`);
  };

  return (
    <Pressable onPress={goToDetails} style={{ width: 368 }}>
      <View
        style={{
          backgroundColor: colors.surfaceContainerLowest,
          borderRadius: 24,
          padding: 20,
          width: 368,
          height: 590,
          overflow: "hidden",
          gap: 16,
        }}
      >
        {/* Image Section */}
        {!!mainInfo.imageURL && (
          <View style={{ paddingBottom: 8, paddingTop: 0 }}>
            <Image
              source={{ uri: mainInfo.imageURL }}
              style={{
                width: '100%',
                aspectRatio: 1,
                borderRadius: 20,
                backgroundColor: 'transparent',
              }}
            />
          </View>
        )}

        {/* Header with Title and Social Links */}
        <View
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <View style={{ gap: 4 }}>
            <Text variant="headlineSmall" style={{ color: colors.onSurface }}>
              {mainInfo.name}
            </Text>
            <Text variant="labelLarge" style={{ color: colors.onSurfaceVariant }}>
                {mainInfo.symbol}
              </Text>
          </View>
                <View
                  style={{
              justifyContent: "center",
              alignItems: "flex-start",
              flexDirection: "row",
              gap: 8,
            }}
          >
            {mainInfo?.links?.twitter !== undefined && (
              <RoundIconLink
                name="x-logo"
                colors={colors}
                link={mainInfo.links.twitter}
                withoutBackgroud={true}
              />
            )}
            {mainInfo?.links?.webSite !== undefined && (
              <RoundIconLink
                name="world-outlined"
                colors={colors}
                link={mainInfo.links.webSite}
                withoutBackgroud={true}
              />
            )}
            {mainInfo?.links?.telegram !== undefined && (
              <RoundIconLink
                name="tg-logo"
                colors={colors}
                link={mainInfo.links.telegram}
                withoutBackgroud={true}
              />
            )}
          </View>
        </View>

        {/* Status Row */}
        <View
          style={{
            width: '100%',
            justifyContent: "flex-start",
            alignItems: "center",
            flexDirection: "row",
            gap: 10,
          }}
        >
          {button(getEffectiveState())}
          {mainInfo.state === 'finished' && (
            <Text variant="labelLarge">
              {mainInfo.tokenMint ? shortString(mainInfo.tokenMint) : "No token address available!"} 
            </Text>
          )}
          {mainInfo.state === 'finished' && (
            <SvgIcon 
              name="copy-icon" 
              size={14} 
              color={colors.onSurfaceVariant} 
            />
          )}
          {deadlineText && (
            <Text variant="labelLarge" style={{ color: colors.secondary }}>
              {deadlineText}
            </Text>
          )}
        </View>

        {/* Dynamic Info Section */}
        {mainInfo.state !== "canceled" && (
          dynamicInfo ? (
          <View
            style={{
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexDirection: "row",
              gap: 40,
              width: "100%",
            }}
          >
            {mainInfo.state === "finished" ? (
              <View style={{ alignItems: "flex-start" }}>
                <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                  Current Mcap
                </Text>
                <Text variant="displaySmall" style={{ color: colors.onSurface }}>
                  {formatNumberCompact(convertDecimalToToken(dynamicInfo.marketCapTokenDec))}
                </Text>
                <Text variant="labelMedium" style={{ color: colors.primary }}>
                  {mainInfo?.finishDate ? `${convertTimeStampToDataMonth(mainInfo.finishDate)} launched` : "No launch date available!"}
                </Text>
              </View>
            ) : (
              <View style={{ alignItems: "flex-start" }}>
                <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                  Current Mcap
                </Text>
                <Text variant="displaySmall" style={{ color: colors.onSurface }}>
                  {formatNumberCompact(convertDecimalToToken(dynamicInfo.marketCapTokenDec))}
                </Text>
                <Text
                  variant="labelMedium"
                  style={{
                    color: dynamicInfo.change24h >= 0 ? colors.primary : colors.error,
                  }}
                >
                  {dynamicInfo.change24h >= 0 ? (
                    <View style={{ marginRight: 2 }}>
                      <Svg
                        width="12"
                        height="12"
                        viewBox="0 0 16 16"
                      >
                        <Path 
                          d="M14 10.44l-.413.56H2.393L2 10.46 7.627 5h.827L14 10.44z" 
                          fill={colors.primary}
                        />
                      </Svg>
                    </View>
                  ) : dynamicInfo.change24h < 0 ? (
                    <View style={{ marginRight: 2 }}>
                      <Svg
                        width="12"
                        height="12"
                        viewBox="0 0 16 16"
                      >
                        <Path 
                          d="M2 5.56L2.413 5h11.194l.393.54L8.373 11h-.827L2 5.56z" 
                          fill={colors.error}
                        />
                      </Svg>
                    </View>
                  ) : null}
                  {dynamicInfo.change24h.toFixed(2)}%{" "}
                  <Text
                    variant="labelMedium"
                    style={{ color: colors.onSurfaceVariant }}
                  > 24h</Text>
                </Text>
              </View>
            )}

            <View
              style={{
                alignItems: "flex-start",
              }}
            >
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                People
              </Text>
              <Text variant="displaySmall">{dynamicInfo.holdersCount}</Text>
              <AvatarGroup 
                holders={dynamicInfo.holders}
                maxAvatars={3}
                size={20}
              />
            </View>

            <View style={{ 
              alignItems: "flex-start",
            }}
            >
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                Achieved
              </Text>
              <Text variant="displaySmall" style={{ color: colors.primary }}>
                {Math.round(
                  (convertLamportToSmallCount(dynamicInfo.marketCapSolLamp) / 
                   convertLamportToSmallCount(mainInfo.premarketGoalSolLamp)) *
                    100
                )}
                %
              </Text>
              <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>
                {convertLamportToSmallCount(dynamicInfo.marketCapSolLamp).toFixed(2)} SOL Raised
              </Text>
            </View>
          </View>
          ) : (
            // Loading state for dynamic info
            <View
              style={{
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexDirection: "row",
                gap: 40,
                width: "100%",
                paddingVertical: 20,
              }}
            >
              <View style={{ alignItems: "flex-start" }}>
                <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                  Loading...
                </Text>
              </View>
              <View style={{ alignItems: "flex-start" }}>
                <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                  Loading...
                </Text>
              </View>
              <View style={{ alignItems: "flex-start" }}>
                <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                  Loading...
                </Text>
              </View>
            </View>
          )
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