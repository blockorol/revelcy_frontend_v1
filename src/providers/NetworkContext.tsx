// storage/NetworkContext.tsx
import React, { createContext, useContext } from 'react';
import { NETWORK } from 'env';

export type SolanaNetwork = 'devnet' | 'testnet' | 'mainnet-beta';

const isValidNetwork = (v: any): v is SolanaNetwork =>
  v === 'devnet' || v === 'mainnet-beta';

const DEFAULT_NETWORK: SolanaNetwork = isValidNetwork(NETWORK) ? NETWORK : 'mainnet-beta';

export function GetOtherSolanaNetwork(current: SolanaNetwork): SolanaNetwork {
  return current === 'devnet' ? 'mainnet-beta' : 'devnet';
}

const NetworkContext = createContext<{
  network: SolanaNetwork;
  setNetwork: (net: SolanaNetwork) => void;
}>({
  network: DEFAULT_NETWORK,
  setNetwork: () => {},
});

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // just provide setting from env
  const network = DEFAULT_NETWORK;

  // disable setnetwork feature
  const setNetwork = (_net: SolanaNetwork) => {
  };

  return (
    <NetworkContext.Provider value={{ network, setNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);