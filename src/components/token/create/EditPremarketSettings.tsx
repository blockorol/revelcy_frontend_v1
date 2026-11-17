import ContinueButtonWithProgressBar from "@components/ContinueButtonWithProgressBar";
import { PremarketSettingData, TokenomicsData } from "@components/token/create/interface";
import TokenCreateFormHeader from "@components/token/create/TokenCreateFormHeader";
import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { HelperText, useTheme } from "react-native-paper";
import { Text } from "@components/ui/Text";
import { DateTimeEditField } from "@components/base/DateTimeEditField";
import { CustomSlider } from "@components/base/CustomSlider";
import { useIsMobileWithDemention } from "@hooks/useIsMobile";
import { ExtendedMD3Colors } from "@theme/types";
import { TOKEN_CONVERTOR_SETTINGS } from "env";
import TextInput from "@components/ui/TextInput";
import { sanitizeShortPath } from "@utils/url";
import { getTokenShortLink } from "@utils/shortLink";
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
  
  const [premarketGoalSol, setPremarketGoalSol] = useState(
    presetData?.goal_sol ??minPremarketSol
    );
  const [goalError, setGoalError] = useState<string | null>(null);
  
  const [shortName, setShortName] = useState<string | null>(presetData?.short_link_name ?? null);
  const [shortNameError, _setShortNameError] = useState<string | null>(null); // in future use it for validation

  const [deadlineDateTimeSec, setDeadlineDateTimeSec] = useState<number | undefined>(
    presetData?.deadline_sec
  );
  const [dataTimeError, setDataTimeError] = useState<string | null>(null);
  const [currentDataTime, setDataTime] = useState<Date>(new Date(presetData?.deadline_sec ? presetData.deadline_sec * 1000 : Date.now()));

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
    if (value < minPremarketSol) {
      setGoalError("The premarket goal must exceed the initial buy amount")
    } else {
      setGoalError(null)
    }
  };
  const handleSubmit = () => {
    if (!deadlineDateTimeSec) return;
    if (dataTimeError) return;
    if ((tokenomicsData?.creatorInitialBuy??0) > premarketGoalSol) return
    onNext({
      deadline_sec: deadlineDateTimeSec,
      goal_sol: premarketGoalSol,
      short_link_name: shortName?.length ? shortName : undefined,
    });
  };
  const isFilledAll = (): boolean => {
    return (
      (tokenomicsData?.creatorInitialBuy??0) <= premarketGoalSol &&
      deadlineDateTimeSec !== undefined
    );
  };
  const sliderFrom = 1
  const sliderTo = TOKEN_CONVERTOR_SETTINGS.SolTo80Percent
              
  const labels: number[]=sliderTo > 50 ? [10, 30, 50, 70, 86]: [5, 10, 15, 20]
  const points: number[]=sliderTo > 50 ?[10, 20, 30, 40, 50, 60, 70, 80, 86]: [2.5, 5, 7.5 , 10, 12.5,  15, 17.5, 20, 22.5]


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
              initValue={presetData?.goal_sol}
              min={sliderFrom}
              max={sliderTo}
              labels={labels}
              points={points}
              onValueChange={changeSliderPremarketValue}
              isMobile={isMobile}
            />
            <View style={{ marginTop: -30 }}>
              {" "}
              <HelperText type="error" visible={true}>
                {goalError??" "}
              </HelperText>
            </View>
          </View>

          {/* Short Name */}
          <View style={{ marginTop: 64 }}>
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
            <HelperText visible={!!shortName} type="info">{getTokenShortLink(shortName ?? undefined)}</HelperText>
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
