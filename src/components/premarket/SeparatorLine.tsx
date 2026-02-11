import { View } from "react-native";
import { useTheme } from "react-native-paper";

export default function SeparatorLine () {
    const {colors} = useTheme()
    return <View
                style={{
                    height: 0.5,
                    backgroundColor: colors.outline,
                    marginVertical: 8,
                }}
            />
}