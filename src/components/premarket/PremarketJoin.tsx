import { TokenDynamicInfo, TokenMainInfo, userJoinedToPremarket } from "@api/token";
import { getWalletInfo, WalletInfoResponseDto } from "@api/wallet";
import { SvgIcon } from "@components/base/SvgIcon";
import { BN } from "@coral-xyz/anchor";
import { joinToPremarket } from "@services/blockchain/premarket/joinPremarket";
import { UserInfo } from "@providers/AuthContext";
import shortString from "@utils/address_shorter";
import { useAnchorWalletSafe } from '@storage/wallet-adapter/useWallet.web';
import { convertDecimalToToken } from "@utils/premarket";

import {
  formatNumberCompact,
  convertSolanaToTokenBuy,
  convertSmallCountToLamport,
} from "@utils/premarket";
import { useState, useEffect } from "react";
import { View } from "react-native";
import {
  HelperText,
  Button as ButtonPaper,
  TextInput,
  Text,
  useTheme,
  ActivityIndicator,
  Portal,
} from "react-native-paper";
import {Button} from "@components/ui/Button"
import { useWallet } from "@storage/wallet-adapter";
import { useNetwork } from "@providers/NetworkContext";
import { getSolanaConnection } from "@services/blockchain/solana";
import { useNotification } from "@storage/NotificationContext";
import { useOverlay } from "@storage/UniversalOverlayProvider"; // <-- новый импорт
import { ShareTextButton } from "@components/base/ButtonShare";
import React from "react";
import { MobileBottomSheet } from "@components/ui/MobileBottomSheet";
import LoginFlow from "@components/login/LoginFlow";
import { LoginModal } from "@components/login/LoginButton";
import OneScreenContainer from "@components/base/container/OneScreenContainer";

interface PremarketJoinProps {
  tokenDynamicInfo: TokenDynamicInfo;
  tokenMainInfo: TokenMainInfo;
  onUpdated: () => void;
  user: UserInfo | null,
  currentURL: string
  isMobile: boolean
}

export function PremarketJoin({ isMobile, ...props }:PremarketJoinProps) {
  const [visible, setVisible] = React.useState(false);

  if (!isMobile) return <PremarketJoinBase {...props} isMobile={false} />;

  return (
    <View style={{ flex: 1, width: '100%'}}>
      <Portal.Host>

          <View style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          width: '100%',
          gap: 16
        }}>
            <Button style={{flex:4}} mode="contained" onPress={() => setVisible(true)}>
              Join Premarket
            </Button>
            <ShareTextButton style={{flex: 1}} shareMessage={`Join to premarket on: ${props.currentURL}`}/>
          </View>
          <MobileBottomSheet
            visible={visible}
            onDismiss={() => setVisible(false)}
          >
          <PremarketJoinBase {...props} isMobile={true} />
        </MobileBottomSheet>
      
        </Portal.Host>
    </View>
  );
}
function PremarketJoinBase({
  tokenDynamicInfo,
  tokenMainInfo,
  onUpdated,
  user,
  currentURL,
  isMobile
}: PremarketJoinProps) {
  const notify = useNotification();
  const { network } = useNetwork();
  const currentConnection = getSolanaConnection(network);
  const { connected, connect } = useWallet();

  const wallet = useAnchorWalletSafe();
  const theme = useTheme();
  const { open, replace, close } = useOverlay();
  const [loginModalVisible, setLoginModalVisible] = React.useState(false);

  const [rawInput, setRawInput] = useState("");
  const [amountSol, setAmountSol] = useState<number | undefined>(undefined);
  const [amountToken, setAmountToken] = useState<BN | undefined>(undefined);
  const [walletInfo, setWalletInfo] = useState<WalletInfoResponseDto | null>(null); // todo: change to internal struct
  const [walletInfoLoading, setWalletInfoLoading] = useState(false);

  // Fetch wallet info when user is available
  useEffect(() => {
    const fetchWalletInfo = async () => {
      if (user?.walletAddress) {
        setWalletInfoLoading(true);
        try {
          const info = await getWalletInfo(user.walletAddress);
          setWalletInfo(info);
        } catch (error) {
          console.error("Failed to fetch wallet info:", error);
          setWalletInfo(null);
        } finally {
          setWalletInfoLoading(false);
        }
      } else {
        setWalletInfo(null);
      }
    };

    fetchWalletInfo();
  }, [user?.walletAddress]);

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
    
    // If user is not authenticated, show login flow
    if (!user) {
      setLoginModalVisible(true);
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
            {walletInfoLoading ? (
              <Text>Loading...</Text>
            ) : walletInfo ? (
              <Text>{walletInfo.balance.toFixed(2)} SOL</Text>
            ) : (
              <Text style={{ color: theme.colors.onSurfaceVariant }}>Balance unavailable</Text>
            )}
          </View>
        )}
        {!user && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <SvgIcon name="wallet-outlined" color={theme.colors.onBackground} />
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Not connected</Text>
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
          <ButtonPaper
            key={label}
            mode="outlined"
            onPress={() => handleInputChange(label.split(" ")[0])}
            style={{
              height: 24,
              justifyContent: "center",
            }}
            labelStyle={[theme.fonts.labelMedium, { 
              margin: 0, 
              paddingHorizontal: 8,
              paddingVertical: 2,
              width: 80,
            }]}
          >
            {label}
          </ButtonPaper>
        ))}
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          width: '100%',
          gap: 16
        }}
      >
        <Button
          style={{flex: 4}}
          leftSvgIconName="plus"
          mode="contained"
          onPress={handleJoin}
        >
          Join Premarket
        </Button>
        
        {!isMobile&&<ShareTextButton style={{flex: 1}} shareMessage={`Join to premarket on: ${currentURL}`}/>}
      </View>

      <LoginModal 
        visible={loginModalVisible} 
        setVisible={setLoginModalVisible}
      />
    </View>
  );
}
