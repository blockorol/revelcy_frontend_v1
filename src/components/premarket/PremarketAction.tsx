import { TokenDynamicInfo, TokenMainInfo } from "@api/token";

import { PremarketJoin } from "@components/premarket/PremarketJoin";
import { CreatorInfo } from "@components/premarket/CreatorInfo";
import { useAuth } from "@providers/AuthContext";
import { useTheme, Text } from "react-native-paper";
import { View } from "react-native";
import { Button } from "@components/ui/Button";
import OneScreenContainer from "@components/base/container/OneScreenContainer";
import LoginFlow from "@components/login/LoginFlow";
import { useOverlay } from "@storage/UniversalOverlayProvider";
import { ShareTextButton } from "@components/base/ButtonShare";
import { openInBrowser } from "@utils/openLinks";

interface PremarketActionProps {
  tokenMainInfo: TokenMainInfo;
  tokenDynamicInfo: TokenDynamicInfo;
  onUpdated: () => Promise<void>;
  isMobile: boolean;
}

export function PremarketAction({
  tokenMainInfo,
  tokenDynamicInfo,
  onUpdated,
  isMobile,
}: PremarketActionProps) {

  switch (tokenMainInfo.state) {
    case "premarket":
    case "times_up":
    case "expired":
      return <PremarketActionPremarket
        tokenMainInfo={tokenMainInfo}
        tokenDynamicInfo={tokenDynamicInfo}
        onUpdated={onUpdated}
        isMobile={isMobile}
      />
    case "canceled":
      return <PremarketActionCanceled />;
    case "finished":
      return <PremarketActionLaunched tokenMainInfo={tokenMainInfo} />;
  }
}

interface PremarketActionLaunchedProps {
  tokenMainInfo: TokenMainInfo;
  tokenDynamicInfo: TokenDynamicInfo;
  onUpdated: () => Promise<void>;
  isMobile: boolean;
}

export function PremarketActionPremarket({
  tokenMainInfo,
  tokenDynamicInfo,
  onUpdated,
  isMobile
}: PremarketActionLaunchedProps) {
  let { user } = useAuth();
  const { colors } = useTheme();
  const currentURL = window.location.href;


  const isCreator = tokenMainInfo.createdByPubkey === user?.walletAddress;
  const userJoined =
  tokenDynamicInfo.holders.find((holder) => holder.id === user?.userId) !==
  undefined;

  const now = Math.floor(Date.now() / 1000);
  const isDeadline = tokenMainInfo.premarketDeadline < now;
  if (isCreator) {
    return (
    <View style={{ gap: 48, alignItems: "center", paddingTop: 0, paddingBottom: 20, paddingLeft: isMobile?16:24, paddingRight: isMobile?16:24, width: '100%', backgroundColor: isMobile?colors.shadow:undefined, marginBottom: isMobile?-20:0}}>
        <CreatorInfo
            tokenMainInfo={tokenMainInfo}
            isDeadLine={isDeadline}
            isGoalReached={tokenMainInfo.premarketGoalSolLamp.lte(
            tokenDynamicInfo.marketCapSolLamp
            )}
            onUpdated={onUpdated}
            currentURL={currentURL}
        />
    </View>
)}

  return (
    <View style={{ gap: 48, paddingLeft: isMobile?16:24, paddingRight: isMobile?16:24, alignItems: "center", width: '100%'}}>
      {isDeadline ? (
        <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
          Waiting for creator action: Finish premarket
        </Text>
      ) : userJoined ? (
        <ShareTextButton style={{width: "100%"}} shareMessage={`Join to premarket on: ${currentURL}`}>Share</ShareTextButton>
      ) : (
        <PremarketJoin
          tokenMainInfo={tokenMainInfo}
          tokenDynamicInfo={tokenDynamicInfo}
          onUpdated={onUpdated}
          user={user}
          currentURL={currentURL}
          isMobile={isMobile}
        />
      )}
    </View>
  );
}

export function PremarketActionCanceled() {
  return null;
}

interface PremarketActionLaunchedComponentProps {
  tokenMainInfo: TokenMainInfo;
}

export function PremarketActionLaunched({ tokenMainInfo }: PremarketActionLaunchedComponentProps) {
  const { colors } = useTheme();

  const handleBuyPress = () => {
    if (tokenMainInfo.tokenMint) {
      openInBrowser(`https://pump.fun/coin/${tokenMainInfo.tokenMint}`);
    }
  };

  return (
    <View style={{ flexDirection: "row", gap: 16, alignSelf: "center" }}>
      <Button
        mode="contained"
        leftSvgIconName="buy"
        textColor={colors.onPrimary}
        style={{ width: 168, height: 40 }}
        onPress={handleBuyPress}
      >
        Buy
      </Button>
      <Button
        mode="contained"
        leftSvgIconName="pumpfun"
        textColor={colors.onPrimary}
        style={{ width: 168, height: 40 }}
        onPress={handleBuyPress}
      >
        View
      </Button>
    </View>
  );
}
