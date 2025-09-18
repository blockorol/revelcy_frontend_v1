import { SvgIcon, SvgIconButton } from "@components/base/SvgIcon";
import { View } from "react-native";
import { IconButton, MD3Theme, Text } from "react-native-paper";

export type TokenCreateFormHeaderProps = {
    title: string
    theme: MD3Theme;
    onClose?: () => void;
    onBack?: () => void;
}

export default function TokenCreateFormHeader(
    { 
        title,
        theme,
        onClose, onBack
    }: TokenCreateFormHeaderProps) {
    return(
        <View style={{width: '100%', justifyContent: 'space-between',flexDirection: 'row', alignItems: 'center',}}>
            <View style={{ paddingRight:8, paddingLeft:8, gap: 16, flexDirection: 'row', alignItems: 'center',}}>
                <SvgIcon name="plant-outlined" size={24} color={theme.colors.onSurface}/>
                <Text variant='titleLarge' style={{color: theme.colors.onSurface, marginBottom: 4}}>{title}</Text>
            </View>
            {onClose&&<IconButton icon="close" size={18} iconColor={theme.colors.onSurface} onPress={onClose} />}
            {onBack&&<SvgIconButton name='arrow-left' size={18} color={theme.colors.onSurface} onPress={onBack} />}
        </View>
    )
}