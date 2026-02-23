// @api/tx_premarket.ts
import { API_HOST } from "env";
import { BN } from "@coral-xyz/anchor";
import { http } from "@api/http";
import { ensureDec, toDecString } from "@utils/numbers";
import { UUID } from "crypto";

export type Network = "devnet" | "mainnet-beta";

const RETRY_TX_GEN = 3;

/* ===== Create Premarket ===== */

export interface CreatePremarketTxResponse {
  transaction: string;            // base64(Transaction)
  premarket_account_pda: string;  // base58
  mint_address: string;
}

export interface CreatePremarketTxRequest {
  network: Network;
  user_pubkey: string;            // base58
  premarket_pubkey: string;
  uri: string;
  image_url: string;
  creator_allocate_lamp: string;  // u64 as string
}

export interface SignTxResponse {
  signature: string;
  status: 'pending' | 'confirmed' | 'finalized' |'failed';
}

type TX_TYPE = 
    "create_premarket" | 
    "join_premarket" | 
    "out_of_premarket" | 
    "finish_premarket" | 
    "extend_premarket" | 
    "update_uri" |
    "claim_tokens" | 
    "withdraw_vesting" |
    "refund_premarket"

export async function signTransactionWithRevelcyAuth(params: {
  network: "devnet" | "mainnet-beta";
  txBase64: string;
  txType: TX_TYPE;
  premarket?: string;
}) {
  const payload: any = {
    network: params.network,
    unsigned_tx: params.txBase64,
    tx_type: params.txType,
  };

  if (
    params.txType === "finish_premarket" ||
    params.txType === "extend_premarket" ||
    params.txType === "update_uri"       ||
    params.txType === "refund_premarket" ||
    params.txType === "claim_tokens"
  ) {
    payload.premarket = params.premarket;
  }

  const data = await http.post<SignTxResponse>(
    `${API_HOST}/premarket/tx/sign_and_send_transaction`,
    {
      json: payload,
      retry: RETRY_TX_GEN,
    }
  );

  return data as {
    signature: string;
    status: string;
  };
}

export interface CreatePremarketConcept_TokenLinks_Request {
  telegram?: string;
  twitter?: string;
  web_site?: string;
}

interface CreatePremarketConcept_TokenInfo_Request {
  name: string
  description: string
  symbol: string
  uri: string
  image_url: string
  links: CreatePremarketConcept_TokenLinks_Request;
  deadline: Number;
  goal_sol_lamp: string;
  max_sol_lamp: string;
  creator_allocate_lamp: string;
}

interface CreatePremarketConcept_Request {
  network: Network;
  user_pubkey: string;
  token_info: CreatePremarketConcept_TokenInfo_Request;
}
export interface CreatePremaketConceptArgs {
  name: string;
  symbol: string;
  description: string;
  links: {
    twitter?: string;
    telegram?: string;
    website?: string;
  }
  deadline: number;
  goal_sol_lamp: BN;
  max_sol_lamp: BN;
  creator_allocate_lamp: BN;
}
export interface CreatePremarketConcept_Response {
  premarket_account_pda: string
  premarket_id: UUID
}
export async function createConcept(
  params:CreatePremaketConceptArgs,
  userPubkeyBase58: string,
  network: Network
) {
  const tokenInfo: CreatePremarketConcept_TokenInfo_Request =  {
    name: params.name, 
    description: params.description, 
    symbol: params.symbol,
    uri: "", // will be uploaded late (when IPFS info will be created)
    image_url: "", // will be uploaded late (when IPFS info will be created)
    links: {
      telegram: params.links.telegram,
      twitter: params.links.twitter,
      web_site: params.links.website,
    },
    deadline: params.deadline,
    goal_sol_lamp: toDecString(params.goal_sol_lamp),
    max_sol_lamp: toDecString(params.max_sol_lamp),
    creator_allocate_lamp: toDecString(params.creator_allocate_lamp),

  }
  const payload: CreatePremarketConcept_Request = {
    network: network, 
    user_pubkey: userPubkeyBase58,
    token_info: tokenInfo
  }
  try {
    const data = await http.post<CreatePremarketConcept_Response>(
      `${API_HOST}/premarket/concept/create`,
      { json: payload, retry: RETRY_TX_GEN }
    );
    return data;
  } catch (e: any) {
    console.log("failed with", payload);
    throw new Error(`Failed to get create_premarket tx: ${e.message ?? "Unknown error"}`);
  }
}


export interface CreatePremarketArgs {
  premarket_pubkey: string;
  uri: string;
  image_url: string;
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
    premarket_pubkey: argsPremarket.premarket_pubkey,
    uri: argsPremarket.uri,
    image_url: argsPremarket.image_url,
    creator_allocate_lamp: toDecString(argsPremarket.creator_allocate_lamp),
  };
  console.log("payload", payload);

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


export interface WithdrawVestingTxRequest {
  network: Network;
  user_pubkey: string;       // base58
  token_mint: string;        // base58
}

export async function getWithdrawVestingTransaction(
  userPubkeyBase58: string,
  tokenMint: string,
  network: Network
): Promise<TxOnlyResponse> {
  const payload: WithdrawVestingTxRequest = {
    network,
    user_pubkey: userPubkeyBase58,
    token_mint: tokenMint,
  };
  try {
    const data = await http.post<TxOnlyResponse>(
      `${API_HOST}/premarket/tx/withdraw_vesting`,
      { json: payload, retry: RETRY_TX_GEN }
    );
    return data;
  } catch (e: any) {
    throw new Error(`Failed to get withdraw vesting tx: ${e?.message ?? "Unknown error"}`);
  }
}

