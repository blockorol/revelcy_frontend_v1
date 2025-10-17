import React, { createContext, useMemo, useState } from 'react';
import type { WalletContextType } from './walletTypes';

export const WalletContext = createContext<WalletContextType | null>(null);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [publicKeyBase58, setPublicKeyBase58] = useState<string | undefined>(undefined);

  const connect = async () => {
    // TODO: интеграция Solana Mobile Wallet Adapter
    // мок: просто "подключим" фиктивный адрес
    setConnected(true);
    setPublicKeyBase58('11111111111111111111111111111111'); // заглушка
  };

  const signMessage = async (message: Uint8Array): Promise<Uint8Array> => {
    // моковая подпись — 64 байта нулей
    return new Uint8Array(64);
  };

  const disconnect = () => {
    setConnected(false);
    setPublicKeyBase58(undefined);
  };

  const ctx = useMemo<WalletContextType>(() => ({
    connected,
    publicKeyBase58,
    publicKey: publicKeyBase58,
    isExtensionAvailable: false,
    isMobileFallbackActive: false,
    pending: null,
    lastSignature: undefined,

    connect,
    signMessage,
    disconnect,
    resetLastSignature: () => {},

    // совместимость со старым API
    wallet: connected ? { name: 'Phantom' } : null,
    select: async (_name: string) => { /* no-op в мокe */ },
  }), [connected, publicKeyBase58]);

  return (
    <WalletContext.Provider value={ctx}>
      {children}
    </WalletContext.Provider>
  );
};
