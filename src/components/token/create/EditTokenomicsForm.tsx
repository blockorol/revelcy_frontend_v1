import { DonutWithLegend } from "@components/base/DonutWithLegend";
import TextInput from "@components/ui/TextInput";
import ContinueButtonWithProgressBar from "@components/ContinueButtonWithProgressBar";
import { TokenomicsData } from "@components/token/create/interface";
import TokenCreateFormHeader from "@components/token/create/TokenCreateFormHeader";
import { useIsMobileWithDemention } from "@hooks/useIsMobile";
import { ExtendedMD3Colors } from "@theme/types";
import { round, formatNumberNoTrailingZeros } from "@utils/numbers";
import { convertNumberWithRaw } from "@utils/setterWithValidate";
import { normalizeStringDecimalInput } from "@utils/convertors";
import React, { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { useTheme, Text } from "react-native-paper";
import { convertSolToPercentOnStart } from "@services/pumpfun/adds";

export type EditTokenomicsFormProps = {
  onNext: (data: TokenomicsData) => void;
  onClose?: () => void;
  onBack?: () => void;
  step: number;
  totalSteps: number;
  presetData?: TokenomicsData;
};
const SUFFIX = " SOL";
const PUMP_FEE_PERCENTAGE = 0.015;
const REVELCY_FEE_PERCENTAGE = 0.01;
const SOL_FEE = 0.059;

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

  const fees = useMemo(() => {
    if (!creatorInitialBuy) {
      return {
        pump: "0",
        revelcy: "0",
      };
    }
    const pump = formatNumberNoTrailingZeros(PUMP_FEE_PERCENTAGE * creatorInitialBuy);
    const revelcy = formatNumberNoTrailingZeros(REVELCY_FEE_PERCENTAGE * creatorInitialBuy);

    return {
      pump: pump,
      revelcy: revelcy,
    };
  }, [creatorInitialBuy]);

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
        : `${creatorInitialBuyRawStr}${SUFFIX}`)) ||
    "";

  const treasuryDisplayValue =
    (treasuryAllocationRawStr &&
      (treasuryAllocationRawStr.endsWith(SUFFIX)
        ? treasuryAllocationRawStr
        : `${treasuryAllocationRawStr}${SUFFIX}`)) ||
    "";

  const [selection, setSelection] = React.useState<{
    start: number;
    end: number;
  }>({ start: 0, end: 0 });

  const [treasurySelection, setTreasurySelection] = React.useState<{
    start: number;
    end: number;
  }>({ start: 0, end: 0 });

  const handleCreatorInitialBuyChangeWithSuffix = (text: string) => {
    // Check if user tried to delete the suffix
    const previousValue = creatorInitialBuyRawStr ?? "";
    const hadSuffix = previousValue.endsWith(SUFFIX);
    const hasSuffix = text.endsWith(SUFFIX);
    
    // If suffix was deleted, restore it and move cursor to before suffix
    if (hadSuffix && !hasSuffix && text.length > 0) {
      // Normalize the input to get what the final number part will be
      const normalizedNumber = normalizeStringDecimalInput(text, SUFFIX);
      const finalRawValue = normalizedNumber + SUFFIX;
      const cursorPosition = finalRawValue.length - SUFFIX.length;
      
      const value = convertNumberWithRaw(
        text + SUFFIX,
        setCreatorInitialBuyRawStr,
        setCreatorInitialBuy, 
        SUFFIX
      );
      
      // Set cursor position to right before the suffix
      // Use setTimeout to ensure state is updated
      setTimeout(() => {
        setSelection({ start: cursorPosition, end: cursorPosition });
      }, 0);
      
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
      return;
    }
    
    const value = convertNumberWithRaw(
      text,
      setCreatorInitialBuyRawStr,
      setCreatorInitialBuy, 
      SUFFIX
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
    const currentValue = creatorInitialBuyRawStr ?? "";
    const limit = currentValue.length - SUFFIX.length; // позиция перед суффиксом
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
    const currentValue = creatorInitialBuyRawStr ?? "";
    const limit = currentValue.length - SUFFIX.length;
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
    onNext({
      creatorInitialBuy: creatorInitialBuy ?? 0,
      treasuryAllocationPercent,
    });
  };
  const isFilledAll = (): boolean => {
    return errorCreatorInitialBuy === null && errorTreasuryAllocation === null;
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{
        backgroundColor: colors.surfaceContainerLowest,
        borderRadius: isMobile ? 0 : 16,
      }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View
        style={{
          backgroundColor: colors.surfaceContainerLowest,
          width: "100%",
          paddingHorizontal: isMobile ? 8 : 16,
          paddingVertical: isMobile ? 40 : 24,
          //maxWidth: 500,
          flex: 1,
        }}
      >
        <View style={{ flex: 1 }}>
          <TokenCreateFormHeader
            title={"Tokenomics"}
            theme={theme}
            onClose={onClose}
          />
          <View
            style={{
              paddingTop: 16,
              gap: 16,
            }}
          >
            <TextInput
              disableRemoveBtn
              alwaysLabelOnTop
              label="Creator Allocation Up to 79.6 SOL"
              maxLength={11}
              value={creatorInitialBuyRawStr??""}
              onChangeText={handleCreatorInitialBuyChangeWithSuffix}
              onSelectionChange={handleSelectionChange}
              selection={selection}
              inputMode="decimal"
              keyboardType="decimal-pad"
              placeholder="0 SOL"
              mode="flat"
              errorValue={errorCreatorInitialBuy}
            />
            {/*
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
              */}
          </View>
          <View style={{ paddingTop: 40, paddingHorizontal: 10 }}>
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
                  /*
                  {
                    value: round(treasuryPercent, 1),
                    label: "Treasury Allocation",
                    color: theme.colors.error,
                  },
                  */
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
{/* 
            <View
              style={{
                paddingTop: 16,
                justifyContent: "space-between",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text variant="bodySmall">
                Pumpfun fees {" "}
                <Text
                  variant="bodySmall"
                  style={{ color: colors.onSurfaceVariant }}
                >
                  1.5% of creator buy
                </Text>
              </Text>
              <Text variant="bodySmall">{fees.pump} SOL</Text>
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
                Revelcy fees {" "}
                <Text
                  variant="bodySmall"
                  style={{ color: colors.onSurfaceVariant }}
                >
                  1% of creator buy
                </Text>
              </Text>
              <Text variant="bodySmall">{fees.revelcy} SOL</Text>
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
                Sol fee
              </Text>
              <Text variant="bodySmall">~{formatNumberNoTrailingZeros(SOL_FEE)} SOL</Text>
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
                paddingTop: 8,
                justifyContent: "space-between",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text variant="titleMedium">Cost</Text>
              <Text variant="titleMedium">
                {formatNumberNoTrailingZeros((creatorInitialBuy ?? 0) * (1 + PUMP_FEE_PERCENTAGE + REVELCY_FEE_PERCENTAGE) + SOL_FEE)} SOL
              </Text>
            </View>
*/}
          </View>
        </View>
        <View style={{ marginTop: 16, paddingBottom: isMobile ? 8 : 16 }}>
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
      </View>
    </ScrollView>
  );
}
