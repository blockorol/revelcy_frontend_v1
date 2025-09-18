import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { getJoinPremarketTransaction } from "@api/tx_premarket";
import { signAndSend } from "@services/blockchain/signAndSend";

export async function joinToPremarket(
  wallet: AnchorWallet,
  connection: Connection,
  network: "devnet" | "mainnet-beta",
  premarketAccount: PublicKey,
  amountSolLamp: BN,
  _minAmountToken?: BN,
  onChangeState?: (state: string) => void
): Promise<{ txId: string }> {
  onChangeState?.("Creating transaction...");

  const { transaction } = await getJoinPremarketTransaction(
    premarketAccount.toBase58(),
    amountSolLamp,
    wallet.publicKey.toBase58(),
    network 
  );

  onChangeState?.("Sending transaction to blockchain...");

  const report = await signAndSend(transaction, connection, wallet);

  return { txId: report };
}
