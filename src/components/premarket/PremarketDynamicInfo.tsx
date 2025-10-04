import { TokenDynamicInfo, TokenMainInfo } from "@api/token";
import {  } from "@components/token/create/interface";
import { useIsMobileForTwoScreenWithDemention } from "@hooks/useIsMobile";
import shortString from "@utils/address_shorter";
import { convertDecimalToToken, convertLamportToSmallCount, formatNumberCompact, convertTimeStampToDataMonth } from "@utils/premarket";
import { View, Image, StyleSheet} from "react-native";
import { Text, useTheme } from "react-native-paper";
import Svg, { Path } from 'react-native-svg';

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
        <View style={styles.avatarGroup}>
          {tokenDynamicInfo.holders
            .filter((holder) => holder.iconURL !== undefined)
            .slice(0, 3).length > 0 ? (
            tokenDynamicInfo.holders
              .filter((holder) => holder.iconURL !== undefined)
              .slice(0, 3)
              .map((holder, index) => {
                return (
                  <View
                    key={holder.iconURL || index}
                    style={[
                      styles.avatarCircle,
                      {
                        backgroundColor: theme.colors.surfaceVariant,
                        marginLeft: index === 0 ? 0 : -10,
                        zIndex: 3 - index,
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
              })
          ) : (
            // Default avatar when no images available
            <View
              style={[
                styles.avatarCircle,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: theme.colors.onPrimary,
                  borderWidth: 1,
                },
              ]}
            >
              <Image
                source={require('@assets/avatar-placeholder.png')} // Update path to your default image
                style={styles.avatarImage}
              />
            </View>
          )}
        </View>
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
    avatarGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 20,
    },
    avatarCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
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