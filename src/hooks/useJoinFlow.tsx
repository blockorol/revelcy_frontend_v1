// @hooks/useJoinFlow.ts
import BN from "bn.js";
import { PublicKey } from "@solana/web3.js";
import { useAuth } from "@storage/AuthContext";
import { useWallet } from "@storage/wallet-adapter";
import { useAnchorWalletSafe } from "@storage/wallet-adapter/useWallet.web";
import { useNetwork } from "@providers/NetworkContext";
import { getSolanaConnection } from "@services/blockchain/solana";
import { useNotification } from "@storage/NotificationContext";
import { useOverlay } from "@storage/UniversalOverlayProvider";
import { joinToPremarket } from "@services/blockchain/premarket/joinPremarket";
import { userJoinedToPremarket } from "@api/token";
import { convertSmallCountToLamport } from "@utils/premarket";
import { View } from "react-native";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";
import OneScreenContainer from "@components/base/container/OneScreenContainer";
import LoginFlow from "@components/login/LoginFlow";

export type JoinOutcome = "ok" | "need-login" | "need-wallet" | "invalid-amount" | "error";

export function useJoinFlow(onUpdated:()=>void) {
  const { user } = useAuth();
  const { connected, connect } = useWallet();
  const wallet = useAnchorWalletSafe();
  const { network } = useNetwork();
  const connection = getSolanaConnection(network);
  const notify = useNotification();
  const { open, replace, close } = useOverlay();
  const theme = useTheme();

  const renderLoader = (status: string) => (
    <View style={{ rowGap: 20 }}>
      <Text variant="titleMedium">{status}</Text>
      <ActivityIndicator animating color={theme.colors.primary} size="large" />
    </View>
  );
  
  const renderLogin = () => (
    <OneScreenContainer>
      <LoginFlow onCloseButton={close}/>
    </OneScreenContainer>
  );


  const joinPremarketByLamports = async (
    premarketPubkey: PublicKey,
    amountLamp: BN
  ): Promise<JoinOutcome> => {
    try {
        
      if (!amountLamp || amountLamp.isNeg() || amountLamp.isZero()) {
        notify.warning("Please set amount in SOL");
        return "invalid-amount";
      }
      if (!user) {
        notify.error("Please log in to continue", 
          {
            action: {
              label: "connect",
              onAction() {
                open(renderLogin())
              },
            }
          }
        );

        return "need-login";
      }
      if (!wallet || !connected) {
        notify.error("Wallet is not connected", {
          suggest: "Enable Phantom extension and try again",
          action: {
            label: "connect",
            onAction: async () => {
              try {
                await connect();
              } catch (e) {
                console.log("error during connect:", e);
              }
            },
          },
        });
        return "need-wallet";
      }

      if (network === 'testnet') {
        notify.error("wrong network", {
          suggest: "connect admin",
        });
        return "need-wallet";
      }

      open(renderLoader("join to premarket..."));
      const res = await joinToPremarket(wallet, connection, network, premarketPubkey, amountLamp, amountLamp,
        (text) => {replace(renderLoader(text))});

      replace(renderLoader("Syncing with backend..."));
      await userJoinedToPremarket({
        joinAmountInSolLamport: amountLamp,
        tx: res.txId,
        userWallet: wallet.publicKey.toString(),
        userId: user.userId,
        premarketPubKey: premarketPubkey.toString(),
      });

      close();
      notify.success("Successfully joined premarket!");
      onUpdated()
      return "ok";
    } catch (e) {
      console.error("join premarket error:", e);
      notify.error("Failed to join premarket");
      close();
      return "error";
    }
  };

  const joinPremarketBySol = async (
    premarketPubkey: PublicKey,
    amountSol: number
  ): Promise<JoinOutcome> => {
    if (!Number.isFinite(amountSol) || amountSol <= 0) {
      notify.warning("Please set amount in SOL");
      return "invalid-amount";
    }
    const lamp = convertSmallCountToLamport(amountSol);
    return joinPremarketByLamports(premarketPubkey, lamp);
  };

  return { joinPremarketByLamports, joinPremarketBySol };
}
