import { IconName, SvgIcon } from "@components/base/SvgIcon";
import { View } from "react-native";
import { ProgressBar, useTheme, Text} from "react-native-paper";
import { MD3Colors } from "react-native-paper/lib/typescript/types";

interface HumanityLevelProps {
    level: number
}
interface checkerOuter {
    color: string
    onColor: string
    iconName: IconName
}

function getRobotChecker(colors: MD3Colors):checkerOuter {
    return {
        color: colors.error,
        onColor: colors.onError,
        iconName: 'robot-outlined'
    }
}

function getHalfRobotChecker(colors: MD3Colors):checkerOuter {
    return {
        color: colors.secondary,
        onColor: colors.onSecondary,
        iconName: 'robot-outlined'
    }
}
function getHumanChecker(colors: MD3Colors):checkerOuter {
    return {
        color: colors.primary,
        onColor: colors.onPrimary,
        iconName: 'smile-outlined'
    }
}

export default function HumanityLevel({level}: HumanityLevelProps) {
    const humanityLevelPer = Math.round(level*100)
    const {colors} = useTheme()
    const checkerOuterValue = level < 0.33 ? getRobotChecker(colors) : level < 0.66 ? getHalfRobotChecker(colors) :getHumanChecker(colors)
    return (
    <View style={{flex:1}}>
        <View style={{paddingLeft: 8, paddingRight:8, flexDirection: 'row', justifyContent:"flex-start"}}>
            <View style={{flex:humanityLevelPer}}/>
            <View style={{
                flexDirection: 'row', justifyContent:"flex-start", alignItems: 'center',
                borderRadius: 8, gap: 6, paddingTop: 2, paddingBottom:2, paddingLeft:10, paddingRight:10,
                backgroundColor:checkerOuterValue.color}}>
                <SvgIcon name={checkerOuterValue.iconName} size={16.25} sizeAround={20} color={checkerOuterValue.onColor}/>
                <Text variant="labelMedium" style={{color:checkerOuterValue.onColor}}>{humanityLevelPer}% human</Text>
            </View>
            <View style={{flex:100-humanityLevelPer}}/>
        </View>
        <View style={{paddingLeft: 24, paddingRight:24, height:10, flexDirection: 'row'}}>
            <View style={{flex:2*humanityLevelPer-1}}/>
            <View style={{
                flex:1,
                flexDirection: 'row', justifyContent:"flex-start", alignItems: 'center',
                height:10,
                 backgroundColor:checkerOuterValue.color
                }}>
            </View>
            <View style={{flex:200-2*humanityLevelPer-1}}/>
        </View>
        <View style={{
            flexDirection: 'row',
            justifyContent:"space-between",
            alignItems: 'center', gap:8}}>
            <SvgIcon name='robot-outlined' size={16} color={colors.onSurfaceVariant}/>
            <View style={{flex:1}}>
                <ProgressBar progress={level}
                color={checkerOuterValue.color}
                // style={{flex:1}}
                style={{borderRadius: 10}}
                /></View>
            <SvgIcon name='smile-outlined' size={16} color={colors.onSurfaceVariant}/>
        </View>
    </View>
    )
}
