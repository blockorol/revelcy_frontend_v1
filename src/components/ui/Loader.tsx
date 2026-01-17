import { View } from "react-native";
import {Text} from "@components/ui/Text"
import { ActivityIndicator, useTheme } from "react-native-paper";

interface LoaderProps {
    text?: string;
    colorOverride?:string
}

export default function TextedLoader ({colorOverride, text}:LoaderProps) {
  const {colors} = useTheme()
  return (
    <View style={{ gap: 20 }}>
      <Text variant="titleMedium">{text??""}</Text>
      <ActivityIndicator animating color={colorOverride??colors.primary} size="large" />
    </View>
  )
};