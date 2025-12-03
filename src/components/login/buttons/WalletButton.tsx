// WalletButton.tsx (обновлённое подключение к общему хуку, поведение прежнее)
import React, { useEffect, useState } from "react";
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

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]; // или ["⠁","⠃","⠇","⠧","⠷","⠿","⠟","⠯","⠷","⠧","⠇","⠃"]

function useSpinner(active: boolean, interval = 120) {
  const [frame, setFrame] = React.useState(FRAMES[0]);
  React.useEffect(() => {
    if (!active) { setFrame(FRAMES[0]); return; }
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % FRAMES.length;
      setFrame(FRAMES[i]);
    }, interval);
    return () => clearInterval(id);
  }, [active, interval]);
  return frame;
}


export default function WalletButton({
  afterClick,
  overrideSaveJwt,
}: WalletButtonProps) {
  const theme = useTheme();
  const connectWallet = getConnectToWallet();
  const { connected } = useWallet();

  const opts = React.useMemo(() => ({
    onSuccess: afterClick,
    overrideSaveJwt,
  }), [afterClick, overrideSaveJwt]);

  const { run, busy } = useWalletLoginFlow(connectWallet, opts);
  const frame = useSpinner(busy);

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
      {busy ? `Processing${frame}` : (connected ? "Authenticate Wallet" : "Connect with Wallet")}
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

  const opts = React.useMemo(() => ({
    overrideSaveJwt,
    disconnect,
  }), [overrideSaveJwt, disconnect]);

  const { run, busy } = useWalletLoginFlow(connectWallet, opts);
  const frame = useSpinner(busy);

  const handleReconnect = React.useCallback(() => {
    // одна попытка по клику, с предварительным disconnect
    void run({ forceReconnect: true });
  }, [run]);

  return (
    <GreenButton
      onClick={handleReconnect}
      buttonText={busy ? `Connecting${frame}` : "Try Another Wallet"}
      icon="wallet-outlined"
      disabled={busy}
    />
  );
}
