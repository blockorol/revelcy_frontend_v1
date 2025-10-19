import { DonutWithLegend } from "@components/base/DonutWithLegend";
import TextInput from "@components/ui/TextInput";
import ContinueButtonWithProgressBar from "@components/ContinueButtonWithProgressBar";
import { TokenomicsData } from "@components/token/create/interface";
import TokenCreateFormHeader from "@components/token/create/TokenCreateFormHeader";
import { useIsMobileWithDemention } from "@hooks/useIsMobile";
import { ExtendedMD3Colors } from "@theme/types";
import { round } from "@utils/numbers";
import { convertSolToPercentOnStart } from "@utils/premarket";
import { convertNumberWithRaw } from "@utils/setterWithValidate";
import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { useTheme, Text } from "react-native-paper";

export type EditTokenomicsFormProps = {
  onNext: (data: TokenomicsData) => void;
  onClose?: () => void;
  onBack?: () => void;
  step: number;
  totalSteps: number;
  presetData?: TokenomicsData;
};
const SUFFIX = " SOL";

export default function EditTokenomicsForm({
  presetData,
  onBack,
  onClose,
  onNext,
  step,
  totalSteps,
}: EditTokenomicsFormProps) {
  const { isMobile, height } = useIsMobileWithDemention();
  const theme = useTheme();
  const colors = theme.colors as ExtendedMD3Colors;
  const [creatorInitialBuy, setCreatorInitialBuy] = useState<
    number | undefined
  >(presetData?.creatorInitialBuy);
  const [creatorInitialBuyRawStr, setCreatorInitialBuyRawStr] = useState<
    string | undefined
  >(
    presetData?.creatorInitialBuy
      ? (() => {
          const valueStr = presetData.creatorInitialBuy.toString();
          return valueStr.endsWith(SUFFIX) ? valueStr : valueStr + SUFFIX;
        })()
      : undefined
  );
  const [errorCreatorInitialBuy, setErrorCreatorInitialBuy] = useState<
    string | null
  >(null);
  
  // Treasury allocation state
  const [treasuryAllocationPercent, setTreasuryAllocationPercent] = useState<
    number | undefined
  >(presetData?.treasuryAllocationPercent);
  const [treasuryAllocationRawStr, setTreasuryAllocationRawStr] = useState<
    string | undefined
  >(
    presetData?.treasuryAllocationPercent
      ? (() => {
          const valueStr = presetData.treasuryAllocationPercent.toString();
          return valueStr.endsWith(SUFFIX) ? valueStr : valueStr + SUFFIX;
        })()
      : undefined
  );
  const [errorTreasuryAllocation, setErrorTreasuryAllocation] = useState<
    string | null
  >(null);
  const [percent, setPercent] = useState<number>(
    presetData?.creatorInitialBuy
      ? convertSolToPercentOnStart(presetData?.creatorInitialBuy)
      : 0
  );
  const [treasuryPercent, setTreasuryPercent] = useState<number>(
    presetData?.treasuryAllocationPercent
      ? convertSolToPercentOnStart(presetData?.treasuryAllocationPercent)
      : 0
  );
  const displayValue =
    (creatorInitialBuyRawStr && 
     (creatorInitialBuyRawStr.endsWith(SUFFIX) 
       ? creatorInitialBuyRawStr 
       : `${creatorInitialBuyRawStr}${SUFFIX}`)) || "";
  
  const treasuryDisplayValue =
    (treasuryAllocationRawStr && 
     (treasuryAllocationRawStr.endsWith(SUFFIX) 
       ? treasuryAllocationRawStr 
       : `${treasuryAllocationRawStr}${SUFFIX}`)) || "";
  
  const [selection, setSelection] = React.useState<{
    start: number;
    end: number;
  }>({ start: 0, end: 0 });
  
  const [treasurySelection, setTreasurySelection] = React.useState<{
    start: number;
    end: number;
  }>({ start: 0, end: 0 });

  const handleCreatorInitialBuyChangeWithSuffix = (text: string) => {
    let raw = text.endsWith(SUFFIX) ? text.slice(0, -SUFFIX.length) : text;

    raw = raw
      .replace(/\s+/g, "")
      .replace(",", ".")
      .replace(/[^0-9.]/g, "");
    const firstDot = raw.indexOf(".");
    if (firstDot !== -1)
      raw =
        raw.slice(0, firstDot + 1) + raw.slice(firstDot + 1).replace(/\./g, "");

    const value = convertNumberWithRaw(
      raw,
      setCreatorInitialBuyRawStr,
      setCreatorInitialBuy
    );
    if (!value) {
      setErrorCreatorInitialBuy(null);
      setPercent(0);
      return;
    }

    const newPercent = convertSolToPercentOnStart(value);
    if (newPercent > 80) {
      setErrorCreatorInitialBuy("Max suply should be less than 80%");
      setPercent(0);
      return;
    }
    setErrorCreatorInitialBuy(null);
    setPercent(round(newPercent, 1));
  };
  const handleSelectionChange = (e: any) => {
    const { start, end } = e.nativeEvent.selection;
    const limit = (creatorInitialBuyRawStr ?? "").length; // позиция перед суффиксом
    const clampedStart = Math.min(start, limit);
    const clampedEnd = Math.min(end, limit);
    if (clampedStart !== start || clampedEnd !== end) {
      setSelection({ start: clampedStart, end: clampedEnd });
    } else {
      setSelection(e.nativeEvent.selection);
    }
  };

  const handleTreasuryAllocationChangeWithSuffix = (text: string) => {
    let raw = text.endsWith(SUFFIX) ? text.slice(0, -SUFFIX.length) : text;

    raw = raw
      .replace(/\s+/g, "")
      .replace(",", ".")
      .replace(/[^0-9.]/g, "");
    const firstDot = raw.indexOf(".");
    if (firstDot !== -1)
      raw =
        raw.slice(0, firstDot + 1) + raw.slice(firstDot + 1).replace(/\./g, "");

    const value = convertNumberWithRaw(
      raw,
      setTreasuryAllocationRawStr,
      setTreasuryAllocationPercent
    );
    if (!value) {
      setErrorTreasuryAllocation(null);
      setTreasuryPercent(0);
      return;
    }

    const newPercent = convertSolToPercentOnStart(value);
    if (newPercent > 80) {
      setErrorTreasuryAllocation("Max allocation should be less than 80%");
      setTreasuryPercent(0);
      return;
    }
    setErrorTreasuryAllocation(null);
    setTreasuryPercent(round(newPercent, 1));
  };

  const handleTreasuryAllocationSelectionChange = (e: any) => {
    const { start, end } = e.nativeEvent.selection;
    const limit = (treasuryAllocationRawStr ?? "").length; // позиция перед суффиксом
    const clampedStart = Math.min(start, limit);
    const clampedEnd = Math.min(end, limit);
    if (clampedStart !== start || clampedEnd !== end) {
      setTreasurySelection({ start: clampedStart, end: clampedEnd });
    } else {
      setTreasurySelection(e.nativeEvent.selection);
    }
  };
  React.useEffect(() => {
    const limit = (creatorInitialBuyRawStr ?? "").length;
    setSelection((s) => {
      const start = Math.min(s.start, limit);
      const end = Math.min(s.end, limit);
      return start === s.start && end === s.end ? s : { start, end };
    });
  }, [creatorInitialBuyRawStr]);

  React.useEffect(() => {
    const limit = (treasuryAllocationRawStr ?? "").length;
    setTreasurySelection((s) => {
      const start = Math.min(s.start, limit);
      const end = Math.min(s.end, limit);
      return start === s.start && end === s.end ? s : { start, end };
    });
  }, [treasuryAllocationRawStr]);

  const handleSubmit = () => {
    if (creatorInitialBuy !== undefined) {
      onNext({ 
        creatorInitialBuy,
        treasuryAllocationPercent
      });
    }
  };
  const isFilledAll = (): boolean => {
    return creatorInitialBuy !== undefined && 
           errorCreatorInitialBuy === null &&
           errorTreasuryAllocation === null;
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{
        backgroundColor: colors.surfaceContainerLowest,
        borderRadius: isMobile ? 0 : 16,
        height: height,
      }}
    >
      <View
        style={{
          backgroundColor: colors.surfaceContainerLowest,
          width: "100%",
          paddingHorizontal: isMobile ? 8 : 16,
          paddingVertical: isMobile ? 40 : 24,
          //maxWidth: 500,
          minHeight: isMobile ? height : height * 0.9,
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1 }}>
          <TokenCreateFormHeader
            title={"Tokenomics"}
            theme={theme}
            onClose={onClose}
          />
          <View style={{
            paddingTop: 50,
            gap: 16,
          }}> 
            <TextInput
              label="Creator Buy"
              value={displayValue}
              onChangeText={handleCreatorInitialBuyChangeWithSuffix}
              onSelectionChange={handleSelectionChange}
              selection={selection}
              inputMode="decimal"
              keyboardType="decimal-pad"
              placeholder="Up to 80% in sol"
              mode="flat"
              style={{ backgroundColor: "transparent" }}
              theme={{ colors: colors }}
              errorValue={errorCreatorInitialBuy}
            />
            <TextInput
              label="Treasury Allocation"
              value={treasuryDisplayValue}
              onChangeText={handleTreasuryAllocationChangeWithSuffix}
              onSelectionChange={handleTreasuryAllocationSelectionChange}
              selection={treasurySelection}
              inputMode="decimal"
              keyboardType="decimal-pad"
              placeholder="Up to 80% in sol"
              mode="flat"
              style={{ backgroundColor: "transparent" }}
              theme={{ colors: colors }}
              errorValue={errorTreasuryAllocation}
            />
            <View style={{paddingHorizontal: 14}}>
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginBottom: 4 }}>
                Treasury Address
              </Text>
              <Text variant="bodyMedium" style={{ color: colors.onSurface }}>
                1Fffmb...5paPH
              </Text>
            </View>
          </View>
          <View style={{ paddingTop: 40, paddingHorizontal: 10}}>
            <View
              style={{
                paddingTop: 20,
                paddingBottom: 20,
                paddingRight: 16,
                paddingLeft: 16,
                borderRadius: 20,
                backgroundColor: colors.surfaceContainer,
              }}
            >
              <DonutWithLegend
                slices={[
                  {
                    value: round(percent, 1),
                    label: "Creator (You)",
                    color: theme.colors.primary,
                  },
                  {
                    value: round(treasuryPercent, 1),
                    label: "Treasury Allocation",
                    color: theme.colors.error,
                  },
                  {
                    value: 20,
                    label: "Pumpswap pool",
                    color: theme.colors.secondary,
                  },
                  {
                    value: round(80 - percent - treasuryPercent, 1),
                    label: "Bonding curve",
                    color: theme.colors.onSurface,
                  },
                ]}
              />
            </View>

            <View
              style={{
                paddingTop: 30,
                justifyContent: "space-between",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text variant="bodySmall">Solana fees</Text>
              <Text variant="bodySmall">0.25 SOL</Text>
            </View>

            <View
              style={{
                paddingTop: 16,
                justifyContent: "space-between",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text variant="bodySmall">
                Revelcy fees <Text style={{ color: colors.onSurfaceVariant }}>1% of creator buy</Text>
              </Text>
              <Text variant="bodySmall">
                {round((creatorInitialBuy ?? 0) * 0.01, 2)} SOL
              </Text>
            </View>

            <View
              style={{
                marginTop: 16,
                marginBottom: 0,
                height: 1,
                backgroundColor: colors.outlineVariant,
              }}
            />

            <View
              style={{
                paddingTop: 16,
                justifyContent: "space-between",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text variant="bodySmall">Cost</Text>
              <Text variant="bodySmall">
                {round(0.06 + (creatorInitialBuy ?? 0), 2)} SOL
              </Text>
            </View>
          </View>
        </View>

        <ContinueButtonWithProgressBar
          theme={theme}
          progress={{
            before: (step - 1) / totalSteps,
            after: step / totalSteps,
          }}
          handleSubmit={handleSubmit}
          isFilledAll={isFilledAll}
          onBack={onBack}
        />
      </View>
    </ScrollView>
  );
}
