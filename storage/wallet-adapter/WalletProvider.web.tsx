import React, { useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { clusterApiUrl } from '@solana/web3.js';
import { useNetwork } from '@providers/NetworkContext';
import { IS_SITE_SNAPSHOT } from 'env';

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { network } = useNetwork();
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => IS_SITE_SNAPSHOT ? [] : [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect={!IS_SITE_SNAPSHOT}>
        {children}
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};
