import { MAX_WIDTH_MOBILE, useIsMobileForTwoScreenWithDemention } from "@hooks/useIsMobile";
import { useAuth } from "@providers/AuthContext";
import { useRouter } from "@hooks/useSafeRouter";
import { useEffect } from "react";
import { View, ScrollView, useWindowDimensions, StyleSheet } from "react-native";
import { ActivityIndicator, useTheme, Text } from "react-native-paper";
import { PremarketBaseInfo } from "@components/premarket/PremarketBaseInfo";
import { PremarketDynamicInfo } from "@components/premarket/PremarketDynamicInfo";
import { AboutCommunity } from "@components/premarket/AboutCommunity";
import { PremarketInfo } from "@components/premarket/PremarketInfo";
import { ExtendedMD3Colors } from "@theme/types";
import { PremarketAction } from "@components/premarket/PremarketAction";
import { YourEntry } from "@components/premarket/YourEntry";
import { usePremarketInfo } from "@hooks/usePremarketInfo";
import { HoldersInfo } from "@components/premarket/HoldersInfo";
import { TokenInfo, UserEntry } from "@api/token";
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import React from "react";
import { Button } from "@components/ui/Button";
import { useHolderEntryInfo } from "@hooks/useHolderEntryInfo";
import { VestingCard } from "@components/premarket/VestingCard";
import { VestingSetting } from "@components/premarket/VestingSetting";

const SLIDER_HEIGHT = 48

