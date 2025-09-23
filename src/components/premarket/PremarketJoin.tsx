import { TokenDynamicInfo, TokenMainInfo, userJoinedToPremarket } from "@api/token";
import { SvgIcon } from "@components/base/SvgIcon";
import { LoginModal } from "@components/login/LoginButton";
import { BN } from "@coral-xyz/anchor";
import { joinToPremarket } from "@services/blockchain/premarket/joinPremarket";
import { useAuth } from "@storage/AuthContext";
import shortString from "@utils/address_shorter";
import { useAnchorWalletSafe } from '@storage/wallet-adapter/useWallet.web';
import { convertDecimalToToken } from "@utils/premarket";

import {
  formatNumberCompact,
  convertLamportToSmallCount,
  convertSolanaToTokenBuy,
  convertSmallCountToLamport,
} from "@utils/premarket";
import { useState } from "react";
import { View } from "react-native";
import {
  HelperText,
  Button,
  TextInput,
  Text,
  useTheme,
  ActivityIndicator,
} from "react-native-paper";
import { useWallet } from "@storage/wallet-adapter";
import { useNetwork } from "@providers/NetworkContext";
import { getSolanaConnection } from "@services/blockchain/solana";
import { useNotification } from "@storage/NotificationContext";
import { useOverlay } from "@storage/UniversalOverlayProvider"; // <-- новый импорт

interface PremarketJoinProps {
  tokenDynamicInfo: TokenDynamicInfo;
  tokenMainInfo: TokenMainInfo;
  onUpdated: () => void;
}

export function PremarketJoin({
  tokenDynamicInfo,
  tokenMainInfo,
  onUpdated
}: PremarketJoinProps) {
  const notify = useNotification();
  const [visibleLogin, setVisibleLogin] = useState(false);
  const { user } = useAuth();
  const { network } = useNetwork();
  const currentConnection = getSolanaConnection(network);
  const { connected, connect } = useWallet();

  const wallet = useAnchorWalletSafe();
  const theme = useTheme();
  const { open, replace, close } = useOverlay();

  const [rawInput, setRawInput] = useState("");
  const [amountSol, setAmountSol] = useState<number | undefined>(undefined);
  const [amountToken, setAmountToken] = useState<BN | undefined>(undefined);

  const renderLoader = (status: string) => (
    <View style={{ gap: 20 }}>
      <Text variant="titleMedium">{status}</Text>
      <ActivityIndicator animating color={theme.colors.primary} size="large" />
    </View>
  );

  const handleInputChange = (text: string) => {
    let sanitized = text.replace(",", ".");
    const parts = sanitized.split(".");
    if (parts.length > 2) {
      sanitized = parts[0] + "." + parts[1];
    }
    sanitized = sanitized.replace(/[^0-9.]/g, "");

    setRawInput(sanitized);

    const val = parseFloat(sanitized);
    if (!isNaN(val)) {
      setAmountSol(val);
      setAmountToken(
        convertSolanaToTokenBuy({
          sol_amount: convertSmallCountToLamport(val),
          reserves_sol: tokenDynamicInfo.reservedSolLamp,
          reserves_token: tokenDynamicInfo.reservedTokenLamp,
        })
      );
    } else {
      setAmountSol(undefined);
      setAmountToken(undefined);
    }
  };

  const handleJoin = async () => {
    if (amountSol === undefined) {
      console.error("no amountSol");
      notify.warning("Please set amount in SOL");
      return;
    }
    if (!user) {
      console.error("user is not loggined");
      setVisibleLogin(true);
      return;
    }
    if (!wallet || !connected) {
      console.error("wallet is not connected");
      notify.error("wallet is not connected", {
        suggest: "enable phantom extention and try again",
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
    if (network === 'testnet') {
      notify.error("wallet is not connected")
      return
    }

    const solInLamp = convertSmallCountToLamport(amountSol);

    try {
      open(renderLoader("join to premarket..."));
      const res = await joinToPremarket(
        wallet,
        currentConnection,
        network,
        tokenMainInfo.premarketPubkey,
        solInLamp,
        solInLamp,
        (text) => {replace(renderLoader(text))}
      );

      replace(renderLoader("Syncing with backend..."));
      await userJoinedToPremarket({
        joinAmountInSolLamport: solInLamp,
        tx: res.txId,
        userWallet: wallet.publicKey.toString(),
        userId: user.userId,
        premarketPubKey: tokenMainInfo.premarketPubkey.toString(),
      });

      notify.success("Successfully joined premarket!");
      close();
      onUpdated();
    } catch (e) {
      console.error("join premarket error:", e);
      notify.error("Failed to join premarket");
      close();
    }
  };

  return (
    <View style={{ alignItems: "center", justifyContent: "center", gap: 24 }}>
      <View style={{ alignItems: "center", justifyContent: "center", gap: 16 }}>
        <TextInput
          mode="flat"
          placeholder="0.1 SOL"
          keyboardType="decimal-pad"
          value={rawInput}
          onChangeText={handleInputChange}
          style={{
            backgroundColor: "transparent",
            alignSelf: "center",
            width: 300,
          }}
          textAlign="center"
          contentStyle={[
            theme.fonts.displayMedium,
            {
              textAlign: "center",
              paddingVertical: 0,
            },
          ]}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
        />
        <HelperText type="info">
          ~
          {amountToken
            ? formatNumberCompact(convertDecimalToToken(amountToken))
            : 0}{" "}
          {tokenMainInfo.symbol}
        </HelperText>
        {user && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <SvgIcon name="wallet-outlined" color={theme.colors.onBackground} />
            <Text>{shortString(user.walletAddress)}</Text>
          </View>
        )}
      </View>

      <View
        style={{
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
          gap: 10,
        }}
      >
        {["0.1 min", "0.5", "1", "2 max"].map((label) => (
          <Button
            key={label}
            mode="outlined"
            onPress={() => handleInputChange(label.split(" ")[0])}
            style={{
              width: 80,
              height: 24,
              paddingHorizontal: 8,
              paddingVertical: 2,
              justifyContent: "center",
            }}
            labelStyle={[theme.fonts.labelMedium, { margin: 0 }]}
          >
            {label}
          </Button>
        ))}
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button
          icon={() => <SvgIcon name="plus" size={20} />}
          mode="contained"
          onPress={handleJoin}
        >
          Join Premarket
        </Button>
      </View>

      {!user && (
        <LoginModal visible={visibleLogin} setVisible={setVisibleLogin} />
      )}
    </View>
  );
}
