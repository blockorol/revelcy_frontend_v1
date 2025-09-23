import { TokenDynamicInfo, TokenMainInfo } from "@api/token";

import { PremarketJoin } from "@components/premarket/PremarketJoin";
import { PremarketUserJoined } from "@components/premarket/PremarketUserJoined";
import { CreatorInfo } from "@components/premarket/CreatorInfo";
import { useAuth } from "@providers/AuthContext";
import { Button, useTheme, Text} from "react-native-paper";
import { View } from "react-native";
import { SvgIcon } from "@components/base/SvgIcon";

interface PremarketActionProps {
  tokenMainInfo: TokenMainInfo;
  tokenDynamicInfo: TokenDynamicInfo;
  onUpdated: () => Promise<void>;
}

export function PremarketAction({ tokenMainInfo, tokenDynamicInfo, onUpdated}: PremarketActionProps) {
    const { user } = useAuth();
    if (!user) {
        return <Button> Login</Button>
    }
    const isCreator = tokenMainInfo.createdByPubkey === user.walletAddress
    const userJoined = tokenDynamicInfo.holders.find((holder) =>  holder.id === user.userId) !== undefined

    switch (tokenMainInfo.state) {
        case 'premarket':
            return <PremarketActionPremarket 
                tokenMainInfo={tokenMainInfo}
                tokenDynamicInfo={tokenDynamicInfo}
                isCreator={isCreator}
                userJoined={userJoined}
                onUpdated={onUpdated}
                />
        case 'canceled':
            return <PremarketActionCanceled />
        case 'finished':
            return <PremarketActionLaunched />

    }
    
}


interface PremarketActionLaunchedProps {
  tokenMainInfo: TokenMainInfo;
  tokenDynamicInfo: TokenDynamicInfo;
  isCreator: boolean;
  userJoined: boolean;
  onUpdated: () => Promise<void>;
}

export function PremarketActionPremarket({ tokenMainInfo, tokenDynamicInfo, isCreator, userJoined, onUpdated}: PremarketActionLaunchedProps) {
    const {colors} = useTheme()

    const now = Math.floor(Date.now() / 1000);
    const isDeadline = tokenMainInfo.premarketDeadline < now

    return (
        <View style={{ gap: 48, alignItems:'center' }}>
            {
                isDeadline ? <Text variant='labelSmall' style={{color:colors.onSurfaceVariant}}>Waiting for creator action: Finish premarket</Text> :
                userJoined ?
                    <PremarketUserJoined 
                        onUpdated={onUpdated}
                        premarketPubkey={tokenMainInfo.premarketPubkey}
                    />
                        :
                    <PremarketJoin
                        tokenMainInfo={tokenMainInfo}
                        tokenDynamicInfo={tokenDynamicInfo}
                        onUpdated={onUpdated}
                    />
            }
            {
                isCreator && <CreatorInfo 
                tokenMainInfo={tokenMainInfo}
                isGoalReached={tokenMainInfo.premarketGoalSolLamp.lte(tokenDynamicInfo.marketCapSolLamp)}
                onUpdated={onUpdated}
                />
            }
        </View>
    )
}


export function PremarketActionCanceled() {
    return (
        <View style={{ gap: 48 }}>
        </View>
    )
}


export function PremarketActionLaunched() {
    const {colors} = useTheme()
    return (
        <View style={{ flexDirection: 'row', gap:16 }}>
            <Button mode='contained' style={{width:270}}>Buy</Button> 
            <Button mode='contained'> <SvgIcon name='tg-logo' color={colors.onPrimary}/> </Button>
        </View>
    )
}