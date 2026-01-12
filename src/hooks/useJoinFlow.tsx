// @hooks/useJoinFlow.ts
import BN from "bn.js";
import { PublicKey } from "@solana/web3.js";
import { useAuth } from "@providers/AuthContext";
import { useWallet } from "@storage/wallet-adapter";
import { useAnchorWalletSafe } from "@storage/wallet-adapter/useWallet.web";
import { useNetwork } from "@providers/NetworkContext";
import { getSolanaConnection } from "@services/blockchain/solana";
import { useNotification } from "@providers/NotificationContext";
import { useOverlay } from "@storage/UniversalOverlayProvider";
import { joinToPremarket } from "@services/blockchain/premarket/joinPremarket";
import { convertSmallCountToLamport } from "@utils/premarket";
import TextedLoader from "@components/ui/Loader";
import { useLoginModal } from "@providers/LoginModalContext";

export type JoinOutcome = "ok" | "need-login" | "need-wallet" | "invalid-amount" | "error";

export function useJoinFlow(onUpdated:()=>void) {
  const { user } = useAuth();
  const { openLogin } = useLoginModal()
  const { connected, connect } = useWallet();
  const wallet = useAnchorWalletSafe();
  const { network } = useNetwork();
  const connection = getSolanaConnection(network);
  const notify = useNotification();
  const { open, replace, close: closeOverlay } = useOverlay();

  const joinPremarketByLamports = async (
    premarketPubkey: PublicKey,
    amountLamp: BN
  ): Promise<JoinOutcome> => {
    try {
        
      if (!amountLamp || amountLamp.isNeg() || amountLamp.isZero()) {
        notify.warning("Please set amount in SOL");
        return "invalid-amount";
      }
      if (!user) {
        // For unauthenticated users, show login flow directly
        openLogin();
        return "need-login";
      }
      if (!wallet || !connected) {
        notify.error("Wallet is not connected", {
          suggest: "Enable Phantom extension and try again",
          action: {
            label: "connect",
            onAction: async () => {
              try {
                await connect();
              } catch (e) {
                console.log("error during connect:", e);
              }
            },
          },
        });
        return "need-wallet";
      }

      if (network === 'testnet') {
        notify.error("wrong network", {
          suggest: "connect admin",
        });
        return "need-wallet";
      }

      open(<TextedLoader text={"join to premarket..."} />);
      const res = await joinToPremarket(wallet, connection, network, premarketPubkey, amountLamp, amountLamp,
        (text) => {replace(<TextedLoader text={text} />)
      });

      closeOverlay();
      notify.success("Successfully joined premarket!");
      onUpdated()
      return "ok";
    } catch (e) {
      console.error("join premarket error:", e);
      notify.error("Failed to join premarket");
      closeOverlay();
      return "error";
    }
  };

  const joinPremarketBySol = async (
    premarketPubkey: PublicKey,
    amountSol: number
  ): Promise<JoinOutcome> => {
    if (!Number.isFinite(amountSol) || amountSol <= 0) {
      notify.warning("Please set amount in SOL");
      return "invalid-amount";
    }
    const lamp = convertSmallCountToLamport(amountSol);
    return joinPremarketByLamports(premarketPubkey, lamp);
  };

  return { joinPremarketByLamports, joinPremarketBySol };
}
