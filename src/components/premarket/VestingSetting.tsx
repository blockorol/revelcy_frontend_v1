import { View } from "react-native";
import { useTheme } from "react-native-paper";
import { Text } from "@components/ui/Text";
import { AppTheme } from "@theme/types";
import { convertSecondToNumber } from "@utils/numbers";

interface VestingSettingProps {
  periodSec: number;
  percentInit: number;
}

export function VestingSetting({ periodSec, percentInit }: VestingSettingProps) {
  const { colors } = useTheme() as AppTheme;
  const { amount, symbol } = convertSecondToNumber(periodSec);

  return (
    <View
      style={{
        paddingHorizontal: 24,
        gap: 12,
        width: "100%",
      }}
    >
      {/* <SeparatorLine /> */}

      <VestingInfoRow label="Unlock at launch" amount={percentInit} symbol="%" textColor={colors.onSurface} amountColor={colors.primary} />
      <VestingInfoRow label="Vesting Period" amount={amount} symbol={symbol} textColor={colors.onSurface} amountColor={colors.primary} />
    </View>
  );
}

function VestingInfoRow({
  label,
  amount,
  symbol,
  textColor,
  amountColor,
}: {
  label: string;
  amount: number;
  symbol: string;
  textColor: string;
  amountColor: string;
}) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <Text variant="labelMedium" style={{ color: textColor }}>
        {label}
      </Text>

      <Text variant="labelMedium" prominent style={{ color: amountColor }}>
        {amount.toFixed(0)} {symbol}
      </Text>
    </View>
  );
}
