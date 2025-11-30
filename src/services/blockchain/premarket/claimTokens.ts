import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { GetClaimTokensTransaction } from "@api/tx_premarket";
import { signAndSend } from "@services/blockchain/signAndSend";

export async function claimTokens(
  wallet: AnchorWallet,
  connection: Connection,
  network: "devnet" | "mainnet-beta",
  premarketAccount: PublicKey,
  tokenMint: PublicKey,
  onChangeState?: (state: string) => void
): Promise<{ txId: string }> {
  onChangeState?.("Creating claim transaction...");
  const { transaction } = await GetClaimTokensTransaction(
    wallet.publicKey.toBase58(),
    premarketAccount.toBase58(),
    tokenMint.toBase58(),
    network
  );

  onChangeState?.("Sending transaction to blockchain...");
  const report = await signAndSend(transaction, connection, wallet);

  return { txId: report };
}

