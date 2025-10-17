import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, useTheme } from 'react-native-paper';
import { SvgIcon } from '@components/base/SvgIcon';
import { useWallet } from '@storage/wallet-adapter';
import { confirmLogin, startSession } from '@api/auth';
import { getConnectToWallet } from '@hooks/connectWallet';
import { useAuth } from '@providers/AuthContext';
import GreenButton from '@components/login/buttons/GreenButton';

const SS_KEY = 'wallet_login_connecting'; // переживаем редирект

interface WalletButtonProps {
  afterClick: () => void;
  overrideSaveJwt?: (jwt: string, isNewUser: boolean) => void;
}

export default function WalletButton({ afterClick, overrideSaveJwt }: WalletButtonProps) {
  const theme = useTheme();
  const connectWallet = getConnectToWallet();
  const { login } = useAuth();
  const { connected, publicKeyBase58, publicKey, signMessage } = useWallet();

  // локальный признак (дублируем в sessionStorage)
  const [connecting, setConnecting] = useState<boolean>(() => {
    return sessionStorage.getItem(SS_KEY) === '1';
  });

  // чтобы не стартовать повторно
  const didLoginRef = useRef(false);

  const effectiveAddress = publicKeyBase58?? publicKey?.toString();

  const handlePress = useCallback(async () => {
    // помечаем процесс логина ДО вызова connect()
    setConnecting(true);
    sessionStorage.setItem(SS_KEY, '1');

    if (connected) {
      // уже подключены — дальше эффект дожмёт signMessage
      return;
    }

    const ok = await connectWallet();
    if (!ok) {
      setConnecting(false);
      sessionStorage.removeItem(SS_KEY);
    }
  }, [connected, connectWallet]);

  // единая функция "дожать" логин после коннекта
  const finishLogin = useCallback(async () => {
    if (didLoginRef.current) return;
    if (!connecting) return;
    if (!connected) return;
    if (!effectiveAddress) return;
    if (!signMessage) return;

    try {
      didLoginRef.current = true;
      const { nonce, jwt: jwtSession } = await startSession();
      const encoded = new TextEncoder().encode(nonce);
      const signed = await signMessage(encoded);

      const { jwt, isNewUser } = await confirmLogin({
        walletAddress: effectiveAddress,
        signature: signed,
        jwt: jwtSession,
      });

      overrideSaveJwt ? overrideSaveJwt(jwt, isNewUser) : login(jwt);
      afterClick();
    } catch (err) {
      console.error('Login error', err);
      // позволим повторить попытку
      didLoginRef.current = false;
    } finally {
      setConnecting(false);
      sessionStorage.removeItem(SS_KEY);
    }
  }, [connecting, connected, effectiveAddress, signMessage, login, afterClick, overrideSaveJwt]);

  // 1) Реакция на обычные изменения стора (SPA без перезагрузки)
  useEffect(() => {
    finishLogin();
  }, [finishLogin]);

  // 2) Дожим по кастомным событиям провайдера (после deeplink-редиректа)
  useEffect(() => {
    const onConnected = () => finishLogin();
    const onVisible = () => {
      // иногда браузер возвращается и вкладка становится видимой чуть позже
      if (document.visibilityState === 'visible') finishLogin();
    };

    window.addEventListener('wallet:connected', onConnected);
    document.addEventListener('visibilitychange', onVisible);
    // на всякий — если роутер дернул popstate
    const onPop = () => finishLogin();
    window.addEventListener('popstate', onPop);

    return () => {
      window.removeEventListener('wallet:connected', onConnected);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('popstate', onPop);
    };
  }, [finishLogin]);

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

interface Props {
  overrideSaveJwt?: (jwt: string, isNewUser: boolean) => void;
}

const CONNECTING_FLAG_ANOTHER = 'wallet_connecting_in_progress_alt';

export function AnoterWalletButton({ overrideSaveJwt }: Props) {
  const connectWallet = getConnectToWallet();
  const { login } = useAuth();

  const {
    connected,
    publicKey,
    publicKeyBase58,
    disconnect,
    signMessage,
    select,
  } = useWallet();

  const [connecting, setConnecting] = useState(false);
  const resumedOnce = useRef(false);

  const getAddressString = useCallback((): string | undefined => {
    return publicKeyBase58 || publicKey?.toString();
  }, [publicKeyBase58, publicKey]);

  const handleReconnect = useCallback(async () => {
    setConnecting(true);
    sessionStorage.setItem(CONNECTING_FLAG_ANOTHER, '1');

    if (disconnect) await disconnect();
    if (select) await select('Phantom');

    const ok = await connectWallet();
    if (!ok) {
      setConnecting(false);
      sessionStorage.removeItem(CONNECTING_FLAG_ANOTHER);
    }
  }, [disconnect, connectWallet, select]);

  useEffect(() => {
    if (resumedOnce.current) return;
    resumedOnce.current = true;

    if (sessionStorage.getItem(CONNECTING_FLAG_ANOTHER) === '1') {
      setConnecting(true);
    }
  }, []);

  useEffect(() => {
    const doLogin = async () => {
      if (!connecting || !connected || !signMessage) return;
      const address = getAddressString();
      if (!address) return;

      try {
        const { nonce, jwt: jwtSession } = await startSession();
        const encoded = new TextEncoder().encode(nonce);
        const signed = await signMessage(encoded);
        const { jwt, isNewUser } = await confirmLogin({
          walletAddress: address,
          signature: signed,
          jwt: jwtSession,
        });

        overrideSaveJwt ? overrideSaveJwt(jwt, isNewUser) : login(jwt);
      } catch (err) {
        console.error('Login error', err);
      } finally {
        setConnecting(false);
        sessionStorage.removeItem(CONNECTING_FLAG_ANOTHER);
      }
    };

    doLogin();
  }, [connecting, connected, signMessage, getAddressString, login, overrideSaveJwt]);

  return (
    <GreenButton
      onClick={handleReconnect}
      buttonText={connecting ? 'Connecting' : 'Try Another Wallet'}
      icon="wallet-outlined"
    />
  );
}
