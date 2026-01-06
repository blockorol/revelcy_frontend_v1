// services/blockchain/signAndSend.ts
import {
  Connection,
  SimulateTransactionConfig,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";

export async function signAndSend(b64: string, connection: Connection, wallet: any) {
  const raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const tx = Transaction.from(raw);

  dumpSignedTx(tx, "before-wallet-sign");

  // 🧪 1) Симуляция ДО подписи
  try {
    console.log("[signAndSend] Simulating transaction before signing...");
    const simRes = await connection.simulateTransaction(tx, {
      sigVerify: false,
      commitment: "processed", // можно "confirmed", если хочешь
    } as any);

    if (simRes.value.err) {
      console.error("[signAndSend] Simulation error:", simRes.value.err);
      if (simRes.value.logs) {
        console.error("[signAndSend] Simulation logs:", simRes.value.logs);
      }
      throw new Error(
        "[signAndSend] Simulation failed, aborting send. " +
          JSON.stringify(simRes.value.err),
      );
    }

    console.log("[signAndSend] Simulation OK");
  } catch (e) {
    console.error("[signAndSend] simulateTransaction threw:", e);
    throw e; // не даём Phantom даже пытаться подписывать сломанную транзу
  }

  // 🖊️ 2) Подпись Phantom’ом
  console.log("Signing transaction with wallet:", wallet.publicKey.toBase58());
  const signed = await wallet.signTransaction(tx);
  console.log("Transaction signed.");

  dumpSignedTx(signed, "after-wallet-sign");

  // 🔁 3) Отправка
  const raw2 = signed.serialize();
  const re = Transaction.from(raw2);
  dumpSignedTx(re, "redecoded-to-send");
  console.log("Sending transaction to network...");

  const sig = await connection.sendRawTransaction(raw2, {
    skipPreflight: false,
    preflightCommitment: "finalized",
  });
  console.log("Transaction sent to network with signature:", sig);

  try {
    console.log("Confirming transaction...");
    await connection.confirmTransaction(sig, "finalized");
    console.log("Transaction confirmed.");
  } catch (e) {
    console.error("Error confirming transaction:", e);
    if ((e as any)?.logs) console.error("confirm logs:", (e as any).logs);
    throw e;
  }

  return sig;
}

/**
 * 1. Декодим base64 → Transaction
 * 2. Симулируем (sigVerify: false)
 * 3. Подписываем Phantom’ом
 * 4. Возвращаем подписанную транзу в base64 (НО НЕ ОТПРАВЛЯЕМ)
 */
export async function simulateAndSignRawTx(
  b64: string,
  connection: Connection,
  wallet: any
): Promise<string> {
  const raw = base64ToBytes(b64);
  const tx = VersionedTransaction.deserialize(raw);

  try {
    console.log("[simulateAndSignRawTx] Simulating transaction before signing...");
    const config: SimulateTransactionConfig = {
      sigVerify: false,
      commitment: "processed",
    }
    const simRes = await connection.simulateTransaction(tx, config);

    if (simRes.value.err) {
      console.error("[simulateAndSignRawTx] Simulation error:", simRes.value.err);
      if (simRes.value.logs) {
        console.error("[simulateAndSignRawTx] Simulation logs:", simRes.value.logs);
      }
      throw new Error(
        "[simulateAndSignRawTx] Simulation failed, aborting signing. " +
          JSON.stringify(simRes.value.err),
      );
    }

    console.log("[simulateAndSignRawTx] Simulation OK");
  } catch (e) {
    console.error("[simulateAndSignRawTx] simulateTransaction threw:", e);
    throw e;
  }

  // 🖊️ 2) Подпись Phantom’ом
  console.log("[simulateAndSignRawTx] Signing transaction with wallet:", wallet.publicKey.toBase58());
  const signed = await wallet.signTransaction(tx);
  console.log("[simulateAndSignRawTx] Transaction signed by wallet.");

  dumpSignedTx(signed, "after-wallet-sign");

  // Возвращаем ВИДЕО base64
  const rawSigned = signed.serialize();
  const b64Signed = bytesToBase64(rawSigned);

  return b64Signed;
}

/**
 * Получает base64 транзакции (уже подписанную юзером + бэком),
 * отправляет в сеть и ждёт подтверждения.
 */
export async function sendRawTx(
  b64: string,
  connection: Connection
): Promise<string> {
  const raw = base64ToBytes(b64);
  const tx = Transaction.from(raw);

  dumpSignedTx(tx, "redecoded-to-send");

  console.log("[sendRawTx] Sending transaction to network...");

  const sig = await connection.sendRawTransaction(raw, {
    skipPreflight: false,
    preflightCommitment: "finalized",
  });

  console.log("[sendRawTx] Transaction sent to network with signature:", sig);

  try {
    console.log("[sendRawTx] Confirming transaction...");
    await connection.confirmTransaction(sig, "finalized");
    console.log("[sendRawTx] Transaction confirmed.");
  } catch (e) {
    console.error("[sendRawTx] Error confirming transaction:", e);
    if ((e as any)?.logs) console.error("[sendRawTx] confirm logs:", (e as any).logs);
    throw e;
  }

  return sig;
}

export async function confirmTxFinalised(connection: Connection, sig: string) {
  // double check do we need loop + timeout here?
  try {
    const res = await connection.confirmTransaction(sig, "finalized");
    if (res.value.err !== null) {
      console.error("[sendRawTx] Error confirming transaction with finalized state:", res.value.err)
    }
  } catch (e) {
    console.error("[sendRawTx] Error confirming transaction:", e);
    if ((e as any)?.logs) console.error("[sendRawTx] confirm logs:", (e as any).logs);
    throw e;
  }
}

function base64ToBytes(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}




function dumpSignedTx(tx: Transaction, label = "signed-tx") {
  // пока выключено, но можно включить для дебага
  // const msg = tx.compileMessage();
  // const numReq = msg.header.numRequiredSignatures;
  // const keys = msg.accountKeys.map(k => k.toBase58());
  // const sigs = tx.signatures.map(s => ({
  //   pubkey: s.publicKey.toBase58(),
  //   hasSig: !!s.signature,
  // }));

  // console.log(`[${label}] header`, msg.header);
  // console.log(`[${label}] accountKeys:`, keys);
  // console.log(`[${label}] required signers:`, keys.slice(0, numReq));
  // console.log(`[${label}] signatures:`, sigs);
}
