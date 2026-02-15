import { View } from "react-native";
import {Text} from "@components/ui/Text"
import { ActivityIndicator, useTheme } from "react-native-paper";
import { AppTheme } from "@theme/types";

interface LoaderProps {
    text?: string;
    colorOverride?:string
}


export default function TextedLoaderCentral({ text, colorOverride}: LoaderProps) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TextedLoader text={text} colorOverride={colorOverride} />
    </View>
  );
}


export function TextedLoader ({colorOverride, text}:LoaderProps) {
  const {colors} = useTheme<AppTheme>();
  return (
        <View
          style={{
            backgroundColor: colors.surfaceContainerHighest,
            gap: 20,
            padding: 24,
            borderRadius: 16,
            minWidth: 300,
            maxWidth: 400,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text variant="titleMedium" style={{ textAlign: 'center' }}>
            {text}
          </Text>
          <ActivityIndicator
            animating
            color={colorOverride??colors.primary}
            size="large"
          />
        </View>
  )
};