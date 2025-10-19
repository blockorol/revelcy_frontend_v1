import { PublicKey } from '@solana/web3.js';
import React, { createContext, useContext } from 'react';

export type Cluster = 'devnet' | 'testnet' | 'mainnet-beta';
export type MobileIntent = 'connect' | 'signMessage';

export type PendingAction =
  | { id: string; type: 'connect' }
  | { id: string; type: 'signMessage'; message: Uint8Array };

export interface WalletState {
  connected: boolean;
  publicKeyBase58?: string;
  isExtensionAvailable: boolean;
  isMobileFallbackActive: boolean;
  lastSignature?: Uint8Array;
  pending?: PendingAction | null;
  publicKey?: PublicKey;           // ✅ объект PublicKey
}

export interface WalletContextValue extends WalletState {
  connect: () => Promise<void>;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  disconnect?: () => void;
  resetLastSignature: () => void;

  // совместимость со «старым» API
  wallet?: { name: string } | null;
  select?: (name: string) => Promise<void>;
}

export const WalletReactContext = createContext<WalletContextValue | null>(null);

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletReactContext);
  if (!ctx) throw new Error('useWallet must be used within <WalletProvider />');
  return ctx;
}
