import ContinueButtonWithProgressBar from "@components/ContinueButtonWithProgressBar";
import { PremarketSettingData, TokenomicsData } from "@components/token/create/interface";
import TokenCreateFormHeader from "@components/token/create/TokenCreateFormHeader";
import React, { useState } from "react";
import { ScrollView, View, Pressable } from "react-native";
import { HelperText, Switch, useTheme } from "react-native-paper";
import { Text } from "@components/ui/Text";
import { DateTimeEditField } from "@components/base/DateTimeEditField";
import { CustomSlider } from "@components/base/CustomSlider";
import { useIsMobileWithDemention } from "@hooks/useIsMobile";
import { ExtendedMD3Colors } from "@theme/types";
import TextInput from "@components/ui/TextInput";
import { sanitizeShortPath } from "@utils/url";
import { clamp , clampInt } from "@utils/numbers";
import { normalizeStringDecimalInput } from "@utils/convertors";
const DEFAULT_PREMARKET_GOAL_SOL = 5;

export type EditPremarketSettingsFormProps = {
  onNext: (data: PremarketSettingData) => void;
  onClose?: () => void;
  onBack?: () => void;
  step: number;
  totalSteps: number;
  presetData?: PremarketSettingData;
  tokenomicsData?: TokenomicsData;
};

