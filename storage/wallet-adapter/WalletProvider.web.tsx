import React, { useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { clusterApiUrl } from '@solana/web3.js';
import { useNetwork } from '@providers/NetworkContext';
import { WalletProvider as MobileWalletProvider } from './WalletProvider.mobile';

function isMobileWebBrowser() {
  if (typeof navigator === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
}

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { network } = useNetwork();
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  const isMobileBrowser = useMemo(() => isMobileWebBrowser(), []);

  if (isMobileBrowser) {
    return <MobileWalletProvider>{children}</MobileWalletProvider>;
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect={false}>
        {children}
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};
