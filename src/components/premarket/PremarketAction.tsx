import { applyWhitelist, TokenDynamicInfo, TokenMainInfo, UserEntry } from "@api/token";
import { PremarketJoin } from "@components/premarket/PremarketJoin";
import { CreatorInfo, EditLinksModal, EditWhitelistModal } from "@components/premarket/CreatorInfo";
import { useAuth } from "@providers/AuthContext";
import { useTheme, Text } from "react-native-paper";
import { TouchableOpacity, View } from "react-native";
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
import { SvgIcon } from "@components/base/SvgIcon";
import { AppTheme } from "@theme/types";
import { IconName } from "@components/base/SvgIcon";
import { useState } from "react";

interface PremarketActionProps {
  tokenMainInfo: TokenMainInfo;
  tokenDynamicInfo: TokenDynamicInfo;
  holderEntryInfo: UserEntry | null;
  whitelistStatus?: string;
  onUpdated: () => Promise<void>;
  isMobile: boolean;
}

export function PremarketAction({
  tokenMainInfo,
  tokenDynamicInfo,
  holderEntryInfo,
  whitelistStatus,
  onUpdated,
  isMobile,
}: PremarketActionProps) {
  switch (tokenMainInfo.state) {
    case "concept":
      return (
        <PremarketActionConcept
          tokenMainInfo={tokenMainInfo}
          whitelistStatus={whitelistStatus}
          onUpdated={onUpdated}
          isMobile={isMobile}
        />
      );
    case "premarket":
    case "times_up":
    case "expired":
      return (
        <PremarketActionPremarket
          tokenMainInfo={tokenMainInfo}
          tokenDynamicInfo={tokenDynamicInfo}
          isUserJoined={holderEntryInfo !== null}
          whitelistStatus={whitelistStatus}
          onUpdated={onUpdated}
          isMobile={isMobile}
        />
      );
    case "canceled":
      return <PremarketActionCanceled />;
    case "finished":
      return (
        <PremarketActionLaunched
          tokenMainInfo={tokenMainInfo}
          holderEntryInfo={holderEntryInfo}
          onUpdated={onUpdated}
        />
      );
  }
}

interface PremarketActionPremarketProps {
  tokenMainInfo: TokenMainInfo;
  tokenDynamicInfo: TokenDynamicInfo;
  isUserJoined: boolean;
  whitelistStatus?: string;
  onUpdated: () => Promise<void>;
  isMobile: boolean;
}

