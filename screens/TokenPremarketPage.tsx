import { MAX_WIDTH_MOBILE, useIsMobileForTwoScreenWithDemention } from "@hooks/useIsMobile";
import { useAuth } from "@providers/AuthContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View, ScrollView, useWindowDimensions, StyleSheet } from "react-native";
import { ActivityIndicator, useTheme, Text } from "react-native-paper";
import { PremarketBaseInfo } from "@components/premarket/PremarketBaseInfo";
import { PremarketDynamicInfo } from "@components/premarket/PremarketDynamicInfo";
import { AboutCommunity } from "@components/premarket/AboutCommunity";
import { PremarketInfo } from "@components/premarket/PremarketInfo";
import { ExtendedMD3Colors } from "@theme/types";
import { PremarketAction } from "@components/premarket/PremarketAction";
import { usePremarketInfo } from "@hooks/usePremarketInfo";
import { HoldersInfo } from "@components/premarket/HoldersInfo";
import { TokenInfo } from "@api/token";
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import React from "react";

interface TokenPremarketPageProps {
  tokenId: string;
}
export default function TokenPremarketPage({
  tokenId,
}: TokenPremarketPageProps) {
  const theme = useTheme();
  const { isMobile, left, right, screen } = useIsMobileForTwoScreenWithDemention();
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

  return isMobile ? (
    <TokenPremarketPageMobile
      token={token}
      refetchTokenInfo={refetch}
      screenDem={screen}
    />
  ) : (
    <TokenPremarketPageNormal
      token={token}
      refetchTokenInfo={refetch}
      left={left}
      rigth={right}
      screenDem={screen}
    />
  );
}

export function TokenPremarketPageNormal({
  token,
  refetchTokenInfo,
  left,
  rigth,
  screenDem,
}: {
  token: TokenInfo;
  refetchTokenInfo: () => Promise<void>;
  left: {
    width: number;
    height?: number;
  };
  rigth: {
    width: number;
    height?: number;
  }
  screenDem: {
    width: number;
    height: number;
  };
}) {
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
            }}
          >
            <View
              style={{
                width: left.width,
                justifyContent: "flex-start",
                alignItems: "center",
                padding: 24,
                paddingTop: 0,
              }}
            >
              <View style={{ gap: 48}}>
                <PremarketBaseInfo tokenMainInfo={token.mainInfo} isMobile={false}/>
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
              isMobile={false}
              width={rigth.width}
            />
            <PremarketInfo
              width={left.width}
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

export function TokenPremarketPageMobile({
  token,
  refetchTokenInfo,
  screenDem,
}: {
  token: TokenInfo;
  refetchTokenInfo: () => Promise<void>;
  screenDem: {
    width: number;
    height: number;
  };
}) {
  const theme = useTheme()
  const colors = theme.colors as ExtendedMD3Colors
  const renderScene = SceneMap({
    first: ()=>BriefMobile({token, refetchTokenInfo, screenDem}),
    second:()=> PeopleMobile({token, refetchTokenInfo, screenDem}),
  });
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);

  const routes = [
    { key: 'first', title: 'Brief' },
    { key: 'second', title: 'People' },
  ];
  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      // общий стиль бара
      style={[
        styles.tabbar,
        {
          backgroundColor: theme.colors.background,
          borderBottomColor: colors.outlineVariant,
        },
      ]}
      contentContainerStyle={styles.tabbarContent}
      tabStyle={styles.tabStyle}
      pressColor="transparent"
      indicatorStyle={[styles.indicatorStyle, {
        backgroundColor: colors.onSurface,
          borderBottomColor: colors.outlineVariant}]}
      indicatorContainerStyle={styles.indicatorContainerStyle}
      
    />
  );


  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={renderTabBar}



    />
  );
}

function BriefMobile({
  token,
  refetchTokenInfo,
  screenDem,
}: {
  token: TokenInfo;
  refetchTokenInfo: () => Promise<void>;
  screenDem: {
    width: number;
    height: number;
  };
}) {
  
  const { user } = useAuth();
  const theme = useTheme();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ height: screenDem.height, width: "100%",  backgroundColor: theme.colors.background,}}
    >
      <View
        style={{
          maxWidth: MAX_WIDTH_MOBILE,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: 'center',
          backgroundColor: theme.colors.background,
          paddingTop: 12,
          paddingBottom: 12,
          width: "100%",
          alignSelf: "center",
          gap: 24,
        }}
      >
        <PremarketBaseInfo tokenMainInfo={token.mainInfo} isMobile={true} />
        <PremarketDynamicInfo
          tokenMainInfo={token.mainInfo}
          tokenDynamicInfo={token.dynamicInfo}
        />
        <PremarketAction
          tokenMainInfo={token.mainInfo}
          tokenDynamicInfo={token.dynamicInfo}
          onUpdated={refetchTokenInfo}
        />
        <AboutCommunity
          isCreator={token.mainInfo.createdByPubkey === user?.walletAddress}
          premarketPubkey={token.mainInfo.premarketPubkey.toString()}
          communityInfo={token.communityInfo}
          isMobile={true}
          width={screenDem.width}
        />
        <PremarketInfo
          width={screenDem.width}
          tokenInfo={token}
          isMobile={true}
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
    </ScrollView>
  );
}


function PeopleMobile({
  token,
  refetchTokenInfo,
  screenDem,
}: {
  token: TokenInfo;
  refetchTokenInfo: () => Promise<void>;
  screenDem: {
    width: number;
    height: number;
  };
}) {
  const theme = useTheme();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ height: screenDem.height, width: "100%",  backgroundColor: theme.colors.background,}}
    >
      <View
        style={{
          maxWidth: MAX_WIDTH_MOBILE,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: 'center',
          backgroundColor: theme.colors.background,
          paddingTop: 12,
          paddingBottom: 12,
          width: "100%",
          alignSelf: "center",
          gap: 24,
        }}
      >
        <HoldersInfo
          tokenData={token}
          holdersAmount={token.dynamicInfo.holdersCount}
          onUpdated={refetchTokenInfo}
        />
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  tabbar: {
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabbarContent: {
    justifyContent: "center",
  },
  tabStyle: {
    width: "25%",
    marginHorizontal: 20,
    paddingHorizontal: 0,
  },
  indicatorStyle: { 
    justifyContent: "center", height: 2, width:'25%', marginLeft: '25%'
  },
  indicatorContainerStyle: {
    justifyContent: "center",
  },
}
);
