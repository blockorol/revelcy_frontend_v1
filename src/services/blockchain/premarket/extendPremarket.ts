import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { getExtendPremarketTransaction } from "@api/tx_premarket";
import { signAndSend } from "@services/blockchain/signAndSend";

export async function extendPremarket(
  wallet: AnchorWallet,
  connection: Connection,
  network: "devnet" | "mainnet-beta",
  premarketAccount: PublicKey,
  newDeadline: number,
  onChangeState?: (state: string) => void
): Promise<{ txId: string }> {
  onChangeState?.("Creating transaction...");
  const { transaction } = await getExtendPremarketTransaction(
    wallet.publicKey.toBase58(),
    premarketAccount.toBase58(),
    network,
    newDeadline
  );

  onChangeState?.("Sending transaction to blockchain...");
  const report = await signAndSend(transaction, connection, wallet);
  return { txId: report };
}
