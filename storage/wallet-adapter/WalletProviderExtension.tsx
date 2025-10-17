import React, { useMemo } from 'react';
import { clusterApiUrl } from '@solana/web3.js';
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
  useWallet as useAdapterWallet,
} from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import type { WalletName } from '@solana/wallet-adapter-base';
import { WalletReactContext, WalletContextValue } from './WalletContext';
import { useNetwork } from '@providers/NetworkContext';

// --- мост к твоему интерфейсу ---
const AdapterBridge: React.FC<{
  children: React.ReactNode;
  phantomName: WalletName; // <-- получаем брендированное имя сюда
}> = ({ children, phantomName }) => {
  const adapter = useAdapterWallet();

  const value: WalletContextValue = useMemo(() => {
    const publicKeyBase58 = adapter.publicKey?.toBase58();
    const connected = !!adapter.connected;

    const connect = async () => adapter.connect();
    const signMessage = async (message: Uint8Array) => {
      if (!adapter.signMessage) throw new Error('signMessage not supported by selected wallet');
      return adapter.signMessage(message);
    };
    const disconnect = async () => adapter.disconnect();
    const resetLastSignature = () => {};

    const walletName = adapter.wallet?.adapter?.name ?? phantomName;
    const wallet = { name: walletName as unknown as string }; // для совместимости

    const select = async (name: string) => {
      // поддерживаем только Phantom, но используем БРЕНДИРОВАННОЕ имя
      if (name.toLowerCase() !== 'phantom') {
        throw new Error(`Only Phantom is supported in this build, got: ${name}`);
      }
      await adapter.select(phantomName); // <-- вот это ключевая правка
    };

    return {
      connected,
      publicKeyBase58,
      publicKey: adapter.publicKey ?? undefined,
      isExtensionAvailable: true,
      isMobileFallbackActive: false,
      pending: null,
      lastSignature: undefined,
      connect,
      signMessage,
      disconnect,
      resetLastSignature,
      wallet,
      select,
    };
  }, [adapter, phantomName]);

  return (
    <WalletReactContext.Provider value={value}>
      {children}
    </WalletReactContext.Provider>
  );
};


export const WalletProviderExtension: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { network } = useNetwork();
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const phantom = useMemo(() => new PhantomWalletAdapter(), []);
  const wallets = useMemo(() => [phantom], [phantom]);
  const phantomName = phantom.name; // WalletName<'Phantom'>

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <AdapterBridge phantomName={phantomName}>
          {children}
        </AdapterBridge>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};
