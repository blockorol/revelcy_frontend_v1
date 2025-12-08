import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { getOutPremarketTransaction } from "@api/tx_premarket";
import { signAndSend } from "@services/blockchain/signAndSend";

export async function outOfPremarket(
  wallet: AnchorWallet,
  connection: Connection,
  network: "devnet" | "mainnet-beta",
  premarketAccount: PublicKey,
  onChangeState?: (state: string) => void
): Promise<{ txId: string }> {
  onChangeState?.("Creating transaction...");

  const { transaction } = await getOutPremarketTransaction(
    premarketAccount.toBase58(),
    wallet.publicKey.toBase58(),
    network
  );

  onChangeState?.("Sending transaction to blockchain...");

  const report = await signAndSend(transaction, connection, wallet);

  return { txId: report };
}
