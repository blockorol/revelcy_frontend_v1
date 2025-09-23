import TwoScreenContainer from "@components/base/container/TwoScreensContainer";
import { useIsMobileForTwoScreenWithDemention } from "@hooks/useIsMobile";
import { useAuth } from "@providers/AuthContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View, Image } from "react-native";
import { ActivityIndicator, useTheme } from "react-native-paper";
import { token } from "@coral-xyz/anchor/dist/cjs/utils";
import { PremarketBaseInfo } from "@components/premarket/PremarketBaseInfo";
import { PremarketDynamicInfo } from "@components/premarket/PremarketDynamicInfo";
import { AboutCommunity } from "@components/premarket/AboutCommunity";
import { PremarketInfo } from "@components/premarket/PremarketInfo";
import { ExtendedMD3Colors } from "@theme/types";
import { PremarketAction } from "@components/premarket/PremarketAction";
import { usePremarketInfo } from "@hooks/usePremarketInfo";
import { HoldersInfo } from "@components/premarket/HoldersInfo";

interface TokenPremarketPageProps {
  tokenId: string;
}
export default function TokenPremarketPage({ tokenId }: TokenPremarketPageProps) {
  const { user } = useAuth();
  const theme = useTheme();
  const colors = theme.colors as ExtendedMD3Colors;
  const { isMobile, left } = useIsMobileForTwoScreenWithDemention();
  const router = useRouter();

  const { token, loading, error, refetch } = usePremarketInfo(tokenId);

  useEffect(() => {
    if (error) router.replace("/premarket");
  }, [error]);

  if (loading || !token) {
    return (
      <View style={{ flex:1, justifyContent:"center", alignItems:"center", backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <TwoScreenContainer
      backgroundColor={colors.background}
      left={
        <View style={{
          backgroundColor: colors.surfaceContainerLowest,
          justifyContent: "flex-start",
          alignItems: "center",
          width: left.width,
          borderRadius: 14,
          marginTop: isMobile ? 0 : 24,
        }}>
          <View style={{ width: left.width, justifyContent:"flex-start", alignItems:"center", padding:24 }}>
            {!!token.mainInfo.imageURL && (
              <Image
                source={{ uri: token.mainInfo.imageURL }}
                style={{ height:352, width:352, borderRadius:20, backgroundColor: colors.background, paddingBottom:32 }}
              />
            )}
            <View style={{ gap:48, paddingTop:32 }}>
              <PremarketBaseInfo tokenMainInfo={token.mainInfo} />
              <PremarketDynamicInfo tokenMainInfo={token.mainInfo} tokenDynamicInfo={token.dynamicInfo} />
              <PremarketAction
                tokenMainInfo={token.mainInfo}
                tokenDynamicInfo={token.dynamicInfo}
                onUpdated={refetch}
              />
            </View>
          </View>
        </View>
      }
      right={
        <View style={{ gap:24, paddingBottom: isMobile ? 70 : undefined }}>
          <AboutCommunity
            isCreator={token.mainInfo.createdByPubkey === user?.walletAddress}
            premarketPubkey={token.mainInfo.premarketPubkey.toString()}
            communityInfo={token.communityInfo}
          />
          <PremarketInfo
            tokenInfo={token}
            isMobile={isMobile}
            withJoinButton={user===null || token.dynamicInfo.holders.find(h => h.id === user.userId) === undefined}
            onUpdated={refetch}
          />
          <HoldersInfo 
            tokenData={token}
            holdersAmount={token.dynamicInfo.holdersCount}
            onUpdated={refetch}
            />
        </View>
      }
    />
  );
}
