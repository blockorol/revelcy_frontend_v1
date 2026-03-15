import { API_HOST } from "env";
import { http } from "@api/http";

export const API_USER_URL = `${API_HOST}/user`;

type ShortUserInfoRaw = {
  address?: string;
  name?: string;
  url?: string | null;
};

export type ShortUserInfo = {
  name?: string;
  avatarUrl?: string | null;
  address: string;
};

export interface SearchUsersRequestDto {
  input: string;
  limit: number;
}

export interface UserDto {
  id: string;
  username?: string;
  avatar_url?: string;
  wallets: string[];
}

export interface SearchUsersResponseDto {
  items: UserDto[];
}

function parseUserWallets(item: any): string[] {
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
}

export async function getListShortUserInfo(addresses: string[]): Promise<ShortUserInfo[]> {
  if (!addresses.length) return [];

  const response = await http.post<any>(`${API_USER_URL}/short_list`, {
    json: { addresses },
    retry: 3,
  });

  const list: ShortUserInfoRaw[] = Array.isArray(response)
    ? response
    : Array.isArray(response?.items)
    ? response.items
    : Array.isArray(response?.users)
    ? response.users
    : [];

  const normalized: ShortUserInfo[] = [];

  for (const item of list) {
    const address = item.address ?? "";
    if (!address) continue;

    normalized.push({
      address,
      name: item.name ?? undefined,
      avatarUrl: item.url ?? null,
    });
  }

  return normalized;
}

export async function searchUsers(args: SearchUsersRequestDto): Promise<SearchUsersResponseDto> {
  const data = await http.post<any>(`${API_USER_URL}/search`, {
    json: {
      input: args.input,
      limit: args.limit,
    },
    retry: 3,
  });

  const rawItems: any[] = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.users)
    ? data.users
    : Array.isArray(data)
    ? data
    : [];

  return {
    items: rawItems.map((item: any) => {
      const wallets = parseUserWallets(item);

      return {
        id: String(item?.id ?? item?.user_id ?? wallets[0] ?? ""),
        username: item?.username ?? item?.name ?? undefined,
        avatar_url: item?.avatar_url ?? item?.icon_url ?? item?.url ?? undefined,
        wallets,
      };
    }),
  };
}
