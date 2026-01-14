// @api/tx_premarket.ts
import { API_HOST } from "env";
import { BN } from "@coral-xyz/anchor";
import { http } from "@api/http";
import { ensureDec, toDecString } from "@utils/numbers";

export type Network = "devnet" | "mainnet-beta";

const RETRY_TX_GEN = 3;
const RETRY_TX_SEND = 3;

type TX_TYPE = 
  "create_premarket" | 
  "join_premarket" | 
  "out_of_premarket" | 
  "finish_premarket" | 
  "extend_premarket" | 
  "update_uri" |
  "claim_tokens" | 
  "refund_premarket"

/* ===== Create Premarket ===== */

export interface CreatePremarketTxResponse {
  transaction: string;            // base64(Transaction)
  premarket_account_pda: string;  // base58
  mint_address: string;
}

export interface CreatePremarketTxRequest {
  network: Network;
  user_pubkey: string; // base58
  name: string;
  symbol: string;
  uri: string;
  deadline: number;               // unix sec
  goal_sol_lamp: string;          // u64 as string
  max_sol_lamp: string;           // u64 as string
  creator_allocate_lamp: string;  // u64 as string
}

interface CommonTxFields {
  tx_type: TX_TYPE;
  network: Network;
  unsigned_tx: string; // base64
}

interface OldTxFields extends CommonTxFields{
  premarket: string;    // base58
}

export interface CreatePremarketReq extends CommonTxFields {
  tx_type: "create_premarket";
  about_community: {
    description?: string | null;
    token_banner_url?: string | null;
    links?: Array<{ text: string; url: string; type: "x" | "tg" | "other" }> | null;
  };

  // availibility: {
  //   is_hidden?: string | null;
  //   short_url_name?: strign | null;
  //   whitelisting_addresses?: []string // userId or wallet
  // }
}
export type JoinPremarketReq = CommonTxFields & {
  tx_type: "join_premarket";
};

export type OutOfPremarketReq = CommonTxFields & {
  tx_type: "out_of_premarket";
};

export type FinishPremarketReq = OldTxFields & {
  tx_type: "finish_premarket";
};

export type ExtendPremarketReq = OldTxFields & {
  tx_type: "extend_premarket";
};

export type UpdateUriReq = OldTxFields & {
  tx_type: "update_uri";
};

export type ClaimTokensReq = OldTxFields & {
  tx_type: "claim_tokens";
};

export type RefundPremarketReq = OldTxFields & {
  tx_type: "refund_premarket";
};

export type WithdrawVestingReq = CommonTxFields & {
  tx_type: "withdraw_vesting";
};


export type TxToSignRequest =
  | CreatePremarketReq
  | JoinPremarketReq
  | OutOfPremarketReq
  | FinishPremarketReq
  | ExtendPremarketReq
  | UpdateUriReq
  | ClaimTokensReq
  | RefundPremarketReq
  | WithdrawVestingReq;


export interface SignTxResponse {
  signature: string;
  status: "Confirmed" | "Finalized" | "Failed" | "Pending" | string; // у тебя TransactionStatus enum, сейчас отдаёшь Confirmed
}

export async function signTransactionWithRevelcyAuth(req: TxToSignRequest) {
  const data = await http.post<SignTxResponse>(
    `${API_HOST}/premarket/tx/sign_and_send_transaction`,
    { json: req, retry: RETRY_TX_SEND }
  );
  return data;
}


export interface CreatePremarketArgs {
  name: string;
  symbol: string;
  uri: string;
  deadline: number;               // unix sec
  goal_sol_lamp: BN;
  max_sol_lamp: BN;
  creator_allocate_lamp: BN;
}

export async function getCreatePremarketTransaction(
  argsPremarket: CreatePremarketArgs,
  userPubkeyBase58: string,
  network: Network
): Promise<CreatePremarketTxResponse> {
  const payload: CreatePremarketTxRequest = {
    network,
    user_pubkey: userPubkeyBase58,
    name: argsPremarket.name,
    symbol: argsPremarket.symbol,
    uri: argsPremarket.uri,
    deadline: argsPremarket.deadline,
    goal_sol_lamp: toDecString(argsPremarket.goal_sol_lamp),
    max_sol_lamp: toDecString(argsPremarket.max_sol_lamp),
    creator_allocate_lamp: toDecString(argsPremarket.creator_allocate_lamp),
  };
  console.log("payload", payload);

  ensureDec("goal_sol_lamp", payload.goal_sol_lamp);
  ensureDec("max_sol_lamp", payload.max_sol_lamp);
  ensureDec("creator_allocate_lamp", payload.creator_allocate_lamp);
  try {
    const data = await http.post<CreatePremarketTxResponse>(
      `${API_HOST}/premarket/tx/create`,
      { json: payload, retry: RETRY_TX_GEN }
    );
    return data;
  } catch (e: any) {
    console.log("failed with", payload);
    throw new Error(`Failed to get create_premarket tx: ${e.message ?? "Unknown error"}`);
  }
}

/* ===== Join / Out ===== */

export interface TxOnlyResponse {
  transaction: string; // base64(Transaction)
}

export interface JoinPremarketTxRequest {
  network: Network;
  user_pubkey: string;        // base58
  premarket_account: string;  // base58
  amount_sol_lamp: string;    // u64 as string
}

