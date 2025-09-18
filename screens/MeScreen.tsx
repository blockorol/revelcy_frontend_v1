import OneScreenContainer from "@components/base/container/OneScreenContainer";
import { IconName, SvgIcon, SvgIconButton } from "@components/base/SvgIcon";
import { WalletInfo } from "@components/login/WalletConnectionCheckerArea";
import { useIsMobileForOneScreenWithDemention } from "@hooks/useIsMobile";
import { useAuth } from "@storage/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { Linking, View } from "react-native";
import { Avatar, Text, useTheme } from "react-native-paper";
import { MD3Colors } from "react-native-paper/lib/typescript/types";


export default function MeScreen() {
    const { user } = useAuth();
    const {colors} = useTheme();
    const {isMobile, width} = useIsMobileForOneScreenWithDemention()

    // useEffect(() => {
    //     if (user === null) {
    //         router.replace('/');
    //     }
    // }, [user]);
    if (user === null) {
        return (<></>)
    }



  return (
    <OneScreenContainer backgroundColor={colors.background} >
        <View 
            style={{
                backgroundColor:colors.surfaceVariant,
                justifyContent: "flex-start",
                alignItems: "center"
            }}
        >
            <LinearGradient

                colors={[colors.primary, colors.background]}        
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{
                    width: isMobile? width :480,
                    paddingTop: 40,
                    paddingBottom: 64,
                    gap:16,
                    justifyContent: "flex-start",
                    alignItems: "center"
                }}
            >
                {
                user.avatarUrl !== null ?
                    <Avatar.Image size={112} source={{ uri: user.avatarUrl }} style={{
                    // borderRadius: 8,
                    borderWidth: 2,
                    borderColor: colors.primary,
                    backgroundColor: colors.background
                    }} /> :
                    <SvgIcon name="smile-outlined" size={112} color={colors.primary} />
                }
                <Text variant='titleLarge'>{user.username}</Text>
                <View style={{
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: 'row',
                    gap: 8
                }}>
                    <RoundIconLink name='search' colors={colors} link={getSolanaUserProfileLink(user.walletAddress)} />
                    <RoundIconLink name='pumpfun' colors={colors} link={getPumpFunUserProfileLink(user.walletAddress)} />

                </View>
            </LinearGradient>
            <View style={{
                width: isMobile? width :480,
                justifyContent:"flex-start",
                backgroundColor: colors.background
                }}>
                <WalletInfo colors={colors} enabledFeatures={{dateAndBalance: true, transactionCount: true, humanity:true}}/>
            </View>
        </View>
        
    </OneScreenContainer>

  )
}

function getSolanaUserProfileLink(userAddress: string) {
    return `https://solscan.io/account/${userAddress}`
}

function getPumpFunUserProfileLink(userAddress: string) {
    return `https://pump.fun/profile/${userAddress}`
}

interface SvgIconButtonProps {
  name: IconName;
  size?: number;
  iconSize?:number;
  colors: MD3Colors;
  link: string;
}

function RoundIconLink({ name, size = 32, iconSize=16, colors, link }: SvgIconButtonProps) {
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