export function PremarketActionPremarket({
  tokenMainInfo,
  tokenDynamicInfo,
  isUserJoined,
  whitelistStatus,
  onUpdated,
  isMobile,
}: PremarketActionPremarketProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { open, close } = useOverlay();
  const notify = useNotification();
  const currentURL = window.location.href;

  const isCreator = tokenMainInfo.createdByPubkey === user?.walletAddress;
  const now = Math.floor(Date.now() / 1000);
  const isDeadline = tokenMainInfo.premarketDeadline < now;

  if (isCreator) {
    return (
      <View
        style={{
          gap: 48,
          alignItems: "center",
          paddingTop: 0,
          paddingBottom: 20,
          paddingLeft: isMobile ? 16 : 24,
          paddingRight: isMobile ? 16 : 24,
          width: "100%",
          backgroundColor: isMobile ? colors.shadow : undefined,
          marginBottom: isMobile ? -20 : 0,
        }}
      >
        <CreatorInfo
          tokenMainInfo={tokenMainInfo}
          isDeadLine={isDeadline}
          isGoalReached={tokenMainInfo.premarketGoalSolLamp.lte(tokenDynamicInfo.marketCapSolLamp)}
          onUpdated={onUpdated}
          currentURL={currentURL}
        />
      </View>
    );
  }

  const isTimesUp = tokenMainInfo.state === "times_up";
  const isExtended = tokenMainInfo.isExtended;
  const normalizedWhitelistStatus = whitelistStatus?.toLowerCase().trim();
  const isWhitelistRequested = normalizedWhitelistStatus === "requested";
  const isWhitelistRejected = normalizedWhitelistStatus === "rejected";
  const isAllowedByWhitelist =
    !tokenMainInfo.isWhitelistEnabled ||
    (!!normalizedWhitelistStatus &&
      ["accepted", "approved", "whitelisted", "in_whitelist", "in-whitelist"].includes(
        normalizedWhitelistStatus
      ));
  const contactLinks = resolveContactLinks(tokenMainInfo.links);
  const contactUrl = resolveContactUrl(tokenMainInfo.links);

  const handleWhitelistActionPress = async () => {
    if (!user?.walletAddress) {
      return;
    }

    if (!isWhitelistRequested) {
      try {
        await applyWhitelist({
          premarket_id: tokenMainInfo.id,
          user_pubkey: user.walletAddress,
        });
        notify.success("You have applied for whitelist");
        await onUpdated();
      } catch (e: any) {
        console.error("[PremarketAction] failed to apply whitelist", e);
        return;
      }
    }

    open(
      <ApplyForWhitelistModal
        isMobile={isMobile}
        contactLinks={contactLinks}
        contactUrl={contactUrl}
        requestSubmitted
        onClose={close}
      />
    );
  };

  return (
    <View
      style={{
        gap: 48,
        paddingLeft: isMobile ? 16 : 24,
        paddingRight: isMobile ? 16 : 24,
        alignItems: "center",
        width: "100%",
      }}
    >
      {isDeadline ? (
        <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
          Waiting for creator action: {isTimesUp ? "Finish premarket" : isExtended ? "refund" : "extend or refund"}
        </Text>
      ) : isUserJoined ? (
        <ShareTextButton style={{ width: "100%" }} shareMessage={`Join to premarket on: ${currentURL}`}>
          Share
        </ShareTextButton>
      ) : isWhitelistRejected ? (
        <View style={{ width: "100%", gap: 16 }}>
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, textAlign: "center" }}>
            Your whitelist request was declined by the creator
          </Text>
          <ShareTextButton mode="outlined" style={{ width: "100%" }} shareMessage={`Join to premarket on: ${currentURL}`}>
            Share
          </ShareTextButton>
        </View>
      ) : !isAllowedByWhitelist ? (
        <View style={{ width: "100%", flexDirection: "row", gap: 16 }}>
          <Button leftSvgIconName="plus" mode="contained" style={{ flex: 4 }} onPress={handleWhitelistActionPress}>
            {isWhitelistRequested ? "Awaiting approval" : "Apply to whitelist"}
          </Button>
          <ShareTextButton mode="outlined" style={{ flex: 1 }} shareMessage={`Join to premarket on: ${currentURL}`}>
            Share
          </ShareTextButton>
        </View>
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

interface PremarketActionConceptProps {
  tokenMainInfo: TokenMainInfo;
  whitelistStatus?: string;
  onUpdated: () => Promise<void>;
  isMobile: boolean;
}

function PremarketActionConcept({
  tokenMainInfo,
  whitelistStatus,
  onUpdated,
  isMobile,
}: PremarketActionConceptProps) {
  const { user } = useAuth();
  const { colors } = useTheme<AppTheme>();
  const notify = useNotification();
  const { open, close } = useOverlay();
  const currentURL = window.location.href;
  const isCreator = tokenMainInfo.createdByPubkey === user?.walletAddress;
  const normalizedWhitelistStatus = whitelistStatus?.toLowerCase().trim();
  const isWhitelistRequested = normalizedWhitelistStatus === "requested";
  const isWhitelistRejected = normalizedWhitelistStatus === "rejected";
  const contactLinks = resolveContactLinks(tokenMainInfo.links);
  const contactUrl = resolveContactUrl(tokenMainInfo.links);
  const [showEditLinks, setShowEditLinks] = useState(false);
  const [showEditWhitelist, setShowEditWhitelist] = useState(false);
  const whitelistButtonLabel = tokenMainInfo.isWhitelistEnabled ? "Edit whitelist" : "Add whitelist";

  const handleApplyWhitelist = async () => {
    if (!user?.walletAddress) {
      return;
    }

    if (!isWhitelistRequested) {
      try {
        await applyWhitelist({
          premarket_id: tokenMainInfo.id,
          user_pubkey: user.walletAddress,
        });
        notify.success("You have applied for whitelist");
        await onUpdated();
      } catch (e: any) {
        console.error("[PremarketActionConcept] failed to apply whitelist", e);
        notify.error("Failed to apply for whitelist");
        return;
      }
    }

    open(
      <ApplyForWhitelistModal
        isMobile={isMobile}
        contactLinks={contactLinks}
        contactUrl={contactUrl}
        requestSubmitted
        onClose={close}
      />
    );
  };

  if (isCreator) {
    return (
      <View
        style={{
          gap: 16,
          paddingLeft: isMobile ? 16 : 24,
          paddingRight: isMobile ? 16 : 24,
          alignItems: "center",
          width: "100%",
        }}
      >
        <View style={{ width: "100%", gap: 16, alignItems: "center", justifyContent: "center" , flexDirection: "row"}}> 
          <Button leftSvgIconName="rocket" style={{ flex: 5 }} mode="contained" onPress={() => openInBrowser(`https://pump.fun/create/${tokenMainInfo.id}`)}>
            Premarket
          </Button>
          <ShareTextButton style={{ flex: 1}} shareMessage={`Join to premarket on: ${currentURL}`}/>
        </View>
        <View style={{ flexDirection: "row", gap: 16, width: "100%" }}>
          <Button style={{ flex: 1 }} variant="primary" mode="outlined" size="small" onPress={() => setShowEditLinks(true)}>
            Edit links
          </Button>
          <Button style={{ flex: 1 }} variant="primary" mode="outlined" size="small" onPress={() => setShowEditWhitelist(true)}>
            {whitelistButtonLabel}
          </Button>
        </View>
        <EditLinksModal
          visible={showEditLinks}
          onClose={() => setShowEditLinks(false)}
          premarketPubkey={tokenMainInfo.premarketPubkey.toString()}
          tokenMainInfoPreset={tokenMainInfo}
          onUpdated={onUpdated}
        />
        <EditWhitelistModal
          visible={showEditWhitelist}
          onClose={() => setShowEditWhitelist(false)}
          tokenMainInfoPreset={tokenMainInfo}
          onUpdated={onUpdated}
        />
      </View>
    );
  }

  return (
    <View
      style={{
        gap: 16,
        paddingLeft: isMobile ? 16 : 24,
        paddingRight: isMobile ? 16 : 24,
        alignItems: "center",
        width: "100%",
      }}
    >

      {isWhitelistRejected && (
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, textAlign: "center" }}>
          Your whitelist request was declined by the creator
        </Text>
      )}
      <View style={{ gap: 16, width: "100%", alignItems: "center", justifyContent: "center" , flexDirection: "row"}}>
      {tokenMainInfo.isWhitelistEnabled && (
        <Button
          leftSvgIconName="plus"
          mode="contained"
          style={{ flex: 5}}
          onPress={handleApplyWhitelist}
          disabled={isWhitelistRequested}
        >
          {isWhitelistRequested ? "Awaiting approval" : "Apply to whitelist"}
        </Button>
      )}
      <ShareTextButton
        mode={tokenMainInfo.isWhitelistEnabled ? "outlined" : "contained"}
        style={{ flex: 1 }}
        shareMessage={`Join to premarket on: ${currentURL}`}
      />
      </View>
    </View>
  );
}

