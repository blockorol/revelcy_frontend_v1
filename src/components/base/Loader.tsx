import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface LoaderProps {
    text?: string
}
export default function Loader({text}:LoaderProps) {
    const theme = useTheme();
    return (
        <View style={{gap:4,flexDirection: 'row', alignItems: 'center', justifyContent: "flex-start" }}>
            <View style={{width:10, height: 10, padding: 3, backgroundColor: theme.colors.primary, borderRadius: 16}}/>
            {text !== undefined && (<Text variant='labelMedium' style={{color:theme.colors.onSurfaceVariant}}>{text}</Text>)}
        </View>
    )
}