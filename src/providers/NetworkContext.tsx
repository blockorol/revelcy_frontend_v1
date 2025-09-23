// storage/NetworkContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NETWORK } from 'env';

export type SolanaNetwork = "devnet" | "testnet" | "mainnet-beta";
const STORAGE_KEY = 'solana-network';
export function GetOtherSolanaNetwork(current: SolanaNetwork): SolanaNetwork {
    return current == 'devnet' ? 'mainnet-beta' : 'devnet'
}

const NetworkContext = createContext<{
  network: SolanaNetwork;
  setNetwork: (net: SolanaNetwork) => void;
}>({
  network: NETWORK??'mainnet-beta',
  setNetwork: () => {},
});

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [network, setNetworkState] = useState<SolanaNetwork>('mainnet-beta');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === 'devnet' || val === 'testnet' || val === 'mainnet-beta') {
        setNetworkState(val);
      }
    });
  }, []);

  const setNetwork = (net: SolanaNetwork) => {
    if (NETWORK !== undefined) return
    setNetworkState(net);
    AsyncStorage.setItem(STORAGE_KEY, net);
  };

  return (
    <NetworkContext.Provider value={{ network, setNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);