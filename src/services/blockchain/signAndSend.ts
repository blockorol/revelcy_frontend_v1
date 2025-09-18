// services/blockchain/signAndSend.ts
import {
  Connection,
  Transaction,
} from "@solana/web3.js";

export async function signAndSend(b64: string, connection: Connection, wallet: any) {
  const raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const tx = Transaction.from(raw);

  dumpSignedTx(tx, "before-wallet-sign");

  const signed = await wallet.signTransaction(tx);

  dumpSignedTx(signed, "after-wallet-sign");

  const raw2 = signed.serialize();
  const re = Transaction.from(raw2);
  dumpSignedTx(re, "redecoded-to-send");

  const sig = await connection.sendRawTransaction(raw2, {
    skipPreflight: false,
    preflightCommitment: "finalized",
  });

  try {
    await connection.confirmTransaction(sig, "finalized");
  } catch (e) {
    if ((e as any)?.logs) console.error("confirm logs:", (e as any).logs);
    throw e;
  }
  return sig;
}




function dumpSignedTx(tx: Transaction, label = "signed-tx") {
//   const msg = tx.compileMessage();
//   const numReq = msg.header.numRequiredSignatures;
//   const keys = msg.accountKeys.map(k => k.toBase58());
//   const sigs = tx.signatures.map(s => ({
//     pubkey: s.publicKey.toBase58(),
//     hasSig: !!s.signature,
//   }));

//   console.log(`[${label}] header`, msg.header);
//   console.log(`[${label}] accountKeys:`, keys);
//   console.log(`[${label}] required signers:`, keys.slice(0, numReq));
//   console.log(`[${label}] signatures:`, sigs);
}