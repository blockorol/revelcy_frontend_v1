import { API_HOST } from "env";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { convertSolanaToTokenBuy, DEFAULT_TOKEN_COUNT_DECIMAL, PremarketState, convertTokenToDecimal } from "@utils/premarket";
import axios from 'axios';
import { toDecString } from "@api/tx_premarket";
import { http } from "@api/http";

export interface premerketTransactionArgs {
  premarketPubKey: string;
  userWallet: string;
  userId?: string;
  tx: string;
}


export interface premarketCreatedArgs extends premerketTransactionArgs {
  mainInfo: TokenMainInfo,
  communityInfo: TokenCommunityInfo,
}

export interface userJoinedToPremarketArgs extends premerketTransactionArgs {
  joinAmountInSolLamport: BN
}

export async function premarketCreated(args: premarketCreatedArgs) {
  console.log("send to BE: premarket Created", args);

  const payload = {
    blockchain_info: {
      name: args.mainInfo.name,
      description: args.mainInfo.description,
      symbol: args.mainInfo.symbol,
      image_url: args.mainInfo.imageURL,
      ipfs_uri: args.mainInfo.ipfsURI,
      creator_id: args.userId,
      creator_address: args.userWallet,
      premarket_address: args.premarketPubKey,
      links: {
        telegram: args.mainInfo.links.telegram,
        twitter: args.mainInfo.links.twitter,
        web_site: args.mainInfo.links.webSite,
      },
      premarket_goal_pers: args.mainInfo.premarketGoalPers,
      premarket_goal_sol_lamp: toDecString(args.mainInfo.premarketGoalSolLamp),
      premarket_deadline: args.mainInfo.premarketDeadline,
      premarket_created: args.mainInfo.premarketCreated,
      mint_address: args.mainInfo.tokenMint,
      state: args.mainInfo.state, 
    },
    community_info: {
      description: args.communityInfo.description,
      token_banner_url: args.communityInfo.tokenBannerURL,
      links: args.communityInfo.links?.map((link) => ({
        text: link.text,
        url: link.url,
        type: link.type,
      })),
    },
  };

  try {
    await http.post(`${API_HOST}/premarket/created`, { json: payload });
    return
  } catch (e: any) {
    console.log("failed with", payload);
    throw new Error(`Failed to add premarket to whitelist: ${e.message ?? "Unknown error"}`);
  }
}


export async function updateAboutCommunity(premarketPubkey: string, args: TokenCommunityInfo) {
  console.log("send to BE: updateAboutCommunity", args);

  const payload = {
    premarket_pubkey: premarketPubkey,
    community_info: {
      description: args.description,
      token_banner_url: args.tokenBannerURL,
      links: args.links?.map((link) => ({
        text: link.text,
        url: link.url,
        type: link.type,
      })),
    },
  };

  try {
    await http.post(`${API_HOST}/premarket/update_community`, { json: payload });
    return
  } catch (e: any) {
    console.log("failed with", payload);
    throw new Error(`Failed to update community: ${e.message ?? "Unknown error"}`);
  }
}

export async function premarketFinished(args: {
  premarketPubKey: string;
  userWallet: string;
  userId?: string | null;
  tx: string;
  isKilled: boolean;
  network: "devnet" | "testnet"| "mainnet-beta";
}) {
  const payload = {
    base: {
      premarket_pub_key: args.premarketPubKey,
      user_wallet: args.userWallet,
      user_id: args.userId ?? null,
      tx: args.tx,
    },
    network: args.network
  };
  
  try {
    await http.post(args.isKilled ?
    `${API_HOST}/premarket/killed`:`${API_HOST}/premarket/finished`, { json: payload });
    return
  } catch (e: any) {
    console.log("failed with", payload);
    throw new Error(`Failed to finish PM: ${e.message ?? "Unknown error"}`);
  }
}

export async function userJoinedToPremarket(args: userJoinedToPremarketArgs) {

  const payload = {
    premarket_pub_key: args.premarketPubKey,
    user_wallet: args.userWallet,
    user_id: args.userId ?? null,
    tx: args.tx,
    join_amount_in_sol_lamport: toDecString(args.joinAmountInSolLamport),
  };

  try {
    await http.post(`${API_HOST}/premarket/user_joined`, { json: payload });
    return
  } catch (e: any) {
    console.log("failed with", payload);
    throw new Error(`Failed to add user to PM: ${e.message ?? "Unknown error"}`);
  }
}

