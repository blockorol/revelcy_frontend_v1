import React, { useCallback, useEffect, useState } from 'react';
import { Button, useTheme } from 'react-native-paper';
import { SvgIcon } from '@components/base/SvgIcon';
import { useWallet } from '@storage/wallet-adapter';
import GreenButton from '@components/login/buttons/GreenButton';
import { confirmLogin, startSession } from '@api/auth';
import { getConnectToWallet } from '@hooks/connectWallet';
import { useAuth } from '@providers/AuthContext';

interface WalletButtonProps {
  afterClick: () => void;
  overrideSaveJwt?: (jwt:string, isNewUser: boolean) => void;
}

export default function WalletButton({ afterClick, overrideSaveJwt}: WalletButtonProps) {
  const connectWallet = getConnectToWallet();
  const { login } = useAuth();
  const theme = useTheme();

  const { connected, publicKey, signMessage } = useWallet();

  const [connecting, setConnecting] = useState(false);

  const handlePress = useCallback(async () => {
    setConnecting(true);
    if (connected) {
      return 
    }
    const isConnected = await connectWallet();
    if (!isConnected) {
      setConnecting(false);
      return;
    }
  }, [connectWallet]);

  useEffect(() => {
    const doLogin = async () => {
      if (!connecting) return;
      if (!connected || !publicKey || !signMessage) return;

      try {
        const { nonce, jwt: jwtSession } = await startSession();
        const encoded = new TextEncoder().encode(nonce);
        const signed = await signMessage(encoded);
        const { jwt, isNewUser} = await confirmLogin({
          walletAddress: publicKey.toString(),
          signature: signed,
          jwt: jwtSession,
        });

        overrideSaveJwt ? overrideSaveJwt(jwt, isNewUser) : login(jwt);
        afterClick();
      } catch (err) {
        console.error("Login error", err);
      } finally {
        setConnecting(false);
      }
    };

    doLogin();
  }, [connecting, connected, publicKey, signMessage, login, afterClick]);


  return (
    <Button
      mode="outlined"
      onPress={handlePress}
      labelStyle={{ ...theme.fonts.labelLarge }}
      style={{ width: '100%', borderColor: theme.colors.outline, borderRadius: 14 }}
      textColor={theme.colors.onSurface}
      icon={() => <SvgIcon name="wallet-outlined" size={24} color={theme.colors.onSurface} />}
    >
      {connecting ? 'Connecting' : 'Connect with Wallet'}
    </Button>
  );
}

export function AnoterWalletButton({overrideSaveJwt}:{
  overrideSaveJwt?: (jwt:string, isNewUser: boolean) => void;
}) {
  const connectWallet = getConnectToWallet();
  const { login } = useAuth();
  const { connected, publicKey, disconnect, signMessage, select } = useWallet();

  const [connecting, setConnecting] = useState(false);

  const handleReconnect = useCallback(async () => {
    setConnecting(true);
    if (disconnect)
      await disconnect();
    if (select) {
      await select('Phantom');
    }
    const isConnected = await connectWallet();
    if (!isConnected) {
      setConnecting(false);
    }
  }, [disconnect, connectWallet, select]);

  useEffect(() => {
    const doLogin = async () => {
      if (!connecting || !connected || !publicKey || !signMessage) return;

      try {
        const { nonce, jwt: jwtSession } = await startSession();
        const encoded = new TextEncoder().encode(nonce);
        const signed = await signMessage(encoded);
        const { jwt, isNewUser } = await confirmLogin({
          walletAddress: publicKey.toString(),
          signature: signed,
          jwt: jwtSession,
        });

        overrideSaveJwt ?
          overrideSaveJwt(jwt, isNewUser) :
          login(jwt);
      } catch (err) {
        console.error("Login error", err);
      } finally {
        setConnecting(false);
      }
    };

    doLogin();
  }, [connecting, connected, publicKey, signMessage, login]);

  return (
    <GreenButton
      onClick={handleReconnect}
      buttonText= {connecting ? 'Connecting' : "Try Another Wallet"}
      icon="wallet-outlined"
    />
  );
}
