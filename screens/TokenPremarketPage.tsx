import { useIsMobileForTwoScreenWithDemention } from "@hooks/useIsMobile";
import { useAuth } from "@providers/AuthContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View, Image, ScrollView } from "react-native";
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
import { TokenInfo } from "@api/token";

interface TokenPremarketPageProps {
  tokenId: string;
}
export default function TokenPremarketPage({
  tokenId,
}: TokenPremarketPageProps) {
  const theme = useTheme();
  const { isMobile, left, screen } = useIsMobileForTwoScreenWithDemention();
  const router = useRouter();

  const { token, loading, error, refetch } = usePremarketInfo(tokenId);

  useEffect(() => {
    if (error) router.replace("/discovery");
  }, [error]);

  if (loading || !token) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return isMobile ? 
    TokenPremarketPageMobile(token, refetch, screen)
   : <TokenPremarketPageNormal token={token} refetchTokenInfo={refetch} left={left} screenDem={screen}/>
}

export function TokenPremarketPageNormal({token, refetchTokenInfo, left, screenDem}
:{  token: TokenInfo,
  refetchTokenInfo: () => Promise<void>,
  left: {
    width: number;
    height?: number;
  },
  screenDem: {
    width: number;
    height: number;
  }}
) {
  const { user } = useAuth();
  const theme = useTheme();
  const colors = theme.colors as ExtendedMD3Colors;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ height: screenDem.height }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "stretch",
          backgroundColor: theme.colors.background,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 12,
          width: "100%",
          alignSelf: "center",
          gap: 24,
        }}
      >
        <View style={{ width: left.width, flexShrink: 0 }}>
          <View
            style={{
              backgroundColor: colors.surfaceContainerLowest,
              justifyContent: "flex-start",
              alignItems: "center",
              width: left.width,
              borderRadius: 14,
              marginTop: 24,
            }}
          >
            <View
              style={{
                width: left.width,
                justifyContent: "flex-start",
                alignItems: "center",
                padding: 24,
              }}
            >
              {!!token.mainInfo.imageURL && (
                <Image
                  source={{ uri: token.mainInfo.imageURL }}
                  style={{
                    height: 352,
                    width: 352,
                    borderRadius: 20,
                    backgroundColor: colors.background,
                    paddingBottom: 32,
                  }}
                />
              )}
              <View style={{ gap: 48, paddingTop: 32 }}>
                <PremarketBaseInfo tokenMainInfo={token.mainInfo} />
                <PremarketDynamicInfo
                  tokenMainInfo={token.mainInfo}
                  tokenDynamicInfo={token.dynamicInfo}
                />
                <PremarketAction
                  tokenMainInfo={token.mainInfo}
                  tokenDynamicInfo={token.dynamicInfo}
                  onUpdated={refetchTokenInfo}
                />
              </View>
            </View>
          </View>
        </View>
        <View
          style={{
            flexGrow: 1,
            minWidth: 400,
            maxWidth: 800,
          }}
        >
          <View style={{ gap: 24 }}>
            <AboutCommunity
              isCreator={token.mainInfo.createdByPubkey === user?.walletAddress}
              premarketPubkey={token.mainInfo.premarketPubkey.toString()}
              communityInfo={token.communityInfo}
            />
            <PremarketInfo
              tokenInfo={token}
              isMobile={false}
              withJoinButton={
                user === null ||
                token.dynamicInfo.holders.find((h) => h.id === user.userId) ===
                  undefined
              }
              onUpdated={refetchTokenInfo}
            />
            <HoldersInfo
              tokenData={token}
              holdersAmount={token.dynamicInfo.holdersCount}
              onUpdated={refetchTokenInfo}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function TokenPremarketPageMobile(
  token: TokenInfo,
  refetchTokenInfo: () => Promise<void>,
  screenDem: {
    width: number;
    height: number;
  }
) {
  const { user } = useAuth();
  const theme = useTheme();
  const colors = theme.colors as ExtendedMD3Colors;
  const { isMobile, left, screen} = useIsMobileForTwoScreenWithDemention();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ height: screenDem.height }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "stretch",
          backgroundColor: theme.colors.background,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 12,
          width: "100%",
          alignSelf: "center",
          gap: 24,
        }}
      >
        <View style={{ width: left.width, flexShrink: 0 }}>
          <View
            style={{
              backgroundColor: colors.surfaceContainerLowest,
              justifyContent: "flex-start",
              alignItems: "center",
              width: left.width,
              borderRadius: 14,
              marginTop: isMobile ? 0 : 24,
            }}
          >
            <View
              style={{
                width: left.width,
                justifyContent: "flex-start",
                alignItems: "center",
                padding: 24,
              }}
            >
              {!!token.mainInfo.imageURL && (
                <Image
                  source={{ uri: token.mainInfo.imageURL }}
                  style={{
                    height: 352,
                    width: 352,
                    borderRadius: 20,
                    backgroundColor: colors.background,
                    paddingBottom: 32,
                  }}
                />
              )}
              <View style={{ gap: 48, paddingTop: 32 }}>
                <PremarketBaseInfo tokenMainInfo={token.mainInfo} />
                <PremarketDynamicInfo
                  tokenMainInfo={token.mainInfo}
                  tokenDynamicInfo={token.dynamicInfo}
                />
                <PremarketAction
                  tokenMainInfo={token.mainInfo}
                  tokenDynamicInfo={token.dynamicInfo}
                  onUpdated={refetchTokenInfo}
                />
              </View>
            </View>
          </View>
        </View>
        <View
          style={{
            flexGrow: 1,
            minWidth: 400,
            maxWidth: 800,
          }}
        >
          <View style={{ gap: 24, paddingBottom: isMobile ? 70 : undefined }}>
            <AboutCommunity
              isCreator={token.mainInfo.createdByPubkey === user?.walletAddress}
              premarketPubkey={token.mainInfo.premarketPubkey.toString()}
              communityInfo={token.communityInfo}
            />
            <PremarketInfo
              tokenInfo={token}
              isMobile={isMobile}
              withJoinButton={
                user === null ||
                token.dynamicInfo.holders.find((h) => h.id === user.userId) ===
                  undefined
              }
              onUpdated={refetchTokenInfo}
            />
            <HoldersInfo
              tokenData={token}
              holdersAmount={token.dynamicInfo.holdersCount}
              onUpdated={refetchTokenInfo}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