function InfoBadge({ onPress }: { onPress?: () => void }) {
  const theme = useTheme();
  const colors = theme.colors as ExtendedMD3Colors;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={{
        width: 22,
        height: 22,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.outlineVariant,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
        ?
      </Text>
    </Pressable>
  );
}


export default function EditPremarketSettingsForm({
  tokenomicsData,
  presetData,
  onClose,
  onBack,
  onNext,
  step,
  totalSteps,
}: EditPremarketSettingsFormProps) {
  const { isMobile } = useIsMobileWithDemention();
  const theme = useTheme();
  const colors = theme.colors as ExtendedMD3Colors;

  // Keep old goal_sol (NOT shown in UI) to avoid breaking on-chain createPremarketArgs for now
  const minPremarketSol = tokenomicsData?.creatorInitialBuy??DEFAULT_PREMARKET_GOAL_SOL;
  const [premarketGoalSol] = useState<number>(presetData?.goal_sol ?? minPremarketSol);

  //  Flat Bonding Curve
  const [isFlatBondingCurveEnabled, setIsFlatBondingCurveEnabled] = useState(
    presetData?.isFlatBondingCurveEnabled ?? true
  );
  const bcOpacity = isFlatBondingCurveEnabled ? 1 : 0.35;
  //  BC %
  const [bondingCurvePercent, setBondingCurvePercent] = useState<number>(
    typeof presetData?.bondingCurvePercent === "number" ? presetData.bondingCurvePercent : 30
  );

  //  Project Development Raise + amount
  const initialAmount = typeof presetData?.amountToRaise === "number" ? presetData.amountToRaise : 55;
  const [projectRaiseEnabled, setProjectRaiseEnabled] = useState<boolean>((presetData?.amountToRaise ?? initialAmount) > 0);
  const [amountToRaise, setAmountToRaise] = useState<number>(projectRaiseEnabled ? (presetData?.amountToRaise ?? initialAmount) : 0);
  const projectRaiseOpacity = projectRaiseEnabled ? 1 : 0.35;

  // Short link
  const [shortName, setShortName] = useState<string | null>(presetData?.short_link_name ?? null);
  const [shortNameError, _setShortNameError] = useState<string | null>(null); // in future use it for validation

  // Deadline
  const [deadlineDateTimeSec, setDeadlineDateTimeSec] = useState<number | undefined>(presetData?.deadline_sec);
  const [dataTimeError, setDataTimeError] = useState<string | null>(null);
  const [currentDataTime, setDataTime] = useState<Date>(new Date(presetData?.deadline_sec ? presetData.deadline_sec * 1000 : Date.now()));
  // Treasury Allocation (SOL) input
  const TREASURY_MAX_SOL = 217;
  const [treasuryRaw, setTreasuryRaw] = useState<string>(
    presetData?.treasuryAllocationSol != null ? String(presetData.treasuryAllocationSol) : ""
  );
  const initialTreasurySol = typeof presetData?.treasuryAllocationSol === "number" ? presetData.treasuryAllocationSol : 0;
  const [treasuryAllocationSol, setTreasuryAllocationSol] = useState<number>(initialTreasurySol);
  const [treasuryError, setTreasuryError] = useState<string | null>(null);

  const isMoreThanOneMonthAway = (d: Date) => {
    const now = new Date();
    const max = new Date(now);
    max.setMonth(max.getMonth() + 1); 
    return d.getTime() > max.getTime();
  };
  const ONE_HOUR_MS = 60 * 60 * 1000;
  const isLessThanOneHourAhead = (d: Date) => d.getTime() <= Date.now() + ONE_HOUR_MS;

  // Slider configs
  const bcLabels = [5, 25, 50, 75, 100];
  const bcPoints = [5, 15, 25, 37.5, 50, 62.5, 75, 87.5, 100];

  const raiseMax = 217; // per design
  const raiseLabels = [0, 50, 100, 150, 217];
  const raisePoints = [0, 25, 50, 75, 100, 125, 150, 183.5, 217];

  const treasuryPercent =
    tokenomicsData?.treasuryAllocationPercent != null
      ? `${Math.round(tokenomicsData.treasuryAllocationPercent)}%`
      : "—";

  const isFilledAll = (): boolean => {
    return deadlineDateTimeSec !== undefined && !dataTimeError && !treasuryError;
  };

  const handleSubmit = () => {
    if (!deadlineDateTimeSec) return;
    if (dataTimeError) return;
    onNext({
      deadline_sec: deadlineDateTimeSec,
      goal_sol: premarketGoalSol, // keep for now
      short_link_name: shortName?.length ? shortName : undefined,
      isFlatBondingCurveEnabled,
      bondingCurvePercent: clampInt(bondingCurvePercent, 0, 100),
      amountToRaise: projectRaiseEnabled ? clampInt(amountToRaise, 0, raiseMax) : 0,
      treasuryAllocationSol: treasuryAllocationSol, 
    });
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
          paddingHorizontal: isMobile ? 16 : 24,
          paddingVertical: isMobile ? 40 : 24,
          maxWidth: 500,
          flex: 1,
        }}
      >
        <View style={{ flex: 1 }}>
          <TokenCreateFormHeader title={"Premarket"} theme={theme} onClose={onClose} />

          {/* Flat Bonding Curve */}
          <View
            style={{
              marginTop: 22,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text variant="labelLarge" prominent>
              Flat Bonding Curve
            </Text>
            <Switch value={isFlatBondingCurveEnabled} onValueChange={setIsFlatBondingCurveEnabled} />
          </View>

          {/* Bonding Curve % (disabled when Flat Bonding Curve is OFF) */}
          <View style={{ marginTop: 22, opacity: bcOpacity }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text variant="labelLarge" prominent>
                Bonding Curve %
              </Text>
              <InfoBadge />
            </View>

            <View style={{ marginTop: 12, pointerEvents: isFlatBondingCurveEnabled ? "auto" : "none" }}>
              <CustomSlider
                initValue={bondingCurvePercent}
                min={0}
                max={100}
                step={1}
                bubbleWidth={90}
                formatBubbleText={(v) => `${Math.round(v)}%`}
                labels={bcLabels}
                formatLabel={(v) => `${v}%`}
                edgeLabelInset={8}
                points={bcPoints}
                onValueChange={(v) => setBondingCurvePercent(clampInt(v, 0, 100))}
                isMobile={isMobile}
              />
            </View>
          </View>

          {/* Project Development Raise */}
          <View
            style={{
              marginTop: 28,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text variant="labelLarge" prominent>
              Project Development Raise
            </Text>
            <Switch
              value={projectRaiseEnabled}
              onValueChange={(v) => {
                setProjectRaiseEnabled(v);
                setAmountToRaise(v ? Math.max(1, amountToRaise || 55) : 0);
              }}
            />
          </View>

          {/* Raise amount slider */}
          <View style={{ marginTop: 14, opacity: projectRaiseOpacity }}>
            <View style={{ marginTop: 12, pointerEvents: projectRaiseEnabled ? "auto" : "none" }}>
              <CustomSlider
                initValue={amountToRaise}
                min={0}
                max={raiseMax}
                step={1}
                bubbleWidth={120}
                formatBubbleText={(v) => `${Math.round(v)} SOL`}
                labels={raiseLabels}
                formatLabel={(v) => `${v} SOL`}
                edgeLabelInset={8}
                points={raisePoints}
                onValueChange={(v) => setAmountToRaise(clampInt(v, 0, raiseMax))}
                isMobile={isMobile}
              />
            </View>
          </View>

        {/* Treasury Allocation (SOL input) */}
          <View style={{ marginTop: 26 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text variant="labelLarge" prominent>
                Treasury Allocation
              </Text>
              <InfoBadge />
            </View>

            <TextInput
              disableRemoveBtn
              alwaysLabelOnTop
              label={`Treasury Allocation Up to ${TREASURY_MAX_SOL} SOL`}
              value={treasuryRaw}
              onChangeText={(text: string) => {
                const raw = normalizeStringDecimalInput(text); // no suffix here
                setTreasuryRaw(raw);

                if (!raw) {
                  setTreasuryAllocationSol(0);
                  setTreasuryError(null);
                  return;
                }

                const n = Number(raw);
                if (!Number.isFinite(n)) {
                  setTreasuryAllocationSol(0);
                  setTreasuryError(null);
                  return;
                }

                if (n > TREASURY_MAX_SOL) {
                  setTreasuryError(`Max ${TREASURY_MAX_SOL} SOL`);
                  setTreasuryAllocationSol(TREASURY_MAX_SOL);
                  setTreasuryRaw(String(TREASURY_MAX_SOL));
                  return;
                }

                setTreasuryError(null);
                setTreasuryAllocationSol(clamp(n, 0, TREASURY_MAX_SOL));
              }}
              inputMode="decimal"
              keyboardType="decimal-pad"
              placeholder="0"
              rightAffixText="SOL"
              mode="flat"
              errorValue={treasuryError}
            />
          </View>

          {/* Deadline */}
          <View style={{ paddingTop: 22 }}>
            <Text
              variant="bodySmall"
              style={{ color: colors.onSurfaceVariant }}
            >
              Premarket Deadline
            </Text>
            <DateTimeEditField
              value={currentDataTime}
              onChange={(newDate: Date) => {
                setDataTime(newDate);
                if (isLessThanOneHourAhead(newDate)) {
                  setDataTimeError("Deadline must be at least 1 hour from now");
                  setDeadlineDateTimeSec(undefined);
                  return;
                }
                const dataTimeNow = new Date();
                if (newDate.getTime() < dataTimeNow.getTime()) {
                  setDataTimeError("time should be in the future");
                  setDeadlineDateTimeSec(undefined);
                  return;
                }
                if (isMoreThanOneMonthAway(newDate)) {
                  setDataTimeError("Deadline can't be more than 1 month");
                  setDeadlineDateTimeSec(undefined);
                  return;
                }
                setDataTimeError(null);
                setDeadlineDateTimeSec(Math.floor(newDate.getTime() / 1000));// todo: check /1000(?)
              }}
            />
            <View style={{ marginTop: -20 }}>
              <HelperText type="error" visible={!!dataTimeError}>
                {dataTimeError ?? ""}
              </HelperText>
            </View>
          </View>

          {/* Short Name */}
          <View style={{ marginTop: 22, marginLeft: -8 }}>
            <TextInput
              label="Premarket short link"
              placeholder="eg. project_name"
              value={shortName??undefined}
              onChangeText={(text: string) => {
                setShortName(sanitizeShortPath(text))
              }}
              alwaysLabelOnTop={true}
              overrideRemoveBtn={() => setShortName("")}
              error={!!shortNameError}
              errorValue={shortNameError}
            />
            <HelperText visible={!!shortName} type="info">https://beta.revelcy.com/token/{shortName}</HelperText>
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
