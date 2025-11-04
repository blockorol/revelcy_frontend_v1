import React, { memo, useMemo, useState } from "react";
import { View, Pressable, Image } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { router } from "expo-router";
import { SvgIcon, SvgIconButton } from "@components/base/SvgIcon";
import { ChipDisplay, CHIP_NORMAL_HEIGHT, CHIP_NORMAL_PADDING_VERTICAL, CHIP_NORMAL_PADDING_HORIZONTAL, CHIP_NORMAL_BORDER_RADIUS, CHIP_NORMAL_TEXT_FONT_SIZE, CHIP_NORMAL_TEXT_LINE_HEIGHT } from '@components/ui/Chip';
import { RoundIconLink } from "@components/premarket/RoundIcons";
import { getTimeLeftLabel, convertDecimalToToken, convertLamportToSmallCount, formatNumberCompact, convertTimeStampToDataMonth } from "@utils/premarket";
import shortString from "@utils/address_shorter";
import { TokenMainInfo, TokenDynamicInfo } from "@api/token";
import { AvatarGroup } from "@components/base/AvatarGroup";
import Svg, { Path } from 'react-native-svg';
import { QuestionMarkModal } from "@components/modals/QuestionMarkModal";
import { ExtendedMD3Colors } from "@theme/types";

type PremarketCardProps = {
  mainInfo: TokenMainInfo;
  dynamicInfo?: TokenDynamicInfo;
  raisedLamports?: string | number; 
  compact?: boolean; // for future
  width?: number; // card width, defaults to 368
};

