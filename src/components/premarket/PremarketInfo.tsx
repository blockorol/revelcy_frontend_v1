import { TokenInfo } from "@api/token";
import { Joiner, PremarketBondingCurve } from "@components/premarket/PremarketBondingCurve";
import { PremarketTimelineSection } from "@components/premarket/PremarketTimelineSection";
import { AppTheme } from "@theme/types";
import { convertDecimalToToken, convertLamportToSmallCount, DEFAULT_TOKEN_COUNT } from "@utils/premarket";
import BN from "bn.js";
import { View } from "react-native";
import { useTheme, Text} from "react-native-paper";

interface PremarketInfoProps {
  tokenInfo: TokenInfo;
  isMobile: boolean;
  withJoinButton: boolean;
  onUpdated: () => Promise<void>;
}
export function PremarketInfo({ tokenInfo, isMobile, withJoinButton, onUpdated}: PremarketInfoProps) {
  const { colors } = useTheme() as AppTheme;
  const joiners = tokenInfo.dynamicInfo.holders
    .slice()
    .sort((a, b) => a.joinTimestamp - b.joinTimestamp)
    .reduce((acc, holder, index) => {
      const cumulative = (acc[index - 1]?.amount_sol_cumulative_lamp || new BN(0)).add(holder.amountSolLamp);

      acc.push({
        id: holder.id,
        user_url: holder.iconURL,
        amount_sol_lamp: holder.amountSolLamp,
        amount_sol_cumulative_lamp: cumulative,
      } as Joiner);

      return acc;
    }, [] as Joiner[]);

  return (
    <View
      style={{
        backgroundColor: colors.surfaceContainerLowest,
        borderRadius: 20,
        padding: 24,
        gap: 32,
      }}
    >
      <Text variant="titleLarge"> Premarket</Text>
      <View
        style={{
          flexDirection: isMobile ? "column" : "row",
          alignContent: "center",
          justifyContent: "center",
          gap: 40,
        }}
      >
        <PremarketBondingCurve
          state={tokenInfo.mainInfo.state}
          onUpdated={onUpdated}
          premaketPubkey={tokenInfo.mainInfo.premarketPubkey}
          withJoinButton={withJoinButton}
          goalPercent={tokenInfo.mainInfo.premarketGoalPers}
          nowPercent={
            (100 * convertDecimalToToken(tokenInfo.dynamicInfo.marketCapTokenDec)) / DEFAULT_TOKEN_COUNT
          }
          currentPrice={convertLamportToSmallCount(tokenInfo.dynamicInfo.currentPriceLamp)}
          joiners={joiners}
          background={colors.elevation.level1}
          widthAround={isMobile ? "100%" : undefined}
        />
        <PremarketTimelineSection 
          withJoinButton={withJoinButton} 
          tokenInfo={tokenInfo}
          onUpdated={onUpdated}
          />
      </View>
    </View>
  );
}