type ApplyForWhitelistModalProps = {
  isMobile: boolean;
  contactLinks: Array<{ icon: IconName; url: string }>;
  contactUrl?: string;
  requestSubmitted?: boolean;
  onClose: () => void;
};

function ApplyForWhitelistModal({ isMobile, contactLinks, contactUrl, requestSubmitted = false, onClose }: ApplyForWhitelistModalProps) {
  const { colors } = useTheme<AppTheme>();
  const hasContact = !!contactUrl;

  const onContactPress = () => {
    if (!contactUrl) return;
    openInBrowser(normalizeUrl(contactUrl));
    onClose();
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 16 }}>
      <View
        style={{
          width: isMobile ? 360 : 420,
          maxWidth: "100%",
          position: "relative",
          borderRadius: 24,
          backgroundColor: colors.surfaceContainerLowest,
          paddingHorizontal: 24,
          paddingVertical: 24,
          gap: 14,
        }}
      >
        <TouchableOpacity
          onPress={onClose}
          style={{ position: "absolute", top: 12, right: 12, zIndex: 2 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <SvgIcon name="x-circle-outlined" size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
        <View style={{ alignItems: "center", gap: 10 }}>
          <SvgIcon name="hourglass-up" size={28} color={colors.onSurface} />
          <Text variant="headlineSmall" style={{ color: colors.onSurface }}>
            {requestSubmitted ? "Whitelist request sent" : "Apply for Whitelist"}
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, textAlign: "center" }}>
            Please ask the creator to approve your whitelist request
          </Text>
          {contactLinks.map((link, index) => (
            <View key={`${link.url}-${index}`} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <SvgIcon name={link.icon} size={16} color={colors.onSurfaceVariant} />
              <Text
                variant="bodyMedium"
                style={{ color: colors.onSurface, textDecorationLine: "underline" }}
              >
                {shortenLink(link.url)}
              </Text>
            </View>
          ))}
        </View>
        <Button mode="contained" disabled={!hasContact} style={{ width: "100%" }} onPress={onContactPress}>
          Contact creator
        </Button>
      </View>
    </View>
  );
}

