import ContinueButtonWithProgressBar from "@components/ContinueButtonWithProgressBar";
import { PremarketSettingData } from "@components/token/create/interface";
import TokenCreateFormHeader from "@components/token/create/TokenCreateFormHeader";
import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { HelperText, useTheme } from "react-native-paper";
import { Text } from "@components/ui/Text";
import { DateTimeEditField } from "@components/base/DateTimeEditField";
import { CustomSlider } from "@components/base/CustomSlider";
import BN from "bn.js";
import {
  convertTokenToSolanaBuy,
  DEFAULT_TOKEN_COUNT_DECIMAL,
  getPersentOfPremartet,
} from "@utils/premarket";
import { useIsMobileWithDemention } from "@hooks/useIsMobile";
import { ExtendedMD3Colors } from "@theme/types";

export type EditPremarketSettingsFormProps = {
  onNext: (data: PremarketSettingData) => void;
  onClose?: () => void;
  onBack?: () => void;
  step: number;
  totalSteps: number;
  presetData?: PremarketSettingData;
};

export default function EditPremarketSettingsForm({
  presetData,
  onClose,
  onBack,
  onNext,
  step,
  totalSteps,
}: EditPremarketSettingsFormProps) {
  const { isMobile, height } = useIsMobileWithDemention();
  const theme = useTheme();
  const colors = theme.colors as ExtendedMD3Colors;
  const [premarketGoalPers, setPremarketGoalPers] = useState<number>(0);

  const [premarketGoalSolLamp, setPremarketGoalSolLamp] = useState<
    BN | undefined
  >(presetData?.goal_sol_lamp);
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
    setPremarketGoalPers(value);
    const tokenDec = getPersentOfPremartet(value);
    const zero = new BN(0);
    const sol = convertTokenToSolanaBuy({
      token_amount: tokenDec,
      reserves_sol: zero,
      reserves_token: DEFAULT_TOKEN_COUNT_DECIMAL,
    });
    setPremarketGoalSolLamp(sol.muln(-1));
  };
  const handleSubmit = () => {
    if (!deadlineDateTimeSec) return;
    if (dataTimeError) return;
    if (premarketGoalSolLamp !== undefined && deadlineDateTimeSec !== undefined) {
      onNext({
        goal_percent: premarketGoalPers,
        deadline_sec: deadlineDateTimeSec,
        goal_sol_lamp: premarketGoalSolLamp,
      });
    }
  };
  const isFilledAll = (): boolean => {
    return premarketGoalSolLamp !== undefined && deadlineDateTimeSec !== undefined;
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
            {dataTimeError && (
              <View style={{ marginTop: -20 }}>
                {" "}
                <HelperText type="error" visible={!!dataTimeError}>
                  {dataTimeError}
                </HelperText>
              </View>
            )}
          </View>

          {/* Goal */}
          <View style={{ marginTop: 64 }}>
            <Text variant="labelLarge" prominent>Premarket Goal</Text>
            <CustomSlider
              min={15}
              max={80}
              labels={[20, 40, 60, 79]}
              points={[20, 30, 40, 50, 60, 70, 79]}
              onValueChange={changeSliderPremarketValue}
              isMobile={isMobile}
            />
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
