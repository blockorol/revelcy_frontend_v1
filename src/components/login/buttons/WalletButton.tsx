// WalletButton.tsx (обновлённое подключение к общему хуку, поведение прежнее)
import React from "react";
import { Button, useTheme } from "react-native-paper";
import { SvgIcon } from "@components/base/SvgIcon";
import { getConnectToWallet } from "@hooks/connectWallet";
import { useWallet } from "@storage/wallet-adapter";
import { useWalletLoginFlow } from "@hooks/useWalletLoginFlow";
import GreenButton from "@components/login/buttons/GreenButton";

interface WalletButtonProps {
  afterClick: () => void;
  overrideSaveJwt?: (jwt: string, isNewUser: boolean) => void;
}

export default function WalletButton({
  afterClick,
  overrideSaveJwt,
}: WalletButtonProps) {
  const theme = useTheme();
  const connectWallet = getConnectToWallet();
  const { run, busy } = useWalletLoginFlow(connectWallet, {
    onSuccess: afterClick,
    overrideSaveJwt,
  });

  return (
    <Button
      mode="outlined"
      onPress={() => run()}
      disabled={busy}
      labelStyle={{ ...theme.fonts.labelLarge }}
      style={{
        width: "100%",
        borderColor: theme.colors.outline,
        borderRadius: 14,
      }}
      textColor={theme.colors.onSurface}
      icon={() => (
        <SvgIcon
          name="wallet-outlined"
          size={24}
          color={theme.colors.onSurface}
        />
      )}
    >
      {busy ? "Connecting" : "Connect with Wallet"}
    </Button>
  );
}

export function AnoterWalletButton({
  overrideSaveJwt,
}: {
  overrideSaveJwt?: (jwt: string, isNewUser: boolean) => void;
}) {
  const connectWallet = getConnectToWallet();
  const { disconnect } = useWallet();

  const { run, busy } = useWalletLoginFlow(connectWallet, {
    overrideSaveJwt,
    disconnect,
  });

  const handleReconnect = React.useCallback(() => {
    // одна попытка по клику, с предварительным disconnect
    void run({ forceReconnect: true });
  }, [run]);

  return (
    <GreenButton
      onClick={handleReconnect}
      buttonText={busy ? "Connecting" : "Try Another Wallet"}
      icon="wallet-outlined"
      disabled={busy}
    />
  );
}
