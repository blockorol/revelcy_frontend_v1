// services/blockchain/signAndSend.ts
import {
  Connection,
  Transaction,
} from "@solana/web3.js";

export async function signAndSend(b64: string, connection: Connection, wallet: any) {
  const raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const tx = Transaction.from(raw);

  console.log("Signing transaction with wallet:", wallet.publicKey.toBase58());

  // get a fresh blockhash before signing to prevent expiration issues (especially on mobile)
  console.log("Getting fresh blockhash...");
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;
  console.log("Updated transaction with fresh blockhash:", blockhash);

  const signed = await wallet.signTransaction(tx);
  console.log("Transaction signed.");

  const raw2 = signed.serialize();
  console.log("Sending transaction to network...");

  const sig = await connection.sendRawTransaction(raw2, {
    skipPreflight: false,
    preflightCommitment: "finalized",
  });
  console.log("Transaction sent to network with signature:", sig);

  try {
    console.log("Confirming transaction...");
    await connection.confirmTransaction({
      signature: sig,
      blockhash,
      lastValidBlockHeight,
    }, "finalized");
    console.log("Transaction confirmed.");
  } catch (e) {
    console.error("Error confirming transaction:", e);
    if ((e as any)?.logs) console.error("confirm logs:", (e as any).logs);
    throw e;
  }
  return sig;
}