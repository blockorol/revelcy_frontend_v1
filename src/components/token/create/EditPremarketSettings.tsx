import ContinueButtonWithProgressBar from "@components/ContinueButtonWithProgressBar";
import { PremarketSettingData, TokenomicsData } from "@components/token/create/interface";
import TokenCreateFormHeader from "@components/token/create/TokenCreateFormHeader";
import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { HelperText, useTheme } from "react-native-paper";
import { Text } from "@components/ui/Text";
import { DateTimeEditField } from "@components/base/DateTimeEditField";
import { CustomSlider } from "@components/base/CustomSlider";
import BN from "bn.js";
import {
  convertLamportToSmallCount,
  convertSmallCountToLamport,
  convertSolToPercentOnStart,
} from "@utils/premarket";
import { useIsMobileWithDemention } from "@hooks/useIsMobile";
import { ExtendedMD3Colors } from "@theme/types";
import { DonutWithLegend } from "@components/base/DonutWithLegend";
import { round } from "@utils/numbers";
import { makeTransparent } from "@utils/colors";

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
  const minPremarketSol = tokenomicsData?.creatorInitialBuy??DEFAULT_PREMARKET_GOAL_SOL
  
  const initialBuyPersent = 
    tokenomicsData?.creatorInitialBuy ? 
      round(convertSolToPercentOnStart(tokenomicsData?.creatorInitialBuy), 1)
      : undefined

  const [percent, setPercent] = useState(0);
  const [premarketGoalSol, setPremarketGoalSol] = useState(
    presetData?.goal_sol_lamp ?
      convertLamportToSmallCount(presetData?.goal_sol_lamp):
      minPremarketSol
    );

  const [premarketGoalLamp, setPremarketGoalLamp] = useState<BN>
      (presetData?.goal_sol_lamp??convertSmallCountToLamport(minPremarketSol));
  const [goalError, setGoalError] = useState<string | null>(null);


  const [deadlineDateTimeSec, setDeadlineDateTimeSec] = useState<number | undefined>(
    presetData?.deadline_sec
  );
  const [dataTimeError, setDataTimeError] = useState<string | null>(null);
  const [currentDataTime, setDataTime] = useState<Date>(new Date());

  const isMoreThanOneMonthAway = (d: Date) => {
    const now = new Date();
    const max = new Date(now);
    max.setMonth(max.getMonth() + 1); 
    return d.getTime() > max.getTime();
  };
  const ONE_HOUR_MS = 60 * 60 * 1000;
  const isLessThanOneHourAhead = (d: Date) => d.getTime() <= Date.now() + ONE_HOUR_MS;


  const changeSliderPremarketValue = (value: number) => {
    setPremarketGoalSol(value)
    setPremarketGoalLamp(convertSmallCountToLamport(value))
    setPercent(convertSolToPercentOnStart(value))
    if (value < minPremarketSol) {
      setGoalError("The premarket goal must exceed the initial buy amount")
    } else {
      setGoalError(null)
    }
  };
  const handleSubmit = () => {
    if (!deadlineDateTimeSec) return;
    if (dataTimeError) return;
    if ((tokenomicsData?.creatorInitialBuy??0) >= premarketGoalSol) return
    onNext({
      deadline_sec: deadlineDateTimeSec,
      goal_sol_lamp: premarketGoalLamp,
    });
  };
  const isFilledAll = (): boolean => {
    return (
      (tokenomicsData?.creatorInitialBuy??0) < premarketGoalSol &&
      deadlineDateTimeSec !== undefined
    );
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
        <View style={{ flex: 1, gap: 0 }}>
          <TokenCreateFormHeader
            title={"Premarket"}
            theme={theme}
            onClose={onClose}
          />
          {/* Deadline */}
          <View style={{ paddingTop: 16 }}>
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
                setDeadlineDateTimeSec(Math.floor(newDate.getTime() / 1000)); // todo: check /1000(?)
              }}
            />
            <View style={{ marginTop: -20 }}>
              {" "}
              <HelperText type="error" visible={!!dataTimeError}>
                {dataTimeError??""}
              </HelperText>
            </View>
          </View>

          {/* Goal */}
          <View style={{ marginTop: 64 }}>
            <Text variant="labelLarge" prominent>Premarket Goal</Text>
            <CustomSlider
              min={2}
              max={80}
              labels={[10, 30, 50, 70]}
              points={[10, 20, 30, 40, 50, 60, 70]}
              onValueChange={changeSliderPremarketValue}
              isMobile={isMobile}
            />
            <View style={{ marginTop: -30 }}>
              {" "}
              <HelperText type="error" visible={true}>
                {goalError??" "}
              </HelperText>
            </View>
            <View style={{ marginTop: 24 }}>
              <DonutWithLegend
                slices={[
                  {
                    value: round(percent, 1),
                    additional: premarketGoalSol.toFixed(2),
                    label: "Premarket",
                    color: theme.colors.primary,

                    subSlices: initialBuyPersent?{
                      restColor: makeTransparent(theme.colors.onPrimary, 0.7),
                      slices: [{
                        value: initialBuyPersent??0,
                        label: "Creator (you) buy",
                        color:  makeTransparent(theme.colors.onPrimary, 0.5),
                        additional: tokenomicsData?.creatorInitialBuy.toFixed(2)
                      }]
                    }:undefined
                  },
                  {
                    value: round(80 - percent, 1),
                    label: "Bonding curve",
                    color: theme.colors.onSurface,
                  },
                  {
                    value: 20,
                    label: "Pumpswap pool",
                    color: theme.colors.secondary,
                  },
                ]}
              />
            </View>
            
            
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
