// storage/wallet-adapter/walletTypes.ts

import { Connection, PublicKey } from '@solana/web3.js';

export interface WalletContextType {
  publicKey: PublicKey | null;
  connected: boolean;
  connection: Connection;
  connect: () => Promise<void>;
  disconnect: () => void;
  select?: (walletName: string) => void;
  wallet?: any;
  signMessage?: (message: Uint8Array, displayEncoding?: 'utf8' | 'hex')=> Promise<Uint8Array>;
}
