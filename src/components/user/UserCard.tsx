import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, Avatar, useTheme } from "react-native-paper";
import { formatDistanceToNow } from "date-fns";
import { SvgIcon } from "@components/base/SvgIcon";

export interface UserCardProps {
  baseInfo: {
    userId: string;
    username?: string;
    walletAddress: string;
    avatarUrl: string | null;
  };
  tokenInfo: {
    userJoined: number; // timestamp
    amount: number; // SOL
    amountProcent: number; // %
    isCreator?: boolean;
  };
  stats?:Stats;
}
export interface Stats {
  humanity: StatsHumanity;
  balance?: number
  pumpFun?: StatsPumpFun;

}
export interface StatsPumpFun{
      followers?: number;
      createdTokens?: number;
      trades?: number;
    };
export type StatsHumanity =  "bot" | "likely human" | "human";

export const UserCard: React.FC<UserCardProps> = ({ baseInfo, tokenInfo, stats }) => {
  const { colors } = useTheme();
  const joinedAgo = formatDistanceToNow(tokenInfo.userJoined, { addSuffix: false });

  return (
    <View
      style={styles.container}
    >
        <View style={{flexDirection: "column", gap: 24}}>
            {/* Header row */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                <Avatar.Image
                size={48}
                source={baseInfo.avatarUrl ? { uri: baseInfo.avatarUrl } : require("@assets/avatar-placeholder.png")}
                />
                <View style={{flex: 1, gap: 6, flexDirection: 'column',}}>
                {baseInfo.username&&<Text variant='labelLarge' style={{color:colors.onSurface}}>{baseInfo.username}</Text>}
                {tokenInfo.isCreator ? (
                    <View style={styles.creator}> 
                        <Text variant='labelMedium' style={{ color: colors.primary}}>Creator</Text>
                    </View>
                ) : (
                    <Text variant='labelMedium' style={{ color: colors.onSurfaceVariant, opacity: 0.8 }}>{joinedAgo}</Text>
                )}
                </View>

                <View style={{ alignItems: "flex-end", gap:4, paddingVertical:4 }}>
                <Text variant='labelLarge' style={{ color: colors.onSurface, fontWeight: 700}}>{tokenInfo.amount.toFixed(1)} SOL</Text>
                <Text variant='labelMedium' style={{ color: colors.onSurfaceVariant, fontWeight: 700 }}>{tokenInfo.amountProcent.toFixed(1)}%</Text>
                </View>
            </View>

        
        <View style={{ flexDirection: 'column', gap: 8 }}>

      {/* Joined and humanity */}
      {stats&&<JoinedAndHumanity {...stats}/>}
      
      </View>
      </View>
    </View>
  );
};


export function JoinedAndHumanity ({humanity, balance, pumpFun}: Stats) {
  const {colors} = useTheme()
  const humanityColor = 
    humanity === "bot" ? colors.error : colors.primary;
  const humanityLabel = 
    humanity === "bot" ? "Likely a bot" : 
    humanity === "human" ? "Human" : 
      "Likely human";

  return (
    <View>
    {(balance || humanity) &&
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <SvgIcon name='wallet-outlined' size={20} color={colors.onSurface} style={{paddingRight:4 }} />
        {humanity&&
          <View style={{ flexDirection: "row", alignItems: "center", gap: 2}}>
            <Text variant='labelMedium' style={{ color: humanityColor}}>{humanityLabel}</Text>
            <SvgIcon name={humanity === 'bot' ?'robot-outlined':'smile-outlined'} size={20} color={humanityColor} />
          </View>
        }
        {balance && 
          <Text variant='labelMedium' style={{ color: colors.onSurfaceVariant}}>Balance <Text variant='labelMedium' style={{ color: colors.onSurface, fontWeight: 700}}>${balance}</Text></Text>
        }
      </View>
    }

      {/* PumpFun Stats */}
      {pumpFun&&
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <SvgIcon name='pumpfun' size={20} color={colors.onSurface} style={{paddingRight:4 }} />
          {pumpFun.followers && (
            <Text variant='labelMedium' style={{ color: colors.onSurfaceVariant}}>Followers <Text variant='labelMedium' style={{ color: colors.onSurface, fontWeight: 700}}>{pumpFun.followers}</Text></Text>
          )}
          
          {pumpFun.createdTokens && (
            <Text variant='labelMedium' style={{ color: colors.onSurfaceVariant}}>Created <Text variant='labelMedium' style={{ color: colors.onSurface, fontWeight: 700}}>{pumpFun.createdTokens}</Text></Text>
          )}
          {pumpFun.trades && (
            <Text variant='labelMedium' style={{ color: colors.onSurfaceVariant}}>Traded <Text variant='labelMedium' style={{ color: colors.onSurface, fontWeight: 700}}>{pumpFun.trades}</Text></Text>
          )}
        </View>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1B1C',
    borderRadius: 24,
    padding: 24,
    margin: 0,
    width: 368,
    height: 196,
    gap: 24,
  },
  creator: {
    width: 71,
    height: 20,
    backgroundColor: 'rgba(0, 255, 119, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius:6,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
});