export async function userOutOfPremarket(args: premerketTransactionArgs) {
  console.log("send to BE: user out of premarket", args);

  const payload = {
    premarket_pub_key: args.premarketPubKey,
    user_wallet: args.userWallet,
    user_id: args.userId ?? null,
    tx: args.tx,
  };

  
  try {
    await http.post(`${API_HOST}/premarket/user_out`, { json: payload });
    return
  } catch (e: any) {
    console.log("failed with", payload);
    throw new Error(`Failed to add user out: ${e.message ?? "Unknown error"}`);
  }
}

export async function getPremarketInfo({
  tokenPubKey,
}: {
  tokenPubKey: string;
}): Promise<TokenInfo> {
  const url = `${API_HOST}/premarket/get_main_info?premarket_id=${tokenPubKey}`;

  const response = await axios.get(url);
  const data = response.data;
  console.log("premarket_info:", data)

  const mainInfo: TokenMainInfo = {
    id: data.blockchain_info.id,
    premarketPubkey: new PublicKey(tokenPubKey), 
    name: data.blockchain_info.name,
    description: data.blockchain_info.description,
    symbol: data.blockchain_info.symbol,
    imageURL: data.blockchain_info.image_url || undefined,
    ipfsURI: data.blockchain_info.ipfs_uri,
    links: {
      telegram: data.blockchain_info.links.telegram || undefined,
      twitter: data.blockchain_info.links.twitter || undefined,
      webSite: data.blockchain_info.links.web_site || undefined,
    },
    premarketGoalPers: data.blockchain_info.premarket_goal_pers,
    premarketGoalSolLamp: new BN(data.blockchain_info.premarket_goal_sol_lamp),
    premarketDeadline: data.blockchain_info.premarket_deadline,
    premarketCreated: data.blockchain_info.premarket_created,
    createdByPubkey: data.blockchain_info.creator_address,
    state: data.blockchain_info.state,
    finishDate: data.blockchain_info.premarket_finished || undefined,
    tokenMint: data.blockchain_info.mint_address,
  };

  const communityInfo: TokenCommunityInfo = {
    description: data.community_info.description,
    tokenBannerURL: data.community_info.token_banner_url || undefined,
    links: data.community_info.links?.map((link: any) => ({
      text: link.text,
      url: link.url,
      type: link.type,
    })) || [],
  };
  const dynamicInfo = await fetchTokenDynamicInfo(tokenPubKey)
  
  console.log("Premarket dynamicInfo:", dynamicInfo)

  return {
    mainInfo,
    communityInfo,
    dynamicInfo,
  };
}

export async function getPremarketList({
  cursor,
  limit,
}: {
  cursor: number; // offset
  limit: number;  // page size
}): Promise<{ items: TokenMainInfo[]; total: number }> {
  const url = `${API_HOST}/premarket/get_list?cursor=${cursor}&limit=${limit}`;
  const response = await axios.get(url);
  const data = response.data;

  const items: TokenMainInfo[] = (data.premarkets ?? []).map((b: any) => ({
    id: b.id,
    premarketPubkey: new PublicKey(b.premarket_address),
    name: b.name,
    description: b.description,
    symbol: b.symbol,
    imageURL: b.image_url || undefined,
    ipfsURI: b.ipfs_uri,
    links: {
      telegram: b.links?.telegram || undefined,
      twitter:  b.links?.twitter  || undefined,
      webSite:  b.links?.web_site || undefined,
    },
    premarketGoalPers: b.premarket_goal_pers,
    premarketGoalSolLamp: new BN(b.premarket_goal_sol_lamp), 
    premarketDeadline: b.premarket_deadline,
    premarketCreated:  b.premarket_created,
    createdByPubkey: b.creator_address,
    state: typeof b.state === "string" ? (b.state.toLowerCase() as any) : b.state,
  }));

  const total = Number(data.total ?? items.length);

  return { items, total };
}


