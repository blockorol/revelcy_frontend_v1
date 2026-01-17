import { PublicKey } from "@solana/web3.js";

export function isSolanaPublicKey(value: string): boolean {
  try {
    const pk = new PublicKey(value);
    return pk.toBytes().length === 32;
  } catch {
    return false;
  }
}
