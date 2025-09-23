import { userOutOfPremarket } from "@api/token";
import { SvgIcon } from "@components/base/SvgIcon";
import { outOfPremarket } from "@services/blockchain/premarket/outOfPremarket";
import { PublicKey } from "@solana/web3.js";
import { View } from "react-native";
import {
  Button,
  useTheme,
  Text,
  ActivityIndicator,
} from "react-native-paper";
import { useAnchorWalletSafe } from '@storage/wallet-adapter/useWallet.web';
import { useWallet } from "@storage/wallet-adapter";
import { useAuth } from "@providers/AuthContext";
import { useNetwork } from "@providers/NetworkContext";
import { getSolanaConnection } from "@services/blockchain/solana";
import { useNotification } from "@storage/NotificationContext";
import { useOverlay } from "@storage/UniversalOverlayProvider"; // <-- используем провайдер

interface PremarketUserJoinedProps {
  premarketPubkey: PublicKey;
  onUpdated: () => void;
}

export function PremarketUserJoined({ premarketPubkey, onUpdated}: PremarketUserJoinedProps) {
  const theme = useTheme();
  const { network } = useNetwork();
  const connection = getSolanaConnection(network);
  const { connected, connect } = useWallet();
  const { user } = useAuth();
  const wallet = useAnchorWalletSafe();
  const notify = useNotification();
  const { open, replace, close } = useOverlay();

  const renderLoader = (status: string) => (
    <View style={{ gap: 20 }}>
      <Text variant="titleMedium">{status}</Text>
      <ActivityIndicator animating color={theme.colors.primary} size="large" />
    </View>
  );

  const handleOut = async () => {
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
      return;
    }
    if (!user) {
      notify.error("Please log in to continue");
      return;
    }
    if (network==='testnet') {
      notify.error("testnet is not supported");
      return;
    }
    network

    try {
      open(renderLoader("out of premarket..."));
      const res = await outOfPremarket(wallet, connection, network, premarketPubkey,
        (text) => {replace(renderLoader(text))}
      );

      replace(renderLoader("Syncing with backend..."));
      await userOutOfPremarket({
        tx: res.txId,
        userWallet: wallet.publicKey.toString(),
        userId: user.userId,
        premarketPubKey: premarketPubkey.toString()
      });

      notify.success("Successfully left premarket!");
      close();
      onUpdated();
    } catch (e) {
      console.error("outOfPremarket error:", e);
      notify.error("Failed to leave premarket");
      close();
    }
  };

  return (
    <View style={{ alignItems: "center", justifyContent: "center", gap: 24 }}>
      <Button
        onPress={handleOut}
        textColor={theme.colors.onError}
        buttonColor={theme.colors.error}
        icon={() => (
          <SvgIcon
            name='smile-sad-outlined'
            size={20}
            color={theme.colors.onError}
          />
        )}
        mode="contained"
      >
        Out of premarket
      </Button>
    </View>
  );
}
