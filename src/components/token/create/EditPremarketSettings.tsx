import ContinueButtonWithProgressBar from "@components/ContinueButtonWithProgressBar";
import { PremarketSettingData, TokenomicsData } from "@components/token/create/interface";
import TokenCreateFormHeader from "@components/token/create/TokenCreateFormHeader";
import React, { FC, useState } from "react";
import { ScrollView, View } from "react-native";
import { HelperText, useTheme, Text } from "react-native-paper";
import { MarkerProps } from '@react-native-community/slider';
import { DateTimeEditField } from "@components/base/DateTimeEditField";
import { CustomSlider } from "@components/base/CustomSlider";
import BN from "bn.js";
import { convertTokenToSolanaBuy, DEFAULT_TOKEN_COUNT_DECIMAL, getPersentOfPremartet } from "@utils/premarket";
import useIsMobile from "@hooks/useIsMobile";
import { ExtendedMD3Colors } from "@theme/types";



  
export type EditPremarketSettingsFormProps = {
    onNext: (data: PremarketSettingData) => void
    onClose?: () => void;
    onBack?: () => void;
    step: number;
    totalSteps: number;
    presetData?: PremarketSettingData;
}


export default function EditPremarketSettingsForm({
    presetData, 
    onClose, onBack, onNext,
    step, totalSteps}: EditPremarketSettingsFormProps) {
    const isMobile = useIsMobile()
    const theme = useTheme();
    const colors = theme.colors as ExtendedMD3Colors;
    const [premarketGoalPers, setPremarketGoalPers] = useState<number>(0);

    
    const [premarketGoalSolLamp, setPremarketGoalSolLamp] = useState<BN|undefined>(presetData?.goal_sol_lamp);
    const [deadlineDateTime, setDeadlineDateTime] = useState<number|undefined>(presetData?.deadline);
    const [dataTimeError, setDataTimeError] = useState<string | null>(null);
    const [currentDataTime, setDataTime] = useState<Date>(new Date());

    const changeSliderPremarketValue = (value: number) => {
        setPremarketGoalPers(value)
        const tokenDec = getPersentOfPremartet(value)
        const zero = new BN(0)
        const sol = convertTokenToSolanaBuy({
            token_amount: tokenDec,
            reserves_sol: zero,
            reserves_token: DEFAULT_TOKEN_COUNT_DECIMAL,
        })
        setPremarketGoalSolLamp(sol.muln(-1))
    } 
    const handleSubmit = () => {
        if (premarketGoalSolLamp !== undefined && deadlineDateTime !== undefined) {
            onNext({
                goal_percent:premarketGoalPers,
                deadline:deadlineDateTime,
                goal_sol_lamp: premarketGoalSolLamp
            });
        }
    };
    const isFilledAll = () :boolean => {
        return premarketGoalSolLamp !== undefined && deadlineDateTime !== undefined
    }

    
    return (
    <ScrollView showsVerticalScrollIndicator={false} style = {{ 
        backgroundColor: colors.surfaceContainerLowest, 
        borderRadius: 16,
        height: "100%"
        }}>
        <View style={{ padding: 24, backgroundColor: colors.surfaceContainerLowest, borderRadius:  isMobile?0:16,
            justifyContent: 'space-between',
             alignItems: 'stretch', width: '100%', height:'100%', maxWidth: 500, maxHeight:isMobile?"100%":1000  }}>
            <View style={{height:"100%"}}>
            <TokenCreateFormHeader title={"Premarket"} theme={theme} onClose={onClose} />
                <View style={{paddingTop: 20}}>
                    <Text variant='bodySmall'> Premarket Deadline</Text>
                    <DateTimeEditField
                        value={currentDataTime}
                        onChange={
                            (newDate: Date) => {
                                setDataTime(newDate);
                                
                                const dataTimeNow = new Date();
                                if (newDate.getTime() < dataTimeNow.getTime()) {
                                    setDataTimeError("time should be in the future")
                                    setDeadlineDateTime(undefined)
                                    return
                                }
                                setDataTimeError(null)
                                setDeadlineDateTime(Math.floor(newDate.getTime() / 1000))
                            }
                        }
                    />
                    {dataTimeError && <HelperText type="error" visible={!!dataTimeError}>{dataTimeError}</HelperText>}
                </View>
                <View>
                    <Text variant='titleLarge'> Premarket Goal</Text>
                    <CustomSlider
                        min={15}
                        max={80}
                        labels={[20, 40, 60, 79]}
                        points = {[20, 30, 40, 50, 60, 70, 79]}
                        onValueChange={changeSliderPremarketValue}
                    />
                </View>

            </View>
        
        
            <ContinueButtonWithProgressBar 
                theme={theme}
                progress={{
                    before:(step-1)/totalSteps,
                    after:(step)/totalSteps,
                }}
                handleSubmit={handleSubmit}
                isFilledAll={isFilledAll}
                onBack={onBack}
            />
        </View>
    </ScrollView>
    );
}