function resolveContactUrl(links: TokenMainInfo["links"]): string | undefined {
  return links.telegram || links.twitter || links.webSite || undefined;
}

function resolveContactLinks(links: TokenMainInfo["links"]): Array<{ icon: IconName; url: string }> {
  const items: Array<{ icon: IconName; url: string }> = [];
  if (links.telegram) items.push({ icon: "tg-logo", url: links.telegram });
  if (links.twitter) items.push({ icon: "x-logo", url: links.twitter });
  if (links.webSite) items.push({ icon: "world-outlined", url: links.webSite });
  return items;
}

function normalizeUrl(url: string): string {
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function shortenLink(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
}

interface PremarketActionLaunchedComponentProps {
  tokenMainInfo: TokenMainInfo;
  holderEntryInfo: UserEntry | null;
  onUpdated: () => Promise<void>;
}

export function PremarketActionLaunched({
  tokenMainInfo,
  holderEntryInfo,
  onUpdated,
}: PremarketActionLaunchedComponentProps) {
  const { colors } = useTheme();
  const notify = useNotification();
  const { network } = useNetwork();
  const connection = getSolanaConnection(network);
  const { connected, connect } = useWallet();
  const wallet = useAnchorWalletSafe();
  const { open, close: closeOverlay } = useOverlay();

  const userCanClaim = holderEntryInfo ? holderEntryInfo.token.claimedDec !== holderEntryInfo.token.totalDec : false;

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

    if (network === "testnet") {
      notify.error("testnet is not supported");
      return;
    }

    if (!tokenMainInfo.tokenMint) {
      notify.error("Token mint address is not available");
      return;
    }

    try {
      open(<TextedLoader text={"Claiming tokens..."} />);
      await claimTokens(
        wallet,
        connection,
        network,
        tokenMainInfo.premarketPubkey,
        new PublicKey(tokenMainInfo.tokenMint),
        (text) => {
          <TextedLoader text={text} />;
        }
      );

      notify.success("Tokens claimed successfully!", {
        action: {
          label: "View",
          onAction: () => {
            if (tokenMainInfo.tokenMint) {
              openInBrowser(`https://pump.fun/coin/${tokenMainInfo.tokenMint}`);
            }
          },
        },
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
