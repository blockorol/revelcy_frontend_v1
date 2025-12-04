import * as React from "react";
import {
  useWallet as useSolanaWallet,
  type AnchorWallet,
} from "@solana/wallet-adapter-react";
import { SignerWalletAdapter } from "@solana/wallet-adapter-base";
import { PhantomWalletName } from "@solana/wallet-adapter-phantom";
import type { PublicKey } from "@solana/web3.js";

export interface WalletContextValue {
  connected: boolean;
  publicKey: PublicKey | null;
  connect: () => Promise<boolean>;
  connectIfAvailable: () => Promise<boolean>;
  disconnect: () => Promise<void> | void;
  wallet: any;
  wallets: any[];
  signMessage: (message: Uint8Array, display?: 'utf8' | 'hex') => Promise<Uint8Array>;
}

function isUserReject(e: unknown) {
  const any = e as any;
  const code = any?.code;
  const msg = (any?.message ?? "").toString().toLowerCase();
  const name = (any?.name ?? "").toString().toLowerCase();
  return (
    code === 4001 ||
    msg.includes("reject") ||
    msg.includes("cancel") ||
    name.includes("reject")
  );
}

export const useWallet = (): WalletContextValue => {
  const {
    connected,
    publicKey,
    connect: rawConnect,
    disconnect,
    select: rawSelect,
    wallet,
    wallets,
    signMessage,
  } = useSolanaWallet();

  const inFlightRef = React.useRef(false);

  const selectIfNeeded = React.useCallback(async () => {
    if (!wallet || wallet.adapter.name !== PhantomWalletName) {
      await rawSelect(PhantomWalletName as any);
    }
  }, [wallet, rawSelect]);

  const connect = React.useCallback(async (): Promise<boolean> => {
    if (inFlightRef.current) {
      return false;
    }

    if (!(window as any).solana?.isPhantom) {
      throw new Error('Phantom extension is not installed or not detected');
    }

    inFlightRef.current = true;
    try {
      await selectIfNeeded();

      const phantomWallet = (window as any).solana;

      if (phantomWallet?.isConnected) {
        try {
          await rawConnect();
        } catch (syncError) {}
      } else {
        try {
          await phantomWallet.connect({ onlyIfTrusted: false });

          try {
            await rawConnect();
          } catch (syncError) {}
        } catch (directError: any) {
          await rawConnect();
        }
      }

      return true;
    } catch (e) {
      if (isUserReject(e)) {
        return false;
      }
      throw e;
    } finally {
      inFlightRef.current = false;
    }
  }, [selectIfNeeded, rawConnect]);

  const connectIfAvailable = React.useCallback(async (): Promise<boolean> => {
    try {
      return await connect();
    } catch {
      return false;
    }
  }, [connect]);

  const wrappedSignMessage = React.useCallback(
    async (message: Uint8Array, _display?: 'utf8' | 'hex'): Promise<Uint8Array> => {
      if (!signMessage) {
        throw new Error('Wallet does not support message signing');
      }
      return await signMessage(message);
    },
    [signMessage]
  );

  return {
    connected,
    publicKey,
    connect,
    connectIfAvailable,
    disconnect,
    wallet,
    wallets,
    signMessage: wrappedSignMessage,
  };
};

export const useAnchorWalletSafe = (): AnchorWallet | undefined => {
  const walletContext = useSolanaWallet();
  const adapter = walletContext.wallet?.adapter;

  if (
    walletContext.connected &&
    walletContext.publicKey &&
    adapter &&
    "signTransaction" in adapter &&
    "signAllTransactions" in adapter
  ) {
    const signerAdapter = adapter as SignerWalletAdapter;

    return {
      publicKey: walletContext.publicKey,
      signTransaction: signerAdapter.signTransaction.bind(signerAdapter),
      signAllTransactions:
        signerAdapter.signAllTransactions.bind(signerAdapter),
    };
  }
  return undefined;
};