interface TokenPremarketPageProps {
  tokenId: string;
}
export default function TokenPremarketPage({
  tokenId,
}: TokenPremarketPageProps) {
  const theme = useTheme();
  const { isMobile, left, right, screen } = useIsMobileForTwoScreenWithDemention();
  const router = useRouter();

  const { token, loading, error, refetch: refetchPremarketInfo } = usePremarketInfo(tokenId);
  const {user} = useAuth();
  const {holderEntryInfo, refetch: refetchHolder} = useHolderEntryInfo(token?.mainInfo.premarketPubkey.toBase58(), user?.walletAddress)

  const refetch = async () => {
    console.log("Refetching premarket and holder info...");
    await Promise.all([
      refetchPremarketInfo(),
      refetchHolder(),
    ]);
    console.log("Refetched premarket and holder info");
  };

  useEffect(() => {
    if (error) router.replace("/discover");
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
      holderEntryInfo={holderEntryInfo}
      refetchTokenInfo={refetch}
      screenDem={screen}
    />
  ) : (
    <TokenPremarketPageNormal
      token={token}
      holderEntryInfo={holderEntryInfo}
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
  holderEntryInfo,
  left,
  rigth,
  screenDem,
}: {
  token: TokenInfo;
  holderEntryInfo: UserEntry | null;
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
      style={{ 
        height: screenDem.height, 
        backgroundColor: theme.colors.background,
      }}
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
        <View style={{ width: left.width, flexShrink: 0, gap: 24 }}>
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
              <View style={{ gap: 32}}>
                <PremarketBaseInfo tokenMainInfo={token.mainInfo} isMobile={false}/>
                <PremarketDynamicInfo
                  tokenMainInfo={token.mainInfo}
                  tokenDynamicInfo={token.dynamicInfo}
                  isMobile={false}
                />
                <PremarketAction
                  tokenMainInfo={token.mainInfo}
                  tokenDynamicInfo={token.dynamicInfo}
                  holderEntryInfo={holderEntryInfo}
                  onUpdated={refetchTokenInfo}
                  isMobile={false}
                />
                
                {(!(user && holderEntryInfo)) && !!token.mainInfo.vestingInfo?.enabled && (
                  <VestingSetting
                    periodSec={token.mainInfo.vestingInfo?.vestingPeriodSec ?? 0}
                    percentInit={token.mainInfo.vestingInfo?.unlockAtLaunchPercent ?? 0}
                  />
                )}
              </View>
            </View>
          </View>
          {user && holderEntryInfo && (
            <YourEntry 
              premarketPubkey={token.mainInfo.premarketPubkey}
              user={user}
              userEntry={holderEntryInfo}
              tokenDynamicInfo={token.dynamicInfo}
              tokenMainInfo={token.mainInfo}
              onUpdated={refetchTokenInfo}
              isMobile={false}
            />
          )}
        </View>
        <View
          style={{
            flexGrow: 1,
            minWidth: 400,
            maxWidth: 800,
          }}
        >
          <View style={{ gap: 24}}>
            <AboutCommunity
              isEditable={(token.mainInfo.createdByPubkey === user?.walletAddress) && (token.mainInfo.state === 'premarket' || token.mainInfo.state === 'expired')}
              premarketPubkey={token.mainInfo.premarketPubkey.toString()}
              communityInfo={token.communityInfo}
              isMobile={false}
              width={rigth.width}
            />
            <VestingCard
              vesting={token.dynamicInfo.vesting}
              isMobile={false}
            />
            <PremarketInfo
              currentUserId={user?.userId}
              width={rigth.width}
              tokenInfo={token}
              isMobile={false}
              withJoinButton={
                (user === null || holderEntryInfo === null) && token.mainInfo.premarketDeadline > Math.floor(Date.now() / 1000)
              }
              onUpdated={refetchTokenInfo}
            />
            <HoldersInfo
              tokenData={token}
              holdersAmount={token.dynamicInfo.holdersCount}              
              isMobile={false}
              limited={false}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

export function TokenPremarketPageMobile({
  token,holderEntryInfo,
  refetchTokenInfo,
  screenDem,
}: {
  token: TokenInfo;
  holderEntryInfo: UserEntry | null;
  refetchTokenInfo: () => Promise<void>;
  screenDem: {
    width: number;
    height: number;
  };
}) {
  const theme = useTheme()
  const colors = theme.colors as ExtendedMD3Colors
  
  const [index, setIndex] = React.useState(0);
  const toPeopleSection = ()=>{setIndex(1)}
  const renderScene = SceneMap({
    first: ()=>BriefMobile({token, holderEntryInfo, refetchTokenInfo, screenDem, toPeopleSection}),
    second:()=> PeopleMobile({token, refetchTokenInfo, screenDem}),
  });
  const layout = useWindowDimensions();

  const routes = [
    { key: 'first', title: 'Brief' },
    { key: 'second', title: 'People' },
  ];
  const renderTabBar = (props: any) => (
    <View style={{width: "100%", backgroundColor: theme.colors.background, justifyContent: 'center', alignItems:'center'}}>
      <TabBar
        {...props}
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
    </View>
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
  holderEntryInfo,
  refetchTokenInfo,
  screenDem,
  toPeopleSection
}: {
  token: TokenInfo;
  holderEntryInfo: UserEntry | null;
  refetchTokenInfo: () => Promise<void>;
  screenDem: {
    width: number;
    height: number;
  };
  toPeopleSection: ()=>void
}) {
  const { user } = useAuth();
  const theme = useTheme();

  return (
    
    <View>
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{
        height: screenDem.height - SLIDER_HEIGHT,
        maxHeight: screenDem.height - SLIDER_HEIGHT,
        width: "100%", 
        backgroundColor: theme.colors.background,}}
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
          // marginBottom: 70
        }}
      >
        <PremarketBaseInfo tokenMainInfo={token.mainInfo} isMobile={true} />
        <PremarketDynamicInfo
          tokenMainInfo={token.mainInfo}
          tokenDynamicInfo={token.dynamicInfo}
          isMobile={true}
        />
        {user && holderEntryInfo ?
          <YourEntry 
            user={user}
            userEntry={holderEntryInfo}
            premarketPubkey={token.mainInfo.premarketPubkey}
            tokenDynamicInfo={token.dynamicInfo}
            tokenMainInfo={token.mainInfo}
            onUpdated={refetchTokenInfo}
            isMobile={true}
          /> : !!token.mainInfo.vestingInfo?.enabled && <VestingSetting
            periodSec={token.mainInfo.vestingInfo?.vestingPeriodSec ?? 0}
            percentInit={token.mainInfo.vestingInfo?.unlockAtLaunchPercent ?? 0}
          />
        }
        <AboutCommunity
          isEditable={(token.mainInfo.createdByPubkey === user?.walletAddress) && (token.mainInfo.state === 'premarket' || token.mainInfo.state === 'expired')}
          premarketPubkey={token.mainInfo.premarketPubkey.toString()}
          communityInfo={token.communityInfo}
          isMobile={true}
          width={screenDem.width}
        />
        <VestingCard
          vesting={token.dynamicInfo.vesting}
          isMobile={true}
        />
        <PremarketInfo
          currentUserId={user?.userId}
          width={screenDem.width}
          tokenInfo={token}
          isMobile={true}
          withJoinButton={
            (user === null || holderEntryInfo === null) && token.mainInfo.premarketDeadline > Math.floor(Date.now() / 1000)
          }
          onUpdated={refetchTokenInfo}
        />
        <HoldersInfo
          tokenData={token}
          holdersAmount={token.dynamicInfo.holdersCount}
          isMobile={true}
          limited={true}
        />
        <Button variant='primary' mode='text' onPress={toPeopleSection} style={{width:'100%', marginTop:-10}}>View all</Button>
      </View>
      <View  // hack to spase for PremarketAction
        style={{
          paddingBottom: 0,
          alignItems: "center",
          zIndex: -999, 
          opacity: 0, 
        }}>
        <PremarketAction
          tokenMainInfo={token.mainInfo}
          tokenDynamicInfo={token.dynamicInfo}                 
          holderEntryInfo={holderEntryInfo}
          onUpdated={refetchTokenInfo}
          isMobile={true}
        />

      </View>
    </ScrollView>
    
      <View
        style={{
          position: "absolute",
          bottom: 20,
          left: 0,
          right: 0,
          alignItems: "center",
          zIndex: 999,
        }}
      >
        <PremarketAction
          tokenMainInfo={token.mainInfo}
          tokenDynamicInfo={token.dynamicInfo}
          holderEntryInfo={holderEntryInfo}
          onUpdated={refetchTokenInfo}
          isMobile={true}
        />
        </View>
        </View>
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
          isMobile={true}
          limited={false}       
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
    width: "50%"
  },
  tabbarContent: {
    justifyContent: "center",
  },
  tabStyle: {
    textAlign: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 0,
  },
  indicatorStyle: { 
    justifyContent: "center", height: 3, 
    width: "14%",
    alignSelf:'center',
    marginLeft: "18%"
  },
  indicatorContainerStyle: {
    justifyContent: "center",
    alignItems: 'center'
  },
}
);
