import { TokenInfo} from "@api/token";
import { UserCard } from "@components/user/UserCard";
import { AppTheme } from "@theme/types";
import shortString from "@utils/address_shorter";
import { convertLamportToSmallCount } from "@utils/premarket";
import { View } from "react-native";
import { useTheme, Text} from "react-native-paper";

interface Props {
  tokenData: TokenInfo;
  holdersAmount: number;
  onUpdated: () => Promise<void>;
}
export function HoldersInfo({ tokenData, holdersAmount, onUpdated}: Props) {
  
  const { colors } = useTheme() as AppTheme;
  const holders = tokenData.dynamicInfo.holders
  const totalRaised = convertLamportToSmallCount(tokenData.dynamicInfo.reservedSolLamp)

  return (
    <View
      style={{
        backgroundColor: colors.surfaceContainerLowest,
        borderRadius: 20,
        padding: 24,
        gap: 32,
      }}
    >
      <Text variant="titleLarge"> People <Text variant="titleLarge" style={{color:colors.onSurfaceVariant}}>{holdersAmount}</Text></Text>
      <View>
        {holders.map((holder, ) => {
            console.log("joinTimestamp (", holder.walletAddress, ")->",  holder.joinTimestamp)

          const amount = convertLamportToSmallCount(holder.amountSolLamp)
          return (
            <View key={holder.walletAddress} style={{}}>
              <UserCard 
                baseInfo={{
                  userId: holder.id,
                  username: shortString(holder.walletAddress),
                  walletAddress: holder.walletAddress,
                  avatarUrl: holder.iconURL??null
                }}
                tokenInfo={{
                  userJoined: holder.joinTimestamp,
                  amount: amount,
                  amountProcent:(100*amount/totalRaised),
                  isCreator: tokenData.mainInfo.createdByPubkey === holder?.walletAddress
                }}
              />
            </View>
          );
        })
        }
      </View>

    </View>
  );
}