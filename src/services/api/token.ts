import { API_HOST } from "env";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { PremarketState, convertTokenToDecimal } from "@utils/premarket";
import { toDecString } from "@api/tx_premarket";
import { http } from "@api/http";
import shortString from "@utils/address_shorter";
import { convertSolanaToTokenWithFee } from "@services/pumpfun/convertors";
import { DEFAULT_TOKEN_COUNT_DECIMAL } from "@services/pumpfun/adds";

const RETRY_DEFAULT = 6;

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
    await http.post(`${API_HOST}/premarket/created`, { json: payload, retry: RETRY_DEFAULT });
    return;
  } catch (e: any) {
    console.log("failed with", payload);
    throw new Error(`Failed to add premarket to whitelist: ${e.message ?? "Unknown error"}`);
  }
}

export async function updateAboutCommunity(premarketPubkey: string, args: TokenCommunityInfo) {
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
    await http.post(`${API_HOST}/premarket/update_community`, { json: payload, retry: RETRY_DEFAULT });
    return;
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
    await http.post(
      args.isKilled ? `${API_HOST}/premarket/killed` : `${API_HOST}/premarket/finished`,
      { json: payload, retry: RETRY_DEFAULT }
    );
    return;
  } catch (e: any) {
    console.log("failed with", payload);
    throw new Error(`Failed to finish PM: ${e.message ?? "Unknown error"}`);
  }
}

export interface TokenClaimedResponse {
  claimed: boolean;
  updated_in_db: boolean;
}

export async function tokensClaimed(args: {
  network: "devnet" | "testnet" | "mainnet-beta";
  userPubkey: string;
  premarketAccount: string;
}): Promise<TokenClaimedResponse> {
  const payload = {
    network: args.network,
    user_pubkey: args.userPubkey,
    premarket_account: args.premarketAccount,
  };

  try {
    const response = await http.post<TokenClaimedResponse>(
      `${API_HOST}/premarket/token_claimed`,
      { json: payload, retry: RETRY_DEFAULT }
    );
    return response;
  } catch (e: any) {
    console.log("failed with", payload);
    throw new Error(`Failed to verify tokens claimed: ${e.message ?? "Unknown error"}`);
  }
}

export async function extendedPremarket(args: {
  premarketPubKey: string;
  userWallet: string;
  userId: string;
  tx: string;
  network: "devnet" | "mainnet-beta";
  newDeadline: number; // unix timestamp
}) {
  const payload = {
    base: {
      premarket_pub_key: args.premarketPubKey,
      user_wallet: args.userWallet,
      user_id: args.userId,
      tx: args.tx,
    },
    network: args.network,
    new_deadline: args.newDeadline,
  };
  
  try {
    await http.post(`${API_HOST}/premarket/extended_premarket`, { json: payload, retry: RETRY_DEFAULT });
    return;
  } catch (e: any) {
    console.log("failed with", payload);
    throw new Error(`Failed to extend premarket: ${e.message ?? "Unknown error"}`);
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
    await http.post(`${API_HOST}/premarket/user_joined`, { json: payload, retry: RETRY_DEFAULT });
    return;
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
    await http.post(`${API_HOST}/premarket/user_out`, { json: payload, retry: RETRY_DEFAULT });
    return;
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

  const data = await http.get<any>(url, { retry: RETRY_DEFAULT });
  console.log("premarket_info:", data);

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
    premarketGoalSolLamp: new BN(data.blockchain_info.premarket_goal_sol_lamp),
    premarketDeadline: data.blockchain_info.premarket_deadline,
    premarketCreated: data.blockchain_info.premarket_created,
    createdByPubkey: data.blockchain_info.creator_address,
    state: data.blockchain_info.state,
    finishDate: data.blockchain_info.premarket_finished || undefined,
    isExtended: false,
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
  const dynamicInfo = await fetchTokenDynamicInfo(tokenPubKey);
  
  // Determine the effective state based on conditions
  const convertState = () => {
    const now = Math.floor(Date.now() / 1000);
    const isPremarket = mainInfo.state === 'premarket';
    const isDeadlinePassed = mainInfo.premarketDeadline < now;
    const isGoalNotReached = dynamicInfo.reservedSolLamp.lt(mainInfo.premarketGoalSolLamp);
    
    // If it's premarket and deadline passed and goal reached, show "times_up"
    if (isPremarket && isDeadlinePassed && !isGoalNotReached) {
      return 'times_up';
    }
    if (isPremarket && isDeadlinePassed && isGoalNotReached) {
      return 'expired';
    }
    
    return mainInfo.state;
  };
  mainInfo.state = convertState();

  
  console.log("Premarket dynamicInfo:", dynamicInfo);

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
  const data = await http.get<any>(url, { retry: RETRY_DEFAULT });

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
  const url = `${API_HOST}/premarket/get_dynamic_info?premarket_id=${premarketId}`;
  const raw = await http.get<any>(url, { retry: RETRY_DEFAULT });
  console.log("raw resp:", raw);

  // Debug current price values
  const currentPriceValue = raw.current_price_lamp ?? raw.current_price ?? raw.currentPriceLamp ?? raw.currentPrice ?? 0;
  console.log("currentPriceValue from API", {
    currentPriceValue:currentPriceValue, 
    current_price_lamp: raw.current_price_lamp,
    current_price: raw.current_price, 
    currentPriceLamp: raw.currentPriceLamp,
    currentPrice: raw.currentPrice
  })
  
  const reservedSolLamp = new BN(raw.reserved_sol_lamp);
  const tokenMarketCapFromCurve = convertSolanaToTokenWithFee({
    input_sol_lamp: reservedSolLamp,
  });
  
  console.log("tokenMarketCapFromCurve:", {
    reservedSolLamp: reservedSolLamp.toString(),
    tokenMarketCapFromCurve: tokenMarketCapFromCurve.toString(),
  });
  
  const reservedToken = DEFAULT_TOKEN_COUNT_DECIMAL.sub(tokenMarketCapFromCurve);

  return {
    holdersCount: raw.holders_count,
    currentPriceLamp: Number(
      raw.current_price_lamp ?? raw.current_price ?? raw.currentPriceLamp ?? raw.currentPrice ?? 0
    ),
    marketCapTokenDec: (() => {
      const priceInSolPerToken = Number(currentPriceValue) || 0;
      const marketCapInSol = priceInSolPerToken * 1_000_000_000; // 1e9 tokens supply
      const marketCapValueDec = convertTokenToDecimal(marketCapInSol);
      console.log("marketCapTokenDec calculation:",{
        priceInSolPerToken: priceInSolPerToken,
        marketCapInSol: marketCapInSol,
        marketCapValueDec: marketCapValueDec.toString()
      });
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
      username: h.username??shortString(h.wallet_address),
      claimed: h.claimed ?? false
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
    premarketGoalSolLamp: BN;
    premarketDeadline: number;
    premarketCreated: number;
    createdByPubkey: string;
    state: PremarketState;
    finishDate?: number;
    isExtended: boolean;
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
    username: string;
    claimed?: boolean;
}

export interface HolderEntryPriceDTO {
    entry_price_lamp: string | number;
}

export async function getHolderEntryPrice({
    premarketId,
    holderWallet,
}: {
    premarketId: string;
    holderWallet: string;
}): Promise<HolderEntryPriceDTO> {
    const url = `${API_HOST}/premarket/get_holder_entry_price?premarket_id=${premarketId}&holder_wallet=${holderWallet}`;
    const data = await http.get<HolderEntryPriceDTO>(url, { retry: RETRY_DEFAULT });
    return data;
}

