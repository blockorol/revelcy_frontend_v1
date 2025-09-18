import { premarketFinished, TokenMainInfo } from "@api/token";
import { SvgIcon } from "@components/base/SvgIcon";
import { finishPremarket, refundPremarket } from "@services/blockchain/premarket/finishPremarket";
import { getTimeLeftLabel } from "@utils/premarket";
import { useAuth } from "@storage/AuthContext";
import { useWallet } from "@storage/wallet-adapter";
import { useAnchorWalletSafe } from "@storage/wallet-adapter/useWallet.web";
import { useNetwork } from "@storage/NetworkContext";
import { getSolanaConnection } from "@services/blockchain/solana";
import { useNotification } from "@storage/NotificationContext";
import { useOverlay } from "@storage/UniversalOverlayProvider";

import { Linking, View } from "react-native";
import { Button, Text, ActivityIndicator, useTheme } from "react-native-paper";
import OneScreenContainer from "@components/base/container/OneScreenContainer";
import LoginFlow from "@components/login/LoginFlow";

interface CreatorInfoProps {
  tokenMainInfo: TokenMainInfo;
  isGoalReached: boolean;
  onUpdated: () => Promise<void>;
}

export function CreatorInfo({ tokenMainInfo, onUpdated}: CreatorInfoProps) {
  const { colors } = useTheme();
  const now = Math.floor(Date.now() / 1000);

  const notify = useNotification();
  const { user } = useAuth();
  const { network } = useNetwork();
  const connection = getSolanaConnection(network);
  const { connected, connect } = useWallet();
  const wallet = useAnchorWalletSafe();
  const { open, replace, close } = useOverlay();

  const renderLoader = (status: string) => (
    <View style={{ gap: 20 }}>
      <Text variant="titleMedium">{status}</Text>
      <ActivityIndicator animating color={colors.primary} size="large" />
    </View>
  );
  
  const renderLogin = () => (
    <OneScreenContainer>
      <LoginFlow onCloseButton={close}/>
    </OneScreenContainer>
  );

  const handleRefund = async () => {
    if (!user) {
      open(renderLogin())
      return;
    }
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
    if (wallet.publicKey.toBase58() !== tokenMainInfo.createdByPubkey) {
      notify.error("Only the creator can refund the premarket");
      return;
    }
    if (network === 'testnet') {
      notify.error("testnet is not supported");
      return;
    }


    try {
      open(renderLoader("Refunding premarket..."));
      const res = await refundPremarket(
        wallet,
        connection,
        network,
        tokenMainInfo.premarketPubkey,
        (text) => {replace(renderLoader(text))}
      );
      open(renderLoader("link data to Revelcy..."));
      await premarketFinished({
        premarketPubKey: tokenMainInfo.premarketPubkey.toString(),
        userWallet: wallet.publicKey.toString(),
        tx: res.txId,
        isKilled: true,
        network: network
      })


      notify.success("Premarket successfully refunding!", {action: {
        label: "check",
        onAction: ()=> {
          Linking.openURL(`https://solscan.io/tx/${res.txId}?cluster=devnet`)
        }
      }});
      close();
      onUpdated()
    } catch (e) {
      console.error("refund premarket error:", e);
      notify.error("Failed to refund premarket");
      close();
    }
  };

  const handleFinish = async () => {
    // if (tokenMainInfo.premarketDeadline > now) {
    //   notify.warning(
    //     `Finish will be available in ${getTimeLeftLabel(tokenMainInfo.premarketDeadline)}`
    //   );
    //   return;
    // }

    notify.info("Skipped deadline check")

    if (!user) {
      open(renderLogin())
      return;
    }
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
    if (wallet.publicKey.toBase58() !== tokenMainInfo.createdByPubkey) {
      notify.error("Only the creator can finish the premarket");
      return;
    }
    if (network === 'testnet') {
      notify.error("testnet is not supported");
      return;
    }

    try {
      open(renderLoader("Finishing premarket..."));
      const res = await finishPremarket(
        wallet,
        connection,
        network,
        tokenMainInfo.premarketPubkey,
        (text) => {replace(renderLoader(text))}
      );
      premarketFinished({
        premarketPubKey: tokenMainInfo.premarketPubkey.toString(),
        userWallet: wallet.publicKey.toString(),
        tx: res.txId,
        isKilled: false,
        network: network
      })


      notify.success("Premarket successfully finished!", {action: {
        label: "check",
        onAction: ()=> {
          Linking.openURL(`https://solscan.io/tx/${res.txId}?cluster=devnet`)
        }
      }});
      close();
      onUpdated();
    } catch (e) {
      console.error("finish premarket error:", e);
      notify.error("Failed to finish premarket");
      close();
    }
  };

  const buttonSuffix =
    tokenMainInfo.premarketDeadline > now
      ? " in " + getTimeLeftLabel(tokenMainInfo.premarketDeadline)
      : "";

  return (
    <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "center", gap: 24 }}>
        <Button
        textColor={colors.onError}
        buttonColor={colors.error}
        mode="elevated"
        onPress={handleRefund}
      >
        Refund all
      </Button>
      <Button
        textColor={colors.onPrimary}
        buttonColor={colors.primary}
        mode="elevated"
        onPress={handleFinish}
      >
        Finish {buttonSuffix ? `(${buttonSuffix})` : ""}
      </Button>
    </View>
  );
}
