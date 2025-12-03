import { TokenDynamicInfo, TokenMainInfo, tokensClaimed } from "@api/token";

import { PremarketJoin } from "@components/premarket/PremarketJoin";
import { CreatorInfo } from "@components/premarket/CreatorInfo";
import { useAuth } from "@providers/AuthContext";
import { useTheme, Text, ActivityIndicator } from "react-native-paper";
import { View } from "react-native";
import { Button } from "@components/ui/Button";
import OneScreenContainer from "@components/base/container/OneScreenContainer";
import LoginFlow from "@components/login/LoginFlow";
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
      return <PremarketActionLaunched 
        tokenMainInfo={tokenMainInfo} 
        tokenDynamicInfo={tokenDynamicInfo}
        onUpdated={onUpdated}
      />;
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

  const isTimesUp = tokenMainInfo.state === "times_up";

  return (
    <View style={{ gap: 48, paddingLeft: isMobile?16:24, paddingRight: isMobile?16:24, alignItems: "center", width: '100%'}}>
      {isDeadline ? (
        <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
          {isTimesUp 
            ? "Waiting for creator action: Finish premarket"
            : "Waiting for creator action: extend or refund"
          }
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
  tokenDynamicInfo: TokenDynamicInfo;
  onUpdated: () => Promise<void>;
}

export function PremarketActionLaunched({ 
  tokenMainInfo, 
  tokenDynamicInfo,
  onUpdated 
}: PremarketActionLaunchedComponentProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const notify = useNotification();
  const { network } = useNetwork();
  const connection = getSolanaConnection(network);
  const { connected, connect } = useWallet();
  const wallet = useAnchorWalletSafe();
  const { open, replace, close: closeOverlay } = useOverlay();

  // Check if the current user has joined the premarket
  const userHolder = tokenDynamicInfo.holders.find(
    (holder) => holder.id === user?.userId
  );

  // Check if the user has claimed their tokens
  const userHasClaimed = userHolder?.claimed ?? true;
  console.log("userHasClaimed", userHasClaimed);

  const handleBuyPress = () => {
    if (tokenMainInfo.tokenMint) {
      openInBrowser(`https://pump.fun/coin/${tokenMainInfo.tokenMint}`);
    }
  };

  const renderLoader = (status: string) => (
    <View style={{ gap: 20 }}>
      <Text variant="titleMedium">{status}</Text>
      <ActivityIndicator animating color={colors.primary} size="large" />
    </View>
  );

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
      open(renderLoader("Claiming tokens..."));
      const res = await claimTokens(
        wallet,
        connection,
        network,
        tokenMainInfo.premarketPubkey,
        new PublicKey(tokenMainInfo.tokenMint),
        (text) => { replace(renderLoader(text)) }
      );

      // Notify backend about successful claim
      try {
        await tokensClaimed({
          network,
          userPubkey: wallet.publicKey.toBase58(),
          premarketAccount: tokenMainInfo.premarketPubkey.toBase58(),
        });
      } catch (e: any) {
        console.error("Failed to notify backend about token claim:", e);
        // Don't fail the whole operation if backend notification fails
      }

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

      closeOverlay();
      await onUpdated();
    } catch (e: any) {
      console.error("Claim tokens error:", e);
      notify.error("Failed to claim tokens", {
        suggest: e?.message ?? "Please try again",
      });
      closeOverlay();
    }
  };

  return (
    <View style={{ flexDirection: "row", gap: 16, alignSelf: "center" }}>
      {userHasClaimed ? (
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
            Claim Token
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
