import { API_HOST, NETWORK } from "env";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { PremarketState, convertTokenToDecimal } from "@utils/premarket";
import { http } from "@api/http";
import shortString from "@utils/address_shorter";
import { convertSolanaToTokenWithFee } from "@services/pumpfun/convertors";
import { DEFAULT_TOKEN_COUNT_DECIMAL } from "@services/pumpfun/adds";
import { isSolanaPublicKey } from "@utils/solana";

const RETRY_DEFAULT = 6;

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

export interface TokenAvailabilityInfo {
  isHided?: boolean;
  tokenShortUrlName?: string;
  isWhitelistEnabled?: boolean;
}

export async function updateTokenAvailbility(premarketPubkey: string, args: TokenAvailabilityInfo) {
  const payload = {
    premarket_pubkey: premarketPubkey,
    network: NETWORK, // todo: remove me
    is_hided: args.isHided,
    is_whitelist_enabled: args.isWhitelistEnabled,
    token_short_url_name: args.tokenShortUrlName, // todo: move to separated value
  };

  try {
    await http.post(`${API_HOST}/premarket/update_availability`, { json: payload, retry: RETRY_DEFAULT });
    return;
  } catch (e: any) {
    console.log("failed with", payload);
    throw new Error(`Failed to update availability: ${e.message ?? "Unknown error"}`);
  }
}


