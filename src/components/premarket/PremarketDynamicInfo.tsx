import { TokenDynamicInfo, TokenMainInfo } from "@api/token";
import {  } from "@components/token/create/interface";
import { useIsMobileForTwoScreenWithDemention } from "@hooks/useIsMobile";
import { convertDecimalToToken, convertLamportToSmallCount, formatNumberCompact } from "@utils/premarket";
import { View, StyleSheet} from "react-native";
import { Text, useTheme } from "react-native-paper";
import Svg, { Path } from 'react-native-svg';
import { AvatarGroup } from "@components/base/AvatarGroup";

interface PremarketDynamicInfoProps {
  tokenDynamicInfo: TokenDynamicInfo;
  tokenMainInfo: TokenMainInfo;
}
export function PremarketDynamicInfo({
  tokenDynamicInfo,
  tokenMainInfo,
}: PremarketDynamicInfoProps) {
  const theme = useTheme();
  const { left } = useIsMobileForTwoScreenWithDemention();
  return (
    <View
      style={{
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexDirection: "row",
      }}
    >
      {tokenMainInfo.state === "finished" ? (
        <View style={{ gap: 4, flex: 1, alignItems: "center" }}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Current Mcap
          </Text>
          <Text variant="displaySmall" style={{ color: theme.colors.onSurface }}>
            {formatNumberCompact(convertDecimalToToken(tokenDynamicInfo.marketCapTokenDec))}
          </Text>
          <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
            {tokenMainInfo?.finish_date ? `${convertTimeStampToDataMonth(tokenMainInfo.finish_date)} launched` : "No launch date available!"}
          </Text>
        </View>
      ) : (
        <View style={{ gap: 4, flex: 1, alignItems: "center" }}>
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
                tokenDynamicInfo.change24h > 0 ? theme.colors.primary : theme.colors.error,
            }}
          >
            {tokenDynamicInfo.change24h > 0 ? (
              <View style={{ marginRight: 2 }}>
                <Svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                >
                  <Path 
                    d="M14 10.44l-.413.56H2.393L2 10.46 7.627 5h.827L14 10.44z" 
                    fill={theme.colors.primary}
                  />
                </Svg>
              </View>
            ) : (
              <View style={{ marginRight: 2 }}>
                <Svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                >
                  <Path 
                    d="M2 5.56L2.413 5h11.194l.393.54L8.373 11h-.827L2 5.56z" 
                    fill={theme.colors.error}
                  />
                </Svg>
              </View>
            )}
            {tokenDynamicInfo.change24h}%{" "}
            <Text
              variant="labelMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            > 24h</Text>
          </Text>
        </View>
      )}

      <View
        style={{
          gap: 4,
          flex: 1,
          alignItems: "center",
          justifyContent: "flex-start",
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

      <View style={{ gap: 4, flex: 1, alignItems: "center" }}>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Achieved
        </Text>
        <Text variant="displaySmall" style={{ color: theme.colors.primary }}>
          {Math.round(
            (convertLamportToSmallCount(tokenDynamicInfo.marketCapSolLamp.div(tokenMainInfo.premarketGoalSolLamp))) *
              100
          )}
          %
        </Text>
        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {convertLamportToSmallCount(tokenDynamicInfo.marketCapSolLamp).toFixed(2)} SOL Raised
        </Text>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
    // Avatar styles moved to AvatarGroup component
})