import { IconName, SvgIconButton } from "@components/base/SvgIcon";
import { Linking } from "react-native";
import { MD3Colors } from "react-native-paper/lib/typescript/types";

interface SvgIconButtonProps {
  name: IconName;
  size?: number;
  iconSize?:number;
  colors: MD3Colors;
  link: string;
}

export function RoundIconLink({ name, size = 32, iconSize=16, colors, link }: SvgIconButtonProps) {
    return <SvgIconButton onPress={()=>Linking.openURL(link)} name={name} size={iconSize}
    color={colors.onSurface}
    containerStyle={{
        justifyContent: "center",
        alignItems:"center",
        width: size,
        height: size,
        borderWidth: 2,
        borderColor: colors.onSurfaceVariant,
        backgroundColor: colors.surfaceVariant,
        opacity:0.4,
        borderRadius: size / 2,
    }}
    style={{
        opacity:1
    }}
     />
}