export const PremarketCard: React.FC<PremarketCardProps> = memo(({ mainInfo, dynamicInfo, raisedLamports, compact = true, width = 368 }) => {
  const theme = useTheme();
  const colors = theme.colors as ExtendedMD3Colors;
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  
  // Constrain width to maximum of 368px
  const constrainedWidth = useMemo(() => {
    return Math.min(368, width);
  }, [width]);
  
  // Calculate height proportionally (original ratio: 368:590)
  // Maximum height is 590 to prevent cards from getting too tall
  const height = useMemo(() => {
    const calculatedHeight = constrainedWidth * (590 / 368);
    return Math.min(590, calculatedHeight);
  }, [constrainedWidth]);

  // Calculate scale factor based on original width (368)
  // This will be used to scale all child elements proportionally
  const scaleFactor = useMemo(() => {
    return constrainedWidth / 368;
  }, [constrainedWidth]);

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
    // Scale chip styles using imported constants from Chip.tsx
    const chipStyle = {
      height: CHIP_NORMAL_HEIGHT * scaleFactor,
      paddingVertical: CHIP_NORMAL_PADDING_VERTICAL * scaleFactor,
      paddingHorizontal: CHIP_NORMAL_PADDING_HORIZONTAL * scaleFactor,
      borderRadius: CHIP_NORMAL_BORDER_RADIUS * scaleFactor,
    };
    
    // Scaled text style for chip labels using imported constants from Chip.tsx
    // This will be merged with ChipDisplay's default text styling
    const chipTextStyle = {
      fontSize: CHIP_NORMAL_TEXT_FONT_SIZE * scaleFactor,
      lineHeight: CHIP_NORMAL_TEXT_LINE_HEIGHT * scaleFactor,
    };
    
    return state === 'premarket' ? 
    (<ChipDisplay
      variant="secondary"
      size="normal"
      mode="flat"
      style={chipStyle}
      textStyle={chipTextStyle}
    >Premarket</ChipDisplay>
    ) : state === 'finished' ? (
    <ChipDisplay
      variant="primary"
      size="normal"
      mode="flat"
      style={chipStyle}
      textStyle={chipTextStyle}
    >Launched</ChipDisplay>
  ) : state === 'canceled' ? (
    <ChipDisplay
      variant="error"
      size="normal"
      mode="flat"
      style={chipStyle}
      textStyle={chipTextStyle}
    >Refunded</ChipDisplay>
  ) : state === 'times_up' ? (
    <ChipDisplay
      variant="primary"
      size="normal"
      mode="flat"
      style={chipStyle}
      textStyle={chipTextStyle}
    >Times Up</ChipDisplay>
  ) : state === 'expired' ? (
    <ChipDisplay
      variant="error"
      size="normal"
      mode="flat"
      style={chipStyle}
      textStyle={chipTextStyle}
    >Expired</ChipDisplay>
  ) : (
    <ChipDisplay
      variant="primary"
      size="normal"
      mode="flat"
      style={chipStyle}
      textStyle={chipTextStyle}
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
    <Pressable onPress={goToDetails} style={{ width: constrainedWidth }}>
      <View
        style={{
          backgroundColor: colors.surfaceContainerLowest,
          borderRadius: 24 * scaleFactor,
          padding: 20 * scaleFactor,
          width: constrainedWidth,
          height,
          overflow: "hidden",
          gap: 16 * scaleFactor,
        }}
      >
        {/* Image Section */}
        {!!mainInfo.imageURL && (
          <View style={{ paddingBottom: 8 * scaleFactor, paddingTop: 0 }}>
            <Image
              source={{ uri: mainInfo.imageURL }}
              style={{
                width: '100%',
                aspectRatio: 1,
                borderRadius: 20 * scaleFactor,
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
          <View style={{ gap: 4 * scaleFactor }}>
            <Text variant="headlineSmall" style={{ color: colors.onSurface, fontSize: 24 * scaleFactor, lineHeight: 32 * scaleFactor }}>
              {mainInfo.name}
            </Text>
            <Text variant="labelLarge" style={{ color: colors.onSurfaceVariant, fontSize: 14 * scaleFactor, lineHeight: 20 * scaleFactor }}>
                {mainInfo.symbol}
              </Text>
          </View>
                <View
                  style={{
              justifyContent: "center",
              alignItems: "flex-start",
              flexDirection: "row",
              gap: 8 * scaleFactor,
            }}
          >
            {mainInfo?.links?.twitter !== undefined && (
              <RoundIconLink
                name="x-logo"
                colors={colors}
                link={mainInfo.links.twitter}
                withoutBackgroud={true}
                size={32 * scaleFactor}
                iconSize={16 * scaleFactor}
              />
            )}
            {mainInfo?.links?.webSite !== undefined && (
              <RoundIconLink
                name="world-outlined"
                colors={colors}
                link={mainInfo.links.webSite}
                withoutBackgroud={true}
                size={32 * scaleFactor}
                iconSize={16 * scaleFactor}
              />
            )}
            {mainInfo?.links?.telegram !== undefined && (
              <RoundIconLink
                name="tg-logo"
                colors={colors}
                link={mainInfo.links.telegram}
                withoutBackgroud={true}
                size={32 * scaleFactor}
                iconSize={16 * scaleFactor}
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
            gap: 10 * scaleFactor,
            flexWrap: "nowrap",
          }}
        >
          {button(getEffectiveState())}
          {mainInfo.state === 'finished' && (
            <Text variant="labelLarge" style={{ fontSize: 14 * scaleFactor, lineHeight: 20 * scaleFactor }}>
              {mainInfo.tokenMint ? shortString(mainInfo.tokenMint) : "No token address available!"} 
            </Text>
          )}
          {mainInfo.state === 'finished' && (
            <SvgIcon 
              name="copy-icon" 
              size={14 * scaleFactor} 
              color={colors.onSurfaceVariant} 
            />
          )}
          {deadlineText && (
            <Text variant="labelLarge" style={{ color: colors.secondary, fontSize: 16 * scaleFactor, lineHeight: 20 * scaleFactor }}>
              {deadlineText}
            </Text>
          )}
          {(mainInfo.state === 'premarket' || mainInfo.state === 'canceled') && (
            <View style={{ 
              justifyContent: "center", 
              alignItems: "center",
              height: CHIP_NORMAL_HEIGHT * scaleFactor, // Match chip height for proper vertical alignment
            }}>
              <SvgIconButton 
                name="question-mark-circle" 
                size={24 * scaleFactor} 
                color={colors.outline}
                onPress={() => setShowQuestionModal(true)}
              />
            </View>
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
              gap: 40 * scaleFactor,
              width: "100%",
            }}
          >
            {mainInfo.state === "finished" ? (
              <View style={{ alignItems: "flex-start" }}>
                <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, fontSize: 12 * scaleFactor, lineHeight: 16 * scaleFactor }}>
                  Current Mcap
                </Text>
                <Text variant="displaySmall" style={{ color: colors.onSurface, fontSize: 36 * scaleFactor, lineHeight: 44 * scaleFactor }}>
                  {formatNumberCompact(convertDecimalToToken(dynamicInfo.marketCapTokenDec))}
                </Text>
                <Text variant="labelMedium" style={{ color: colors.primary, fontSize: 12 * scaleFactor, lineHeight: 16 * scaleFactor }}>
                  {mainInfo?.finishDate ? `${convertTimeStampToDataMonth(mainInfo.finishDate)} launched` : "No launch date available!"}
                </Text>
              </View>
            ) : (
              <View style={{ alignItems: "flex-start" }}>
                <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, fontSize: 12 * scaleFactor, lineHeight: 16 * scaleFactor }}>
                  Current Mcap
                </Text>
                <Text variant="displaySmall" style={{ color: colors.onSurface, fontSize: 36 * scaleFactor, lineHeight: 44 * scaleFactor }}>
                  {formatNumberCompact(convertDecimalToToken(dynamicInfo.marketCapTokenDec))}
                </Text>
                <Text
                  variant="labelMedium"
                  style={{
                    color: dynamicInfo.change24h >= 0 ? colors.primary : colors.error,
                    fontSize: 12 * scaleFactor,
                    lineHeight: 16 * scaleFactor,
                  }}
                >
                  {dynamicInfo.change24h >= 0 ? (
                    <View style={{ marginRight: 2 * scaleFactor }}>
                      <Svg
                        width={12 * scaleFactor}
                        height={12 * scaleFactor}
                        viewBox="0 0 16 16"
                      >
                        <Path 
                          d="M14 10.44l-.413.56H2.393L2 10.46 7.627 5h.827L14 10.44z" 
                          fill={colors.primary}
                        />
                      </Svg>
                    </View>
                  ) : dynamicInfo.change24h < 0 ? (
                    <View style={{ marginRight: 2 * scaleFactor }}>
                      <Svg
                        width={12 * scaleFactor}
                        height={12 * scaleFactor}
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
                    style={{ color: colors.onSurfaceVariant, fontSize: 12 * scaleFactor, lineHeight: 16 * scaleFactor }}
                  > 24h</Text>
                </Text>
              </View>
            )}

            <View
              style={{
                alignItems: "flex-start",
              }}
            >
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, fontSize: 12 * scaleFactor, lineHeight: 16 * scaleFactor }}>
                People
              </Text>
              <Text variant="displaySmall" style={{ fontSize: 36 * scaleFactor, lineHeight: 44 * scaleFactor }}>{dynamicInfo.holdersCount}</Text>
              <AvatarGroup 
                holders={dynamicInfo.holders}
                maxAvatars={3}
                size={20 * scaleFactor}
              />
            </View>

            <View style={{ 
              alignItems: "flex-start",
            }}
            >
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, fontSize: 12 * scaleFactor, lineHeight: 16 * scaleFactor }}>
                Achieved
              </Text>
              <Text variant="displaySmall" style={{ color: colors.primary, fontSize: 36 * scaleFactor, lineHeight: 44 * scaleFactor }}>
                {Math.round(
                  (convertLamportToSmallCount(dynamicInfo.marketCapSolLamp) / 
                   convertLamportToSmallCount(mainInfo.premarketGoalSolLamp)) *
                    100
                )}
                %
              </Text>
              <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant, fontSize: 12 * scaleFactor, lineHeight: 16 * scaleFactor }}>
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
                gap: 40 * scaleFactor,
                width: "100%",
                paddingVertical: 20 * scaleFactor,
              }}
            >
              <View style={{ alignItems: "flex-start" }}>
                <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, fontSize: 12 * scaleFactor, lineHeight: 16 * scaleFactor }}>
                  Loading...
                </Text>
              </View>
              <View style={{ alignItems: "flex-start" }}>
                <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, fontSize: 12 * scaleFactor, lineHeight: 16 * scaleFactor }}>
                  Loading...
                </Text>
              </View>
              <View style={{ alignItems: "flex-start" }}>
                <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, fontSize: 12 * scaleFactor, lineHeight: 16 * scaleFactor }}>
                  Loading...
                </Text>
              </View>
            </View>
          )
        )}

        {/* Progress bar (if raised exist) */}
        {progressPct != null && (
          <View style={{ marginTop: 12 * scaleFactor }}>
            <View
              style={{
                height: 8 * scaleFactor,
                borderRadius: 999 * scaleFactor,
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
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 * scaleFactor }}>
              <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant, fontSize: 11 * scaleFactor, lineHeight: 16 * scaleFactor }}>
                {raisedSOL?.toFixed(2)} / {goalSOL.toFixed(2)} SOL
              </Text>
              <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant, fontSize: 11 * scaleFactor, lineHeight: 16 * scaleFactor }}>
                {progressPct.toFixed(0)}%
              </Text>
            </View>
          </View>
        )}
      </View>
      
      <QuestionMarkModal 
        visible={showQuestionModal} 
        onClose={() => setShowQuestionModal(false)} 
      />
    </Pressable>
  );
});

const lamportsToSol = (x: string | number) => {
  const n = typeof x === "number" ? x : parseInt(x, 10);
  return n / 1_000_000_000;
};