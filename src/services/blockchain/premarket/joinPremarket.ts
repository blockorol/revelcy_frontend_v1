import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { getJoinPremarketTransaction, signTransactionWithRevelcyAuth } from "@api/tx_premarket";
import { simulateAndSignRawTx, sendRawTx } from "@services/blockchain/signAndSend";

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
  console.log("Joining premarket with args:", {
    premarket: premarketAccount.toBase58(),
    amountSolLamp: amountSolLamp.toString(),
    wallet: wallet.publicKey.toBase58(),
    network,
  });

  const { transaction } = await getJoinPremarketTransaction(
    premarketAccount.toBase58(),
    amountSolLamp,
    wallet.publicKey.toBase58(),
    network
  );

  console.log("Unsigned join transaction created by BE:", {
    premarket: premarketAccount.toBase58(),
    amountSolLamp: amountSolLamp.toString(),
    wallet: wallet.publicKey.toBase58(),
    network,
    transaction,
  });

  onChangeState?.("Simulating and signing transaction with wallet...");
  const userSignedB64 = await simulateAndSignRawTx(transaction, connection, wallet);

  console.log("Join transaction signed by wallet, sending to BE for Revelcy signature...");

  onChangeState?.("Signing transaction on backend...");
  const { transaction: backendSignedB64 } = await signTransactionWithRevelcyAuth({
    network,
    txBase64: userSignedB64,
    txType: "join_premarket",
  });

  console.log("Join transaction signed by backend. Sending to blockchain...");

  onChangeState?.("Sending transaction to blockchain...");
  const txSig = await sendRawTx(backendSignedB64, connection);

  console.log("Join transaction sent and confirmed. Signature:", txSig);

  return { txId: txSig };
}
