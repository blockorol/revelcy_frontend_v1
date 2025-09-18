import { DonutWithLegend } from "@components/base/DonutWithLegend";
import TextInput from "@components/base/form/TextInput";
import ContinueButtonWithProgressBar from "@components/ContinueButtonWithProgressBar";
import { TokenomicsData } from "@components/token/create/interface";
import TokenCreateFormHeader from "@components/token/create/TokenCreateFormHeader";
import useIsMobile from "@hooks/useIsMobile";
import { ExtendedMD3Colors } from "@theme/types";
import { convertSolToPercentOnStart } from "@utils/premarket";
import { convertNumberWithRaw } from "@utils/setterWithValidate";
import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { useTheme, Text, TextInput as TextInputPaper } from "react-native-paper";

  
export type EditTokenomicsFormProps = {
    onNext: (data: TokenomicsData) => void;
    onClose?: () => void;
    onBack?: () => void;
    step: number;
    totalSteps: number;
    presetData?: TokenomicsData
}
const SUFFIX = " SOL";


export default function EditTokenomicsForm({
    presetData,
    onBack, onClose, onNext,
    step, totalSteps
}: EditTokenomicsFormProps) {
    const isMobile = useIsMobile()
    const theme = useTheme();
    const colors = theme.colors as ExtendedMD3Colors;
    const [creatorInitialBuy, setCreatorInitialBuy] = useState<number|undefined>(presetData?.creatorInitialBuy);
    const [creatorInitialBuyRawStr, setCreatorInitialBuyRawStr] = useState<string|undefined>(presetData?.creatorInitialBuy ? presetData?.creatorInitialBuy.toString() + SUFFIX : undefined);
    const [errorCreatorInitialBuy, setErrorCreatorInitialBuy] = useState<string | null>(null);
    const [percent, setPercent] = useState<number>(presetData?.creatorInitialBuy ? convertSolToPercentOnStart(presetData?.creatorInitialBuy) : 0)
    const displayValue = (creatorInitialBuyRawStr && `${creatorInitialBuyRawStr}${SUFFIX}`) || "";
    const [selection, setSelection] = React.useState<{ start: number; end: number }>({ start: 0, end: 0 });


    const handleCreatorInitialBuyChangeWithSuffix = (text: string) => {
        let raw = text.endsWith(SUFFIX) ? text.slice(0, -SUFFIX.length) : text;

        raw = raw.replace(/\s+/g, "").replace(",", ".").replace(/[^0-9.]/g, "");
        const firstDot = raw.indexOf(".");
        if (firstDot !== -1) raw = raw.slice(0, firstDot + 1) + raw.slice(firstDot + 1).replace(/\./g, "");

        const value = convertNumberWithRaw(raw, setCreatorInitialBuyRawStr, setCreatorInitialBuy);
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
    React.useEffect(() => {
        const limit = (creatorInitialBuyRawStr ?? "").length;
        setSelection((s) => {
            const start = Math.min(s.start, limit);
            const end = Math.min(s.end, limit);
            return start === s.start && end === s.end ? s : { start, end };
        });
        }, [creatorInitialBuyRawStr]);

    const handleSubmit = () => {
        if (creatorInitialBuy !== undefined) {
            onNext({ creatorInitialBuy});
        }
    };
    const isFilledAll = () :boolean => {
        return creatorInitialBuy !== undefined && errorCreatorInitialBuy === null
    }

    
    return (
    <ScrollView showsVerticalScrollIndicator={false} style = {{ 
        backgroundColor: colors.surfaceContainerLowest, borderRadius: 16}}>
        <View style={{ 
            padding: 24,
            backgroundColor: colors.surfaceContainerLowest,
            borderRadius: isMobile?0:16,
            justifyContent: 'space-between',
            alignItems: 'stretch',
            width: '100%',
            height: '100%',
            maxWidth: 500,
            maxHeight:1000,
            minHeight: 300  
            }}>
            <View>
                <TokenCreateFormHeader title={"Edit Tokenomics"} theme={theme} onBack={onBack} onClose={onClose} />
        
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
                    style={{ backgroundColor: 'transparent' }}
                    theme={{ colors: colors }}        
                    errorValue={errorCreatorInitialBuy}
                />
                <View style={{paddingTop:40}}>
                    <View style={{
                        paddingTop:40,
                        paddingBottom: 20,
                        paddingRight: 16,
                        paddingLeft: 8,
                        borderRadius: 20,
                        backgroundColor:colors.surfaceContainerLowest,
                    }}>
                        <DonutWithLegend 
                        slices={[
                            {value:percent, label:"Creator (You)", color: theme.colors.primary},
                            {value:20, label:"Pumpswap pool", color: theme.colors.secondary},
                            {value:round(80-percent, 1), label:"Bonding curve", color: theme.colors.onSurface},
                        ]}
                        />
                    </View>
                    
                    <View style={{paddingTop: 16, justifyContent: 'space-between',flexDirection: 'row', alignItems: 'center',}}>
                        <Text variant='bodySmall'>Cost</Text>
                        <Text variant='bodySmall'>{round(0.2+(creatorInitialBuy??0),2)} SOL</Text>
                    </View>
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
            />
        </View>
    </ScrollView>
    );
}


function round(val: number, fractionDigits: number): number {
    return Number(val.toFixed(fractionDigits))
}
      