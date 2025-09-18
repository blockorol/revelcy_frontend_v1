import { useWallet as useSolanaWallet, AnchorWallet} from '@solana/wallet-adapter-react';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';


export const useWallet = () => {
  const { connected, publicKey, connect, disconnect, select, wallet, signMessage} = useSolanaWallet();
  return { connected, publicKey, connect, disconnect, select, wallet, signMessage};
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
