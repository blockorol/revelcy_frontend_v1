import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, useTheme } from "react-native-paper";
import { SvgIcon } from "@components/base/SvgIcon";
import { useWallet } from "@storage/wallet-adapter";
import GreenButton from "@components/login/buttons/GreenButton";
import { confirmLogin, startSession } from "@api/auth";
import { getConnectToWallet } from "@hooks/connectWallet";
import { useAuth } from "@providers/AuthContext";

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
  const { login } = useAuth();
  const { connected, publicKey, signMessage } = useWallet();

  const sessionRef = useRef<{ nonce: string; jwtSession: string } | null>(null);
  const signatureRef = useRef<Uint8Array<ArrayBufferLike> | null>(null);
  const signingRef = useRef(false);
  const publicKeyRef = useRef(publicKey);
  const signMessageRef = useRef(signMessage);
  const connectedRef = useRef(connected);

  const finishingRef = useRef(false);
  const connectionProcess = useRef<Promise<void> | null>(null);

  const resetFlow = useCallback(() => {
    console.log("resetFlow");
    sessionRef.current = null;
    signatureRef.current = null;
    finishingRef.current = false;
    signingRef.current = false;
  }, []);

  const proceed = useCallback(async () => {
    console.log("proceed:");
    if (connectionProcess.current) {
      console.log("locked:");
      return;
    }
    let release!: () => void;
    connectionProcess.current = new Promise<void>((res) => (release = res));

    try {
      console.log("start:");
      if (finishingRef.current) return;

      try {
        if (!connectedRef.current) {
          const ok = await connectWallet();
          if (!ok) return;
        }

        if (!publicKeyRef.current || !signMessageRef.current) return;

        if (!sessionRef.current) {
          console.log("start sesstion:");
          const { nonce, jwt: jwtSession } = await startSession();
          sessionRef.current = { nonce, jwtSession };
        }

        if (!signatureRef.current) {
          console.log("signMessage");
          const enc = new TextEncoder();
          const message = enc.encode(sessionRef.current!.nonce);
          signatureRef.current = await signMessageRef.current(message, "utf8");
        }

        const confirmLoginResp = await confirmLogin({
          walletAddress: publicKeyRef.current.toString(),
          signature: signatureRef.current,
          jwt: sessionRef.current.jwtSession,
        });

        if (!confirmLoginResp) {
          console.log("not confirmed maybe changed wallet");
          return;
        }

        console.log("confirmed");
        const { jwt, isNewUser } = confirmLoginResp;

        if (!finishingRef.current) {
          finishingRef.current = true;
          overrideSaveJwt ? overrideSaveJwt(jwt, isNewUser) : login(jwt);

          resetFlow();
          afterClick();
        }
      } catch (e) {
        console.error("Login error", e);
      }
    } catch {
    } finally {
      console.log("done");
      release();
      connectionProcess.current = null;
    }
  }, [
    connected,
    signMessage,
    connectWallet,
    login,
    afterClick,
    overrideSaveJwt,
    resetFlow,
  ]);

  useEffect(() => {
    console.log("useEffect");
    publicKeyRef.current = publicKey;
    signMessageRef.current = signMessage;
    connectedRef.current = connected;
    // proceed();
  }, [connected, publicKey, signMessage]);

  return (
    <Button
      mode="outlined"
      onPress={proceed}
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
      {connectionProcess.current !== null
        ? "Connecting"
        : "Connect with Wallet"}
    </Button>
  );
}

export function AnoterWalletButton({
  overrideSaveJwt,
}: {
  overrideSaveJwt?: (jwt: string, isNewUser: boolean) => void;
}) {
  const connectWallet = getConnectToWallet();
  const { login } = useAuth();
  const { connected, publicKey, disconnect, signMessage } = useWallet();

  const [connecting, setConnecting] = useState(false);
  const sessionRef = useRef<{ nonce: string; jwtSession: string } | null>(null);
  const finishingRef = useRef(false);

  const resetFlow = useCallback(() => {
    sessionRef.current = null;
    finishingRef.current = false;
    setConnecting(false);
  }, []);

  const proceed = useCallback(async () => {
    if (!connecting || finishingRef.current) return;

    try {
      if (!sessionRef.current) {
        const { nonce, jwt: jwtSession } = await startSession();
        sessionRef.current = { nonce, jwtSession };
      }

      if (!connected) {
        const ok = await connectWallet();
        if (!ok) return;
      }

      if (!publicKey || !signMessage) return;

      const enc = new TextEncoder();
      const message = enc.encode(sessionRef.current.nonce);
      const signature = await signMessage(message, "utf8");

      const confirmLoginResp = await confirmLogin({
        walletAddress: publicKey.toString(),
        signature: signature,
        jwt: sessionRef.current.jwtSession,
      });
      if (!confirmLoginResp) {
        return;
      }
      const { jwt, isNewUser } = confirmLoginResp;
      if (!finishingRef.current) {
        finishingRef.current = true;
        overrideSaveJwt ? overrideSaveJwt(jwt, isNewUser) : login(jwt);
        resetFlow();
      }
    } catch (e) {
      console.error("Login error", e);
      resetFlow();
    }
  }, [
    connecting,
    connected,
    publicKey,
    signMessage,
    connectWallet,
    login,
    overrideSaveJwt,
    resetFlow,
  ]);

  const handleReconnect = useCallback(async () => {
    setConnecting(true);
    try {
      await disconnect();
    } catch {}
    proceed();
  }, [disconnect, proceed]);

  useEffect(() => {
    if (connecting) proceed();
  }, [connecting, connected, publicKey, signMessage, proceed]);

  return (
    <GreenButton
      onClick={handleReconnect}
      buttonText={connecting ? "Connecting" : "Try Another Wallet"}
      icon="wallet-outlined"
    />
  );
}
