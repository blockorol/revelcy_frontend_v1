import React, { createContext, useMemo, useState } from 'react';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { useNetwork } from '@providers/NetworkContext';

import { WalletContextType } from './walletTypes'

export const WalletContext = createContext<WalletContextType | null>(null);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { network } = useNetwork();
  const endpoint = clusterApiUrl(network);
  const connection = useMemo(() => new Connection(endpoint), [endpoint]);

  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [connected, setConnected] = useState(false);

  const connect = async () => {
    // TODO: интеграция Solana Mobile Wallet Adapter
  };
  const signMessage = async (message: Uint8Array, displayEncoding?: 'utf8' | 'hex'): Promise<{ signature: Uint8Array }> =>{
      const fakeSignature = new Uint8Array(64);
      return { signature: fakeSignature };
  }


  const disconnect = () => {
    setPublicKey(null);
    setConnected(false);
  };

  return (
    <WalletContext.Provider value={{ publicKey, connected, connection, connect, disconnect, signMessage}}>
      {children}
    </WalletContext.Provider>
  );
};
