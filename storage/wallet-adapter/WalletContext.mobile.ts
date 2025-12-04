import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { createContext, useContext } from 'react';
import type { AnchorWallet } from '@solana/wallet-adapter-react';

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
    isMobileDevice: boolean;
    lastSignature?: Uint8Array;
    pending?: PendingAction | null;
    publicKey?: PublicKey;
    sessionToken?: string; 
}

export interface WalletContextValue extends WalletState {
    connect: () => Promise<void>;
    signMessage: (message: Uint8Array, display?: 'utf8' | 'hex') => Promise<Uint8Array>;
    signTransaction?: <T extends Transaction | VersionedTransaction>(transaction: T) => Promise<T>;
    disconnect?: () => void;
    resetLastSignature: () => void;

    wallet?: { name: string } | null;
    select?: (name: string) => Promise<void>;
}

export const WalletReactContext = createContext<WalletContextValue | null>(null);

export function useWallet(): WalletContextValue {
    const ctx = useContext(WalletReactContext);
    if (!ctx) throw new Error('useWallet must be used within <WalletProvider />');
    return ctx;
}

export function useAnchorWalletSafe(): AnchorWallet | undefined {
    const ctx = useContext(WalletReactContext);
    if (!ctx) return undefined;

    if (ctx.connected && ctx.publicKey && ctx.signTransaction) {
        return {
            publicKey: ctx.publicKey,
            signTransaction: ctx.signTransaction,
            signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
                if (!ctx.signTransaction) throw new Error('signTransaction not available');
                const signed: T[] = [];
                for (const tx of txs) {
                    signed.push(await ctx.signTransaction(tx));
                }
                return signed;
            },
        };
    }

    return undefined;
}
