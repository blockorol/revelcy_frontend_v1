import React from 'react';
import { WalletProviderExtension } from './WalletProviderExtension';
import { WalletProviderDeeplink } from './WalletProviderDeeplink';
import { WalletReactContext } from './WalletContext';

// утилиты выбора
function isMobileUA() {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
function isPhantomExtensionAvailable() {
  return typeof window !== 'undefined' && !!(window as any).solana?.isPhantom;
}

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const shouldUseExtension = !isMobileUA();

  if (shouldUseExtension) {
    // десктоп + расширение Phantom
    return <WalletProviderExtension>{children}</WalletProviderExtension>;
  }

  // мобайл или форс — уходим в deeplink-провайдер
  return <WalletProviderDeeplink>{children}</WalletProviderDeeplink>;
};

// экспортируем контекст на случай, если ты его используешь напрямую где-то
export { WalletReactContext } from './WalletContext';
