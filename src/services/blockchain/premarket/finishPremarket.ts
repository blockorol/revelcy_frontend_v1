import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { getFinishPremarketTransaction, getRefundPremarketTransaction } from "@api/tx_premarket";
import { signAndSend } from "@services/blockchain/signAndSend";

export async function finishPremarket(
  wallet: AnchorWallet,
  connection: Connection,
  network: "devnet" | "mainnet-beta",
  premarketAccount: PublicKey,
  onChangeState?: (state: string) => void
): Promise<{ txId: string }> {
  onChangeState?.("Creating transaction...");
  const { transaction } = await getFinishPremarketTransaction(
    wallet.publicKey.toBase58(),
    premarketAccount.toBase58(),
    network
  );

  onChangeState?.("Sending transaction to blockchain...");
  const report = await signAndSend(transaction, connection, wallet);
  return { txId: report };
}

export async function refundPremarket(
  wallet: AnchorWallet,
  connection: Connection,
  network: "devnet" | "mainnet-beta",
  premarketAccount: PublicKey,
  onChangeState?: (state: string) => void
): Promise<{ txId: string }> {
  onChangeState?.("Creating transaction...");
  const { transaction } = await getRefundPremarketTransaction(
    wallet.publicKey.toBase58(),
    premarketAccount.toBase58(),
    network
  );

  onChangeState?.("Sending transaction to blockchain...");
  const report = await signAndSend(transaction, connection, wallet);


  return { txId: report };
}
