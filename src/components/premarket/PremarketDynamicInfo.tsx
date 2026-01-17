import { TokenDynamicInfo, TokenMainInfo } from "@api/token";
import {  } from "@components/token/create/interface";
import { useIsMobileForTwoScreenWithDemention } from "@hooks/useIsMobile";
import { convertDecimalToToken, convertLamportToSmallCount, formatNumberCompact, convertTimeStampToDataMonth } from "@utils/premarket";
import { formatNumberNoTrailingZeros } from "@utils/numbers";
import { View, Image, StyleSheet} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { AvatarGroup } from "@components/base/AvatarGroup";
import { SvgIcon } from "@components/base/SvgIcon";

interface PremarketDynamicInfoProps {
  tokenDynamicInfo: TokenDynamicInfo;
  tokenMainInfo: TokenMainInfo;
  isMobile: boolean;
}
export function PremarketDynamicInfo({
  tokenDynamicInfo,
  tokenMainInfo,
  isMobile,
}: PremarketDynamicInfoProps) {
  const theme = useTheme();
  const { left } = useIsMobileForTwoScreenWithDemention();
  
  // Don't render if premarket state is canceled (refunded)
  if (tokenMainInfo.state === "canceled") {
    return null;
  }
  
  return (
    <View
      style={{
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexDirection: "row",
        paddingHorizontal: isMobile?16:24,
        gap: 40,
        width: isMobile ? "100%" : "auto",
      }}
    >
      {tokenMainInfo.state === "finished" ? (
        <View style={{alignItems: "flex-start" }}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Launch Mcap
          </Text>
          <Text variant="displaySmall" style={{ color: theme.colors.onSurface }}>
            {formatNumberCompact(convertDecimalToToken(tokenDynamicInfo.marketCapTokenDec))}
          </Text>
          <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
            {tokenMainInfo?.finishDate ? `${convertTimeStampToDataMonth(tokenMainInfo.finishDate)} launched` : "No launch date available!"}
          </Text>
        </View>
      ) : (
        <View style={{alignItems: "flex-start" }}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Current Mcap
          </Text>
          <Text variant="displaySmall" style={{ color: theme.colors.onSurface }}>
            {formatNumberCompact(convertDecimalToToken(tokenDynamicInfo.marketCapTokenDec))}
          </Text>
          <Text
            variant="labelMedium"
            style={{
              color:
                tokenDynamicInfo.change24h >= 0 ? theme.colors.primary : theme.colors.error,
            }}
          >
            {tokenDynamicInfo.change24h >= 0 ? (
              <View style={{ marginRight: 2}}>
                <SvgIcon 
                  name="price-up" 
                  size={5} 
                  color={theme.colors.primary}
                />
              </View>
            ) : tokenDynamicInfo.change24h < 0 ? (
              <View style={{ marginRight: 2, transform: [{ rotate: '180deg' }] }}>
                <SvgIcon 
                  name="price-up" 
                  size={5} 
                  color={theme.colors.error}
                />
              </View>
            ) : null}
            {tokenDynamicInfo.change24h.toFixed(2)}%{" "}
            <Text
              variant="labelMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            > 24h</Text>
          </Text>
        </View>
      )}

      <View
        style={{
          alignItems: "flex-start",
        }}
      >
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          People
        </Text>
        <Text variant="displaySmall">{tokenDynamicInfo.holdersCount}</Text>
        <AvatarGroup 
          holders={tokenDynamicInfo.holders}
          maxAvatars={3}
          size={20}
        />
      </View>

      <View style={{ 
        alignItems: "flex-start",
      }}
      >
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Achieved
        </Text>
        <Text variant="displaySmall" style={{ color: theme.colors.primary }}>
          {Math.round(
            (convertLamportToSmallCount(tokenDynamicInfo.marketCapSolLamp) / 
             convertLamportToSmallCount(tokenMainInfo.premarketGoalSolLamp)) *
              100
          )}
          %
        </Text>
        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {formatNumberNoTrailingZeros(convertLamportToSmallCount(tokenDynamicInfo.marketCapSolLamp))} SOL Raised
        </Text>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
    // Avatar styles moved to AvatarGroup component
})