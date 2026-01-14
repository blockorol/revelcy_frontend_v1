import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { getJoinPremarketTransaction, JoinPremarketReq, signTransactionWithRevelcyAuth } from "@api/tx_premarket";
import { simulateAndSignRawTx, confirmTxFinalised } from "@services/blockchain/signAndSend";
import { userSetAdditionalInfo } from "@services/fingerprint/sender";

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

  onChangeState?.("Send transaction to blockchain...");
  const req: JoinPremarketReq = {
    tx_type: "join_premarket",
    network, 
    unsigned_tx: userSignedB64
  }  
  const { signature, status } = await signTransactionWithRevelcyAuth(req);
  
  userSetAdditionalInfo({
    premarket: premarketAccount.toBase58(),
    eventType: "join_premarket"
  })
  

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
