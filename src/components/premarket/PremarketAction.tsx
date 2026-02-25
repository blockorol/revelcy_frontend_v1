import { TokenDynamicInfo, TokenMainInfo, UserEntry } from "@api/token";

import { PremarketJoin } from "@components/premarket/PremarketJoin";
import { CreatorInfo } from "@components/premarket/CreatorInfo";
import { useAuth } from "@providers/AuthContext";
import { useTheme, Text } from "react-native-paper";
import { View } from "react-native";
import { Button } from "@components/ui/Button";
import { useOverlay } from "@storage/UniversalOverlayProvider";
import { ShareTextButton } from "@components/base/ButtonShare";
import { openInBrowser } from "@utils/openLinks";
import { useWallet } from "@storage/wallet-adapter";
import { useAnchorWalletSafe } from "@storage/wallet-adapter/useWallet.web";
import { useNetwork } from "@providers/NetworkContext";
import { getSolanaConnection } from "@services/blockchain/solana";
import { useNotification } from "@providers/NotificationContext";
import { claimTokens } from "@services/blockchain/premarket/claimTokens";
import { PublicKey } from "@solana/web3.js";
import TextedLoader from "@components/ui/Loader";

interface PremarketActionProps {
  tokenMainInfo: TokenMainInfo;
  tokenDynamicInfo: TokenDynamicInfo;
  holderEntryInfo: UserEntry | null;
  onUpdated: () => Promise<void>;
  isMobile: boolean;
}

export function PremarketAction({
  tokenMainInfo,
  tokenDynamicInfo,
  holderEntryInfo,
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
        isUserJoined={holderEntryInfo!==null}
        onUpdated={onUpdated}
        isMobile={isMobile}
      />
    case "canceled":
      return <PremarketActionCanceled />;
    case "finished":
      return <PremarketActionLaunched 
        tokenMainInfo={tokenMainInfo} 
        holderEntryInfo={holderEntryInfo}
        onUpdated={onUpdated}
      />;
  }
}

interface PremarketActionLaunchedProps {
  tokenMainInfo: TokenMainInfo;
  tokenDynamicInfo: TokenDynamicInfo;
  isUserJoined: boolean;
  onUpdated: () => Promise<void>;
  isMobile: boolean;
}

export function PremarketActionPremarket({
  tokenMainInfo,
  tokenDynamicInfo,
  isUserJoined,
  onUpdated,
  isMobile
}: PremarketActionLaunchedProps) {
  let { user } = useAuth();
  const { colors } = useTheme();
  const currentURL = window.location.href;


  const isCreator = tokenMainInfo.createdByPubkey === user?.walletAddress;

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

  const isTimesUp = tokenMainInfo.state === "times_up";
  const isExtended = tokenMainInfo.isExtended

  return (
    <View style={{ gap: 48, paddingLeft: isMobile?16:24, paddingRight: isMobile?16:24, alignItems: "center", width: '100%'}}>
      {isDeadline ? (
        <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
          Waiting for creator action: {isTimesUp ? "Finish premarket" : isExtended ? "refund": "extend or refund"}
        </Text>
      ) : isUserJoined ? (
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
  holderEntryInfo: UserEntry | null;
  onUpdated: () => Promise<void>;
}

export function PremarketActionLaunched({ 
  tokenMainInfo, 
  holderEntryInfo,
  onUpdated 
}: PremarketActionLaunchedComponentProps) {
  const { colors } = useTheme();
  const notify = useNotification();
  const { network } = useNetwork();
  const connection = getSolanaConnection(network);
  const { connected, connect } = useWallet();
  const wallet = useAnchorWalletSafe();
  const { open, close: closeOverlay } = useOverlay();

  const userCanClaim = holderEntryInfo ? holderEntryInfo.token.claimedDec !== holderEntryInfo.token.totalDec: false;

  console.log("[holderEntryInfo]:", {
    amountSol: holderEntryInfo?.amountSol?.toString() ?? null,
    claimedDec: holderEntryInfo?.token.claimedDec?.toString() ?? null,
    vestedDec: holderEntryInfo?.token.vestedDec?.toString() ?? null,
    totalDec: holderEntryInfo?.token.totalDec?.toString() ?? null,
    userCanClaim: userCanClaim
  });

  const handleBuyPress = () => {
    if (tokenMainInfo.tokenMint) {
      openInBrowser(`https://pump.fun/coin/${tokenMainInfo.tokenMint}`);
    }
  };

  const handleClaimTokens = async () => {
    if (!wallet || !connected) {
      notify.error("Wallet is not connected", {
        suggest: "Enable Phantom (or compatible) and try again",
        action: {
          label: "Connect",
          onAction: async () => {
            try {
              await connect();
            } catch (e) {
              console.log("connect error:", e);
            }
          },
        },
      });
      return;
    }

    if (network === 'testnet') {
      notify.error("testnet is not supported");
      return;
    }

    if (!tokenMainInfo.tokenMint) {
      notify.error("Token mint address is not available");
      return;
    }

    try {
      open(<TextedLoader text ={"Claiming tokens..."}/>);
      await claimTokens(
        wallet,
        connection,
        network,
        tokenMainInfo.premarketPubkey,
        new PublicKey(tokenMainInfo.tokenMint),
        (text) => {<TextedLoader text ={text}/>}
      );

      notify.success("Tokens claimed successfully!", {
        action: {
          label: "View",
          onAction: () => {
            if (tokenMainInfo.tokenMint) {
              openInBrowser(`https://pump.fun/coin/${tokenMainInfo.tokenMint}`);
            }
          }
        }
      });
    } catch (e: any) {
      console.error("Claim tokens error:", e);
      notify.error("Failed to claim tokens", {
        suggest: e?.message ?? "Please try again",
      });
    } finally {
      closeOverlay();
      await onUpdated();
    }
  };

  return (
    <View style={{ flexDirection: "row", gap: 16, alignSelf: "center" }}>
      {!userCanClaim ? (
        <>
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
        </>
      ) : (
        <>
          <Button
            mode="contained"
            leftSvgIconName="one-coin"
            textColor={colors.onPrimary}
            style={{ width: 170, height: 40 }}
            onPress={handleClaimTokens}
          >
            Claim
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
        </>
      )}
    </View>
  );
}