export async function getPremarketInfo({
  tokenPubkeyOrShortUrl,
}: {
  tokenPubkeyOrShortUrl: string;
}): Promise<TokenInfo> {
  const params = new URLSearchParams({
    network: NETWORK,
  });

  if (isSolanaPublicKey(tokenPubkeyOrShortUrl)) {
    params.set("premarket_id", tokenPubkeyOrShortUrl);
  } else {    
    params.set("premarket_name", tokenPubkeyOrShortUrl);
  }
  const url = `${API_HOST}/premarket/get_main_info?${params.toString()}`;
  const data = await http.get<any>(url, { retry: RETRY_DEFAULT });

  console.log("[API] [MAIN_INFO] Premarket main info raw data:", data);

  const vestingInfo: VestingBaseSettings | undefined = data.vesting_info ? {
    unlockAtLaunchPercent: data.vesting_info.unlock_at_launch_percent,
    vestingPeriodSec: data.vesting_info.vesting_period_sec,
    enabled: data.vesting_info.enabled,
  }: undefined;

  const mainInfo: TokenMainInfo = {
    id: data.blockchain_info.id,
    premarketPubkey: new PublicKey(data.blockchain_info.premarket_address), 
    shortLinkPrefix: data.availability_info?.token_short_url_name ?? undefined, // tmp solution
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
    isExtended: (data.blockchain_info.premarket_is_extended|| undefined) ?? false,
    tokenMint: data.blockchain_info.mint_address,
    isHided: data.availability_info?.is_hided ?? false,
    isWhitelistEnabled: data.availability_info?.is_whitelist_enabled ?? false,
    vestingInfo: vestingInfo,
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
  const dynamicInfo = await fetchTokenDynamicInfo(data.blockchain_info.premarket_address);
  
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

  
  console.log("[API] [MAIN_INFO] Premarket dynamicInfo:", dynamicInfo);
  console.log("[API] [MAIN_INFO] Premarket mainInfo:", mainInfo);

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
  const url = `${API_HOST}/premarket/get_list?cursor=${cursor}&limit=${limit}&network=${NETWORK}`;
  const data = await http.get<any>(url, { retry: RETRY_DEFAULT });

  const items: TokenMainInfo[] = (data.premarkets ?? []).map((b: any) => ({
    id: b.blockchain_info.id,
    premarketPubkey: new PublicKey(b.blockchain_info.premarket_address),
    shortLinkPrefix: b.availability_info?.token_short_url_name || undefined,
    name: b.blockchain_info.name,
    description: b.blockchain_info.description,
    symbol: b.blockchain_info.symbol,
    imageURL: b.blockchain_info.image_url || undefined,
    ipfsURI: b.blockchain_info.ipfs_uri,
    links: {
      telegram: b.blockchain_info.links?.telegram || undefined,
      twitter:  b.blockchain_info.links?.twitter  || undefined,
      webSite:  b.blockchain_info.links?.web_site || undefined,
    },
    premarketGoalSolLamp: new BN(b.blockchain_info.premarket_goal_sol_lamp), 
    premarketDeadline: b.blockchain_info.premarket_deadline,
    premarketCreated:  b.blockchain_info.premarket_created,
    createdByPubkey: b.blockchain_info.creator_address,
    isHided: b.availability_info?.is_hided ?? false,
    state: typeof b.blockchain_info.state === "string" ? (b.blockchain_info.state.toLowerCase() as any) : b.blockchain_info.state,
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
  let cumulativeSolLamp = new BN(0);

  const holders: HoldersInfo[] = raw.holders
    .map((h: any): HoldersInfo => ({
      id: h.id ?? "",
      walletAddress: h.wallet_address,
      joinTimestamp: h.join_timestamp,
      iconURL: h.icon_url ?? undefined,
      amountSolLamp: new BN(h.amount_sol_lamp),
      amountTokenDec: h.amountTokenDec??new BN(0),
      username: h.username ?? shortString(h.wallet_address),
      claimed: h.claimed ?? false,
    }))
    .sort((a: { joinTimestamp: number; }, b: { joinTimestamp: number; }) => a.joinTimestamp - b.joinTimestamp);
    holders.forEach((holder: HoldersInfo) => {
        holder.amountTokenDec = convertSolanaToTokenWithFee({
          input_sol_lamp: holder.amountSolLamp,
          before_lamp: cumulativeSolLamp,
        });
        cumulativeSolLamp = cumulativeSolLamp.add(holder.amountSolLamp);
      });

    const vestingRaw = raw.vesting_info ?? null;
    const vestingEntry = vestingRaw?.entry ?? null;

    const vesting =
      vestingRaw && vestingEntry
        ? {
            starttime_ms: Number(vestingRaw.starttime_ms ?? 0),
            endtime_ms: Number(vestingRaw.endtime_ms ?? 0),
            total_amount:
              vestingEntry.total_dec != null
                ? new BN(String(vestingEntry.total_dec))
                : undefined,
            total_vested:
              vestingEntry.vested_dec != null
                ? new BN(String(vestingEntry.vested_dec))
                : undefined,
            total_claimed:
              vestingEntry.claimed_dec != null
                ? new BN(String(vestingEntry.claimed_dec))
                : undefined,
          }
        : undefined;
  
    console.log("Vesting info calculation:", {
      vestingRaw,
      vestingEntry,
      vesting,
    });


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
    holders: holders,
    vesting,
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
    shortLinkPrefix?: string;
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
    isHided: boolean;
    isWhitelistEnabled: boolean;
    tokenMint?: string;
    vestingInfo?: VestingBaseSettings
}

export interface VestingBaseSettings {
  unlockAtLaunchPercent: number;
  vestingPeriodSec: number;
  enabled: boolean;
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
  
  vesting?: {
    starttime_ms: number;
    endtime_ms: number;
    total_amount?: BN;
    total_vested?: BN;
    total_claimed?: BN;
  };
}

export interface HoldersInfo {
    id: string;
    walletAddress: string
    joinTimestamp: number;
    amountSolLamp: BN;
    amountTokenDec: BN;
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

type UserEntryDataResponse = {
  amount_sol_lamp: string | number;
  token: {
    total_dec: string;
    vested_dec: string;
    claimed_dec: string;
  };
  rank: number;
};

type UserEntryResponse = {
  entry?: UserEntryDataResponse | null;
  whitelist?: {
    status: string;
    updated_at: number;
  } | null;
  // backward compatibility with old API format
  whitelist_status?: string | null;
};

export type UserEntry = {
  amountSol: BN; 
  token: {
    totalDec: BN;   
    claimedDec: BN;
    vestedDec: BN; 
  };
  rankInPremarket: number;
};

export type UserEntryInfo = {
  entry: UserEntry | null;
  whitelistStatus?: string;
  whitelistUpdatedAt?: number;
};

export async function fetchUserEntry(premarketId: string, userId: string): Promise<UserEntryInfo> {
  const url = `${API_HOST}/premarket/get_user_entry?premarket_id=${premarketId}&holder_wallet=${userId}`;
  const resp = await http.get<UserEntryResponse>(url, { retry: RETRY_DEFAULT });
  const entry = resp?.entry;
  if (!entry) {
    return {
      entry: null,
      whitelistStatus: resp.whitelist?.status ?? resp.whitelist_status ?? undefined,
      whitelistUpdatedAt:
        resp.whitelist?.updated_at === null || resp.whitelist?.updated_at === undefined
          ? undefined
          : Number(resp.whitelist.updated_at),
    };
  }

  return {
    entry: {
      amountSol: new BN(entry.amount_sol_lamp),
      token: {
        totalDec: new BN(entry.token.total_dec),
        vestedDec: new BN(entry.token.vested_dec),
        claimedDec: new BN(entry.token.claimed_dec),
      },
      rankInPremarket: entry.rank,
    },
    whitelistStatus: resp.whitelist?.status ?? resp.whitelist_status ?? undefined,
    whitelistUpdatedAt:
      resp.whitelist?.updated_at === null || resp.whitelist?.updated_at === undefined
        ? undefined
        : Number(resp.whitelist.updated_at),
  }
}

export interface VestingInfoDTO {
  unlock_at_launch_percent: number; 
  vesting_period_sec: number; 
  enabled: boolean;
}

export async function updateVestingInfo(premarketPubkey: string, userPubkey: string, args: VestingInfoDTO) {
  const payload = {
    network: NETWORK,
    user_pubkey: userPubkey,
    premarket_pubkey: premarketPubkey,
    vesting_period_sec: args.vesting_period_sec,
    unlock_at_launch_percent: args.unlock_at_launch_percent,
    enabled: args.enabled,
  };

  try {
    await http.post(`${API_HOST}/premarket/vesting/update_info`, {
      json: payload,
      retry: RETRY_DEFAULT,
    });
    return;
  } catch (e: any) {
    console.error("[updateVestingInfo] failed", { payload, error: e });
    throw new Error(`Failed to update vesting: ${e?.message ?? "Unknown error"}`);
  }
}

export interface AddWhitelistUserListDTO {
  premarket_id: string;
  user_pubkeys: string[];
}

export async function addWhitelistUserList(args: AddWhitelistUserListDTO) {
  const payload = {
    network: NETWORK,
    premarket_id: args.premarket_id,
    user_pubkeys: args.user_pubkeys,
  };

  try {
    await http.post(`${API_HOST}/premarket/whitelist/add_user_list`, {
      json: payload,
      retry: RETRY_DEFAULT,
    });
    return;
  } catch (e: any) {
    console.error("[addWhitelistUserList] failed", { payload, error: e });
    throw new Error(`Failed to add whitelist users: ${e?.message ?? "Unknown error"}`);
  }
}

export interface GetWhitelistRequestDTO {
  network?: string;
  premarket_id: string;
  status?: string;
  cursor: number;
  limit: number;
}

export interface WhitelistUserDTO {
  id: string;
  username?: string;
  avatar_url?: string;
  wallets: string[];
}

export interface WhitelistUsersResultDTO {
  items: WhitelistUserDTO[];
  total?: number;
}

export async function getWhitelistUsers(args: GetWhitelistRequestDTO): Promise<WhitelistUsersResultDTO> {
  const payload = {
    network: args.network ?? NETWORK,
    premarket_id: args.premarket_id,
    status: args.status,
    cursor: args.cursor,
    limit: args.limit,
  };

  const data = await http.post<any>(`${API_HOST}/premarket/whitelist/get`, {
    json: payload,
    retry: RETRY_DEFAULT,
  });

  const rawItems: any[] = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.users)
    ? data.users
    : Array.isArray(data?.entries)
    ? data.entries
    : Array.isArray(data)
    ? data
    : [];

  const parseWallets = (item: any): string[] => {
    const walletsFromArray =
      item?.wallets ?? item?.wallet_addresses ?? item?.user_pubkeys ?? item?.addresses;

    if (Array.isArray(walletsFromArray)) {
      return walletsFromArray
        .map((wallet: any) => String(wallet))
        .filter((wallet: string) => wallet.length > 0);
    }

    const singleWallet =
      item?.wallet_address ?? item?.wallet ?? item?.user_pubkey ?? item?.pubkey ?? item?.address;

    return singleWallet ? [String(singleWallet)] : [];
  };

  return {
    items: rawItems.map((item: any) => {
      const wallets = parseWallets(item);
      return {
        id: String(item?.id ?? item?.user_id ?? wallets[0] ?? ""),
        username: item?.username ?? item?.name ?? undefined,
        avatar_url: item?.avatar_url ?? item?.icon_url ?? item?.url ?? undefined,
        wallets,
      };
    }),
    total:
      data?.total === null || data?.total === undefined
        ? data?.count === null || data?.count === undefined
          ? undefined
          : Number(data.count)
        : Number(data.total),
  };
}
