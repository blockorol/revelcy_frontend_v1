import { useWallet as useSolanaWallet, AnchorWallet} from '@solana/wallet-adapter-react';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { useEffect } from 'react';
import { PhantomWalletName } from "@solana/wallet-adapter-phantom";



export const useWallet = () => {
  const { connected, publicKey, connect, disconnect, select, wallet, signMessage} = useSolanaWallet();
    useEffect(() => {
    if (!wallet) {
      select(PhantomWalletName);
    }
  }, [wallet, select]);

  return { connected, publicKey, connect, disconnect, wallet, signMessage};
};

export const useAnchorWalletSafe = (): AnchorWallet | undefined => {
  const walletContext = useSolanaWallet();
  const adapter = walletContext.wallet?.adapter;

  if (
    walletContext.connected &&
    walletContext.publicKey &&
    adapter &&
    'signTransaction' in adapter &&
    'signAllTransactions' in adapter
  ) {
    const signerAdapter = adapter as SignerWalletAdapter;

    return {
      publicKey: walletContext.publicKey,
      signTransaction: signerAdapter.signTransaction.bind(signerAdapter),
      signAllTransactions: signerAdapter.signAllTransactions.bind(signerAdapter),
    };
  }
  return undefined;
};
