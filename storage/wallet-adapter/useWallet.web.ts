import { useContext } from 'react';
import { WalletReactContext as WalletContext } from './WalletProvider.web';
import type { WalletContextValue } from './walletTypes';

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within <WalletProvider />');
  return ctx;
}
