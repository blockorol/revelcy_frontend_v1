import { Connection, Transaction, VersionedTransaction, Commitment } from '@solana/web3.js';
import type { AnchorWallet } from '@solana/wallet-adapter-react';

export async function signSendAndReport(
  txBase64: string,
  connection: Connection,
  wallet: AnchorWallet,
  commitment: Commitment = 'confirmed',
): Promise<string> {
  const raw = Buffer.from(txBase64, 'base64');

  // deserialize: we try v0, and than legacy
  let tx: Transaction | VersionedTransaction;
  try {
    tx = VersionedTransaction.deserialize(raw);
  } catch {
    tx = Transaction.from(raw);
  }

  // @ts-ignore — wallet-adapter принимает обе версии
  const signed: Transaction | VersionedTransaction = await wallet.signTransaction(tx);

  const signature = await connection.sendRawTransaction(signed.serialize(), {
    skipPreflight: false,
    maxRetries: 0,
    preflightCommitment: commitment,
  });

  return signature;
}
