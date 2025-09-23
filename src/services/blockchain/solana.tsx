import { Connection } from "@solana/web3.js";
import { SolanaNetwork } from "@providers/NetworkContext";
import {HELIUS_KEY} from 'env'

export function cn(...args: (string | false | null | undefined)[]): string {
    return args.filter(Boolean).join(" ");
  }
  
  export function getSolanaConnection(network: SolanaNetwork): Connection {
    return new Connection(getSolanaHost(network))
  }
  
  export function getSolanaHost(network: SolanaNetwork): string {
    switch (network) {
      case 'mainnet-beta':
        return `https://mainnet.helius-rpc.com/?api-key=${HELIUS_KEY}`;
      case 'devnet':
        return `https://devnet.helius-rpc.com/?api-key=${HELIUS_KEY}`;
      default:
        throw new Error(`Unsupported Solana network: ${network}`);
    }
  }