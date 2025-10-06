import { View } from "react-native"
import { Button, MD3Theme, ProgressBar } from "react-native-paper"

export type ContinueButtonWithProgressBarProps = {
    theme: MD3Theme;
    handleSubmit: () => void;
    handleSaveForLatter?: () => void;
    isFilledAll: () => boolean;
    progress?: {
        before: number;
        after: number;
    }
}

export default function ContinueButtonWithProgressBar({ 
    theme,

    handleSubmit, handleSaveForLatter, 
    isFilledAll,
    progress 
}: ContinueButtonWithProgressBarProps) {
    return (
    <View style={{width:'100%', marginTop: 20, flexDirection: 'column', gap: 16}}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
            {handleSaveForLatter && <Button
                mode="text"
                onPress={handleSaveForLatter}
                style={{ borderRadius: 14, width:122}}
                labelStyle={{ color: theme.colors.onSurfaceVariant }}
                >
                Save draft
            </Button>}
            <Button
                mode="contained"
                onPress={handleSubmit}
                disabled={!isFilledAll()}
                style={{ borderRadius: 14, width:130}}
                labelStyle={{ color: theme.colors.onPrimary }}
            >Continue</Button>
            
        </View>
        {progress&&
            <ProgressBar color={theme.colors.primary} progress={isFilledAll()?progress.after:progress.before}/>
        }
    </View>
    )
}