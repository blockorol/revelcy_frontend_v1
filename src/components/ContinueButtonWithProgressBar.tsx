import { SvgIconButton } from "@components/base/SvgIcon";
import { View } from "react-native";
import { Button, MD3Theme, ProgressBar } from "react-native-paper";

export type ContinueButtonWithProgressBarProps = {
  theme: MD3Theme;
  onBack?: () => void;
  handleSubmit: () => void;
  handleSaveForLatter?: () => void;
  isFilledAll: () => boolean;
  progress?: {
    before: number;
    after: number;
  };
};

export default function ContinueButtonWithProgressBar({
  theme,
  onBack,
  handleSubmit,
  handleSaveForLatter,
  isFilledAll,
  progress,
}: ContinueButtonWithProgressBarProps) {
  return (
    <View style={{ width: "100%", flexDirection: "column", gap: 16, paddingTop: 24 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          alignContent: "center",
        }}
      >
        {onBack && (
          <SvgIconButton
            name="caret-left"
            onPress={onBack}
            color={theme.colors.onSurfaceVariant}
            size={32}
          />
        )}
        <View/>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
            alignContent: "center",
            gap: 8,
          }}
        >
          {handleSaveForLatter && (
            <Button
              mode="text"
              onPress={handleSaveForLatter}
              style={{ borderRadius: 14, width: 122 }}
              labelStyle={{ color: theme.colors.onSurfaceVariant }}
            >
              Save draft
            </Button>
          )}
          <Button
            mode="contained"
            onPress={handleSubmit}
            disabled={!isFilledAll()}
            style={{ borderRadius: 14, width: 130 }}
            labelStyle={{ 
              color: !isFilledAll() ? theme.colors.onSurfaceVariant : theme.colors.onPrimary,
              opacity: !isFilledAll() ? 0.3 : 1
            }}
          >
            Continue
          </Button>
        </View>
      </View>
      {progress && (
        <View style={{height:4, width: "100%", borderRadius: 4}}> 
        <ProgressBar
          color={theme.colors.primary}
          progress={isFilledAll() ? progress.after : progress.before}
          style={{borderRadius: 4}}
        />
        </View>
      )}
    </View>
  );
}
