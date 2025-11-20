import { TokenInfo } from "@api/token";
import { Joiner, PremarketBondingCurve } from "@components/premarket/PremarketBondingCurve";
import { PremarketTimelineSection } from "@components/premarket/PremarketTimelineSection";
import { AppTheme } from "@theme/types";
import BN from "bn.js";
import { View } from "react-native";
import { useTheme, Text} from "react-native-paper";

interface PremarketInfoProps {
  currentUserId?: string;
  tokenInfo: TokenInfo;
  isMobile: boolean;
  withJoinButton: boolean;
  onUpdated: () => Promise<void>;
  width: number
}
export function PremarketInfo({currentUserId, tokenInfo, isMobile, withJoinButton, onUpdated, width}: PremarketInfoProps) {
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
          justifyContent: isMobile ? 'flex-start' : 'center',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: 32,
        }}
      >
        <PremarketBondingCurve
          currentUserId={currentUserId}
          width={isMobile?width-16*2:448}
          height={252}
          state={tokenInfo.mainInfo.state}
          goalSol={tokenInfo.mainInfo.premarketGoalSolLamp}
          nowSol={tokenInfo.dynamicInfo.marketCapTokenDec}
          currentPrice={tokenInfo.dynamicInfo.currentPriceLamp}
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