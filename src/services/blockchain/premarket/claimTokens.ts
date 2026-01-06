import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { GetClaimTokensTransaction, signTransactionWithRevelcyAuth } from "@api/tx_premarket";
import { simulateAndSignRawTx, confirmTxFinalised } from "@services/blockchain/signAndSend";

export async function claimTokens(
  wallet: AnchorWallet,
  connection: Connection,
  network: "devnet" | "mainnet-beta",
  premarketAccount: PublicKey,
  tokenMint: PublicKey,
  onChangeState?: (state: string) => void
): Promise<{ txId: string }> {
  onChangeState?.("Creating claim transaction...");
  console.log("Claiming tokens with args:", {
    wallet: wallet.publicKey.toBase58(),
    premarket: premarketAccount.toBase58(),
    mint: tokenMint.toBase58(),
    network,
  });

  const { transaction } = await GetClaimTokensTransaction(
    wallet.publicKey.toBase58(),
    premarketAccount.toBase58(),
    tokenMint.toBase58(),
    network
  );

  console.log("Unsigned claim transaction created by BE:", {
    wallet: wallet.publicKey.toBase58(),
    premarket: premarketAccount.toBase58(),
    mint: tokenMint.toBase58(),
    network,
    transaction,
  });

  onChangeState?.("Simulating and signing transaction with wallet...");
  const userSignedB64 = await simulateAndSignRawTx(transaction, connection, wallet);

  console.log("Claim transaction signed by wallet, sending to BE for Revelcy signature...");

  onChangeState?.("Send transaction to blockchain...");
  const { signature, status } = await signTransactionWithRevelcyAuth({
    network,
    txBase64: userSignedB64,
    txType: "claim_tokens",
    premarket: premarketAccount.toBase58(),
  });

  
    onChangeState?.(`Waiting to tx finalisation. Current status: ${status}...`);
    try {
      await confirmTxFinalised(connection, signature);
    } catch (e) {
      console.error("transation is not finalised!", e)
      throw e
    }
  
    console.log("transaction finalised!");
    return { txId: signature }
}
