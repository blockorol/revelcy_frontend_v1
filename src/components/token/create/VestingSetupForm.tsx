import React, { useMemo, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { Switch, useTheme } from "react-native-paper";
import { Text } from "@components/ui/Text";
import TokenCreateFormHeader from "@components/token/create/TokenCreateFormHeader";
import ContinueButtonWithProgressBar from "@components/ContinueButtonWithProgressBar";
import { CustomSlider } from "@components/base/CustomSlider";
import { useIsMobileWithDemention } from "@hooks/useIsMobile";
import { ExtendedMD3Colors } from "@theme/types";


export type VestingData = {
    enabled: boolean;
    unlockAtLaunchPercent: number;
    vestingPeriodSec: number;
};

type Props = {
    onNext: (data: VestingData) => void;
    onClose?: () => void;
    onBack?: () => void;
    onSaveDraft?: () => void;
    step: number;
    totalSteps: number;
    presetData?: Partial<VestingData>;
};

const UNLOCK_MIN = 0;
const UNLOCK_MAX = 50;

const PERIODS: Array<{ label: string; pill: string; sec: number }> = [
    { label: "1h", pill: "1 hour vesting", sec: 1 * 3600 },
    { label: "3h", pill: "3 hour vesting", sec: 3 * 3600 },
    { label: "1d", pill: "1 day vesting", sec: 1 * 24 * 3600 },
    { label: "1w", pill: "1 week vesting", sec: 7 * 24 * 3600 },
    { label: "1m", pill: "1 month vesting", sec: 30 * 24 * 3600 },
    { label: "3m", pill: "3 month vesting", sec: 90 * 24 * 3600 },
];

function clampInt(v: number, min: number, max: number) {
    const n = Math.round(v);
    return Math.max(min, Math.min(max, n));
}

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

export default function VestingSetupForm({
    onNext,
    onClose,
    onBack,
    onSaveDraft,
    step,
    totalSteps,
    presetData,
}: Props) {
    const { isMobile } = useIsMobileWithDemention();
    const theme = useTheme();
    const colors = theme.colors as ExtendedMD3Colors;

    const presetPeriodIndex = useMemo(() => {
        const sec = presetData?.vestingPeriodSec;
        const idx = sec != null ? PERIODS.findIndex((p) => p.sec === sec) : -1;
        return idx >= 0 ? idx : 3;
    }, [presetData?.vestingPeriodSec]);



    const [enabled, setEnabled] = useState(presetData?.enabled ?? true);
    const [unlockPercent, setUnlockPercent] = useState(
        clampInt(presetData?.unlockAtLaunchPercent ?? 25, UNLOCK_MIN, UNLOCK_MAX)
    );
    const [periodIndex, setPeriodIndex] = useState(presetPeriodIndex);

    const period = PERIODS[periodIndex];
    const disabledOpacity = enabled ? 1 : 0.35;

    const unlockLabels = [0, 25, 50];
    const unlockPoints = [0, 12.5, 25, 37.5, 50];

    const periodPoints = [0, 1, 2, 3, 4, 5];


    const handleSubmit = () => {
        onNext({
            enabled,
            unlockAtLaunchPercent: enabled ? unlockPercent : 0,
            vestingPeriodSec: enabled ? period.sec : 0,
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
                    <TokenCreateFormHeader title={"Vesting Setup"} theme={theme} onClose={onClose} />

                    {/* Vesting toggle */}
                    <View
                        style={{
                            marginTop: 22,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <Text variant="labelLarge" prominent>
                            Vesting
                        </Text>
                        <Switch value={enabled} onValueChange={setEnabled} />
                    </View>

                    {/* Unlock at launch */}
                    <View style={{ marginTop: 30, opacity: disabledOpacity }}>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: 8,
                            }}
                        >
                            <Text variant="labelLarge" prominent>
                                Unlock at launch
                            </Text>
                            <InfoBadge />
                        </View>



                        <View style={{ marginTop: 12, pointerEvents: enabled ? "auto" : "none" }}>
                            <CustomSlider
                                initValue={unlockPercent}
                                min={UNLOCK_MIN}
                                max={UNLOCK_MAX}
                                step={1}
                                bubbleWidth={120}
                                formatBubbleText={(v) => `${Math.round(v)}% unlock`}
                                labels={unlockLabels}
                                formatLabel={(v) => `${v}%`}
                                edgeLabelInset={8}
                                points={unlockPoints}
                                onValueChange={(v) => setUnlockPercent(clampInt(v, UNLOCK_MIN, UNLOCK_MAX))}
                                isMobile={isMobile}
                            />
                        </View>
                    </View>

                    {/* Vesting period */}
                    <View style={{ marginTop: 36, opacity: disabledOpacity }}>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: 8,
                            }}
                        >
                            <Text variant="labelLarge" prominent>
                                Vesting period
                            </Text>
                            <InfoBadge />
                        </View>



                        <View style={{ marginTop: 12, pointerEvents: enabled ? "auto" : "none" }}>
                            <CustomSlider
                                initValue={periodIndex}
                                min={0}
                                max={PERIODS.length - 1}
                                step={1}
                                bubbleWidth={140}
                                formatBubbleText={(v) => {
                                    const idx = clampInt(v, 0, PERIODS.length - 1);
                                    return PERIODS[idx].pill;
                                }}
                                labels={PERIODS.map((_, i) => i)}
                                formatLabel={(_, idx) => PERIODS[idx]?.label ?? ""}
                                edgeLabelInset={8}
                                points={periodPoints}
                                onValueChange={(v) => setPeriodIndex(clampInt(v, 0, PERIODS.length - 1))}
                                isMobile={isMobile}
                            />

                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={{ marginTop: 18, paddingBottom: isMobile ? 8 : 16 }}>
                    <ContinueButtonWithProgressBar
                        theme={theme}
                        progress={{
                            before: (step - 1) / totalSteps,
                            after: step / totalSteps,
                        }}
                        onBack={onBack}
                        handleSaveForLatter={onSaveDraft}
                        handleSubmit={handleSubmit}
                        isFilledAll={() => true}
                    />
                </View>
            </View>
        </ScrollView>
    );
}
