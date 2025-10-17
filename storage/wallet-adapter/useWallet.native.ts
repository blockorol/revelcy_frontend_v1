import { useContext } from 'react';
import { WalletContext } from './WalletProvider.native';
import type { WalletContextValue } from './walletTypes';

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within <WalletProvider />');
  return ctx;
}