export async function getJoinPremarketTransaction(
  premarketAccountBase58: string,
  amountSolLamp: BN,
  userPubkeyBase58: string,
  network: Network
): Promise<TxOnlyResponse> {
  const payload: JoinPremarketTxRequest = {
    network,
    user_pubkey: userPubkeyBase58,
    premarket_account: premarketAccountBase58,
    amount_sol_lamp: toDecString(amountSolLamp),
  };
  try {
    const data = await http.post<TxOnlyResponse>(
      `${API_HOST}/premarket/tx/join`,
      { json: payload, retry: RETRY_TX_GEN }
    );
    return data;
  } catch (e: any) {
    throw new Error(`Failed to get join tx: ${e?.message ?? "Unknown error"}`);
  }
}

export interface OutPremarketTxRequest {
  network: Network;
  user_pubkey: string;        // base58
  premarket_account: string;  // base58
}

export async function getOutPremarketTransaction(
  premarketAccountBase58: string,
  userPubkeyBase58: string,
  network: Network
): Promise<TxOnlyResponse> {
  const payload: OutPremarketTxRequest = {
    network,
    user_pubkey: userPubkeyBase58,
    premarket_account: premarketAccountBase58,
  };
  try {
    const data = await http.post<TxOnlyResponse>(
      `${API_HOST}/premarket/tx/out`,
      { json: payload, retry: RETRY_TX_GEN }
    );
    return data;
  } catch (e: any) {
    throw new Error(`Failed to get out tx: ${e?.message ?? "Unknown error"}`);
  }
}

export interface FinishPremarketTxRequest {
  network: "devnet" | "mainnet-beta";
  user_pubkey: string;
  premarket_account: string;
}

export async function getFinishPremarketTransaction(
  userPubkeyBase58: string,
  premarketAccountBase58: string,
  network: "devnet" | "mainnet-beta"
): Promise<TxOnlyResponse> {
  const payload = { network, user_pubkey: userPubkeyBase58, premarket_account: premarketAccountBase58 };
  try {
    const data = await http.post<TxOnlyResponse>(
      `${API_HOST}/premarket/tx/finish`,
      { json: payload, retry: RETRY_TX_GEN }
    );
    return data;
  } catch (e: any) {
    throw new Error(`Failed to get finish tx: ${e?.message ?? "Unknown error"}`);
  }
}

export async function getRefundPremarketTransaction(
  userPubkeyBase58: string,
  premarketAccountBase58: string,
  network: "devnet" | "mainnet-beta"
): Promise<TxOnlyResponse> {
  const payload = { network, user_pubkey: userPubkeyBase58, premarket_account: premarketAccountBase58 };
  try {
    const data = await http.post<TxOnlyResponse>(
      `${API_HOST}/premarket/tx/kill`,
      { json: payload, retry: RETRY_TX_GEN }
    );
    return data;
  } catch (e: any) {
    throw new Error(`Failed to get kill tx: ${e?.message ?? "Unknown error"}`);
  }
}

export interface ExtendPremarketTxRequest {
  network: "devnet" | "mainnet-beta";
  user_pubkey: string;
  premarket_account: string;
  new_deadline: number; // unix sec
}

export interface UpdateURIPremarketTxRequest {
  network: "devnet" | "mainnet-beta";
  user_pubkey: string;
  premarket_account: string;
  new_uri: string;
}

export async function getExtendPremarketTransaction(
  userPubkeyBase58: string,
  premarketAccountBase58: string,
  network: "devnet" | "mainnet-beta",
  newDeadline: number
): Promise<TxOnlyResponse> {
  const payload: ExtendPremarketTxRequest = {
    network,
    user_pubkey: userPubkeyBase58,
    premarket_account: premarketAccountBase58,
    new_deadline: newDeadline,
  };
  try {
    const data = await http.post<TxOnlyResponse>(
      `${API_HOST}/premarket/tx/extend_premarket`,
      { json: payload, retry: RETRY_TX_GEN }
    );
    return data;
  } catch (e: any) {
    throw new Error(`Failed to get extend premarket tx: ${e?.message ?? "Unknown error"}`);
  }
}


export async function getUpdateURIPremarketTransaction(
  userPubkeyBase58: string,
  premarketAccountBase58: string,
  network: "devnet" | "mainnet-beta",
  newUri: string
): Promise<TxOnlyResponse> {
  const payload: UpdateURIPremarketTxRequest = {
    network,
    user_pubkey: userPubkeyBase58,
    premarket_account: premarketAccountBase58,
    new_uri: newUri,
  };
  try {
    const data = await http.post<TxOnlyResponse>(
      `${API_HOST}/premarket/tx/update_uri`,
      { json: payload, retry: RETRY_TX_GEN }
    );
    return data;
  } catch (e: any) {
    throw new Error(`Failed to get updateURI premarket tx: ${e?.message ?? "Unknown error"}`);
  }
}

export interface ClaimTokensTxRequest {
  network: Network;
  user_pubkey: string;       // base58
  premarket_account: string; // base58
  token_mint: string;        // base58
}

export async function getClaimTokensTransaction(
  userPubkeyBase58: string,
  premarketAccountBase58: string,
  tokenMint: string,
  network: Network
): Promise<TxOnlyResponse> {
  const payload: ClaimTokensTxRequest = {
    network,
    user_pubkey: userPubkeyBase58,
    premarket_account: premarketAccountBase58,
    token_mint: tokenMint,
  };
  try {
    const data = await http.post<TxOnlyResponse>(
      `${API_HOST}/premarket/tx/claim_tokens`,
      { json: payload, retry: RETRY_TX_GEN }
    );
    return data;
  } catch (e: any) {
    throw new Error(`Failed to get claim tokens tx: ${e?.message ?? "Unknown error"}`);
  }
}

