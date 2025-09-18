import { TokenDynamicInfo, TokenMainInfo } from "@api/token";
import {  } from "@components/token/create/interface";
import { useIsMobileForTwoScreenWithDemention } from "@hooks/useIsMobile";
import { convertDecimalToToken, convertLamportToSmallCount, formatNumberCompact } from "@utils/premarket";
import { View, Image, StyleSheet} from "react-native";
import { Text, useTheme } from "react-native-paper";

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
        width: left.width - 48,
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexDirection: "row",
      }}
    >
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
          {tokenDynamicInfo.change24h > 0 ?"▲":"▼"}
          {tokenDynamicInfo.change24h}%{" "}
          <Text
            variant="labelMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          > 24h</Text>
        </Text>
      </View>

      <View
        style={{
          gap: 4,
          flex: 1,
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <Text variant="bodySmall">People</Text>
        <Text variant="displaySmall">{tokenDynamicInfo.holdersCount}</Text>
        {
          <View style={styles.avatarGroup}>
            {tokenDynamicInfo.holders
              .filter((holder) => holder.iconURL !== undefined)
              .slice(0, 3)
              .map((holder, index) => {
                return (
                  <View
                    style={[
                      styles.avatarCircle,
                      {
                        backgroundColor: theme.colors.surfaceVariant,
                        marginLeft: index === 0 ? 0 : -10,
                        zIndex: index,
                        borderColor: theme.colors.onPrimary,
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <Image
                      source={{ uri: holder.iconURL }}
                      style={styles.avatarImage}
                    />
                  </View>
                );
              })}
          </View>
        }
      </View>

      <View style={{ gap: 4, flex: 1, alignItems: "center" }}>
        <Text variant="bodySmall">Premarket</Text>
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
    avatarGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarCircle: {
        width: 20,
        height: 20,
        borderRadius: 9999,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
    },
})