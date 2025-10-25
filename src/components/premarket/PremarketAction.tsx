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
      return  <PremarketActionPremarket
          tokenMainInfo={tokenMainInfo}
          tokenDynamicInfo={tokenDynamicInfo}
          onUpdated={onUpdated}
          isMobile={isMobile}
        />
    case "canceled":
      return <PremarketActionCanceled />;
    case "finished":
      return <PremarketActionLaunched />;
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
    <View style={{ gap: 48, alignItems: "center", paddingTop: 0, paddingBottom: 0, paddingLeft: isMobile?16:24, paddingRight: isMobile?16:24, width: '100%', backgroundColor: isMobile?colors.shadow:undefined}}>
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
    <View style={{ gap: 48,  paddingLeft: isMobile?16:24, paddingRight: isMobile?16:24, alignItems: "center", width: '100%',backgroundColor: isMobile?colors.shadow:undefined}}>
      {isDeadline ? (
        <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
          Waiting for creator action: Finish premarket
        </Text>
      ) : userJoined ? (
        <ShareTextButton style={{width: "90%"}} shareMessage={`Join to premarket on: ${currentURL}`}>Share</ShareTextButton>
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

export function PremarketActionLaunched() {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", gap: 16 }}>
      {/* <Button mode='contained' disabled  style={{width:270}}>Buy</Button>  */}
      <Button
        mode="contained"
        leftSvgIconName="pumpfun"
        textColor={colors.onPrimary}
        style={{ width: "100%" }}
      >
        {" "}
        View
      </Button>
    </View>
  );
}
