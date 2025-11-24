import * as React from "react";
import {
  useWallet as useSolanaWallet,
  type AnchorWallet,
} from "@solana/wallet-adapter-react";
import { SignerWalletAdapter } from "@solana/wallet-adapter-base";
import { PhantomWalletName } from "@solana/wallet-adapter-phantom";

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

export const useWallet = () => {
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

  // защита от повторных вызовов connect
  const inFlightRef = React.useRef(false);

  const selectIfNeeded = React.useCallback(async () => {
    // если выбран не Phantom — выбираем Phantom
    if (!wallet || wallet.adapter.name !== PhantomWalletName) {
      await rawSelect(PhantomWalletName as any);
    }
  }, [wallet, rawSelect]);

  /**
   * "Умный" connect: делает select(Phantom) при необходимости и один раз вызывает connect().
   * Возвращает true при успехе; false — если пользователь отменил.
   */
  const connect = React.useCallback(async (): Promise<boolean> => {
    if (inFlightRef.current) return false;
    inFlightRef.current = true;
    try {
      await selectIfNeeded();
      try {
        await rawConnect();
        return true;
      } catch (e) {
        if (isUserReject(e)) return false; // пользователь нажал "Отмена"
        throw e; // прочие ошибки — наверх (логируй у себя)
      }
    } finally {
      inFlightRef.current = false;
    }
  }, [selectIfNeeded, rawConnect]);

  // без исключений — всегда boolean
  const connectIfAvailable = React.useCallback(async (): Promise<boolean> => {
    try {
      return await connect();
    } catch {
      return false;
    }
  }, [connect]);

  return {
    connected,
    publicKey,
    connect, // select(Phantom) + connect()
    connectIfAvailable, // безопасный вариант
    disconnect,
    wallet,
    wallets,
    signMessage,
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