export async function fetchTokenDynamicInfo(premarketId: string): Promise<TokenDynamicInfo> {
  const rawCall = async () => {
    const res = await fetch(`${API_HOST}/premarket/get_dynamic_info?premarket_id=${premarketId}`);
    return await res.json();
  }
  
  const raw = await rawCall();
  console.log("raw resp:", raw)
  
  // Debug current price values
  const currentPriceValue = raw.current_price_lamp ?? raw.current_price ?? raw.currentPriceLamp ?? raw.currentPrice ?? 0;
  console.log("currentPriceValue from API:", currentPriceValue);
  console.log("current_price_lamp:", raw.current_price_lamp);
  console.log("current_price:", raw.current_price);
  console.log("currentPriceLamp:", raw.currentPriceLamp);
  console.log("currentPrice:", raw.currentPrice);
  
  const reservedSolLamp = new BN(raw.reserved_sol_lamp);
  console.log("reservedSolLamp:", reservedSolLamp)
  const tokenMarketCapFromCurve = convertSolanaToTokenBuy({
    sol_amount: reservedSolLamp,
    reserves_sol: new BN(0),
    reserves_token: DEFAULT_TOKEN_COUNT_DECIMAL
  });
  
  console.log("tokenMarketCapFromCurve:", tokenMarketCapFromCurve)
  
  const reservedToken = DEFAULT_TOKEN_COUNT_DECIMAL.sub(tokenMarketCapFromCurve)

  return {
    holdersCount: raw.holders_count,
    currentPriceLamp: Number(
      raw.current_price_lamp ?? raw.current_price ?? raw.currentPriceLamp ?? raw.currentPrice ?? 0
    ),

    // marketCapTokenDec is a BN in 6-decimal units to be displayed via convertDecimalToToken
    // API returns price most likely in SOL units (e.g., "0.000018").
    // Market cap (in SOL) = price_in_SOL_per_token * total_supply_tokens (1e9)
    marketCapTokenDec: (() => {
      const priceInSolPerToken = Number(currentPriceValue) || 0;
      const marketCapInSol = priceInSolPerToken * 1_000_000_000; // 1e9 tokens supply
      // Convert numeric SOL amount to 6-decimal BN expected by convertDecimalToToken
      const marketCapValueDec = convertTokenToDecimal(marketCapInSol);
      console.log("marketCapTokenDec calculation:");
      console.log("  - priceInSolPerToken:", priceInSolPerToken);
      console.log("  - marketCapInSol:", marketCapInSol);
      console.log("  - marketCapValueDec:", marketCapValueDec.toString());
      return marketCapValueDec;
    })(),
    marketCapSolLamp: reservedSolLamp,

    reservedTokenLamp: reservedToken,
    reservedSolLamp: reservedSolLamp,

    change24h: raw.change_24h,

    holders: raw.holders.map((h: any): HoldersInfo => ({
      id: h.id ?? "",
      walletAddress: h.wallet_address,
      joinTimestamp: h.join_timestamp,
      iconURL: h.icon_url ?? undefined,
      amountSolLamp: new BN(h.amount_sol_lamp),
    })),
  };
}

export interface TokenInfo {
    mainInfo: TokenMainInfo,
    communityInfo: TokenCommunityInfo,
    dynamicInfo: TokenDynamicInfo
}

export interface TokenMainInfo {
    id: string;
    premarketPubkey: PublicKey,
    name: string;
    description: string;
    symbol: string;
    imageURL?: string;
    ipfsURI: string;
    links: TokenLinks;
    premarketGoalPers: number;
    premarketGoalSolLamp: BN;
    premarketDeadline: number;
    premarketCreated: number;
    createdByPubkey: string;      // creator pubkey
    state: PremarketState;
    finishDate?: number;
    tokenMint?: string;
}

export interface TokenLinks {
  telegram?: string;
  twitter?: string;
  webSite?: string;
}

export interface TokenCommunityInfo {
    description: string
    tokenBannerURL?: string
    links?: {
      text: string;
      url: string;
      type: 'x' | 'tg' | 'other'
    }[]
}

export interface TokenDynamicInfo {
  holdersCount: number;
  holders: HoldersInfo[]
  currentPriceLamp: number

  marketCapTokenDec: BN;
  marketCapSolLamp: BN;
  reservedTokenLamp: BN;
  reservedSolLamp: BN;
  change24h: number;
}

export interface HoldersInfo {
    id: string;
    walletAddress: string
    joinTimestamp: number;
    amountSolLamp: BN;
    iconURL?: string;
}

