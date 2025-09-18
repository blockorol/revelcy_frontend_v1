import { useContext } from 'react';
import { WalletContext } from './WalletProvider';
import { AnchorWallet } from '@solana/wallet-adapter-react';

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context
};

export const useAnchorWalletSafe = (): AnchorWallet | undefined => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  const wallet = context.wallet
  if (
      wallet.connected &&
      wallet.publicKey 
    ) {
      return wallet as AnchorWallet;
  }
  
  throw new Error('useAnchorWalletSafe must be used with AnchorWallet');
};