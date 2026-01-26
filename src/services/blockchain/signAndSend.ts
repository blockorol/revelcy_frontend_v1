// services/blockchain/signAndSend.ts
import {
  Connection,
  SimulateTransactionConfig,
  VersionedTransaction,
} from "@solana/web3.js";


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

  // Возвращаем ВИДЕО base64
  const rawSigned = signed.serialize();
  const b64Signed = bytesToBase64(rawSigned);

  return b64Signed;
}

export async function confirmTxFinalised(connection: Connection, sig: string) {
  // double check do we need loop + timeout here?
  try {
    const res = await connection.confirmTransaction(sig, "finalized");
    if (res.value.err !== null) {
      console.error("[sendRawTx] Error confirming transaction with finalized state:", res.value.err)
      throw Error(res.value.err.toString())
    }
    await sleep(10*1000);// to be sure, that BE is ready
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

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
