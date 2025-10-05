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
  width: number
}
export function PremarketInfo({ tokenInfo, isMobile, withJoinButton, onUpdated, width}: PremarketInfoProps) {
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
        backgroundColor: isMobile?'transparent':colors.surfaceContainerLowest,
        borderRadius: 20,
        padding: isMobile?16:24,
        gap: 16,
      }}
    >
      <Text variant="titleLarge">Premarket</Text>
      <View
        style={{
          flexDirection: isMobile ? "column" : "row",
          alignContent: "center",
          justifyContent: 'flex-start',
          gap: 32,
        }}
      >
        <PremarketBondingCurve
          width={isMobile?width-16*2:2*(width-32-24*2)/3}
          height={252}
          state={tokenInfo.mainInfo.state}
          goalPercent={tokenInfo.mainInfo.premarketGoalPers}
          nowPercent={
            (100 * convertDecimalToToken(tokenInfo.dynamicInfo.marketCapTokenDec)) / DEFAULT_TOKEN_COUNT
          }
          currentPrice={(() => {
            const price = tokenInfo.dynamicInfo.currentPriceLamp;
            return price;
          })()}
          joiners={joiners}
          background={colors.surfaceContainerLow}
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