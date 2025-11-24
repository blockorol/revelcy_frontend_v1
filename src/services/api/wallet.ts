import { API_HOST } from "env";
import { http } from "@api/http";

const RETRY_DEFAULT = 6;

export interface WalletInfoResponseDto {
  creation_time: string;
  balance: number;
  tx_amount: string;
}

export async function getWalletInfo(pubkey: string): Promise<WalletInfoResponseDto> {
  const url = `${API_HOST}/auth/wallet_info/${pubkey}`;
  
  try {
    const data = await http.get<WalletInfoResponseDto>(url, { retry: RETRY_DEFAULT });
    console.log("wallet_info:", data);
    return data;
  } catch (e: any) {
    console.log("failed to get wallet info for pubkey:", pubkey);
    throw new Error(`Failed to get wallet information: ${e.message ?? "Unknown error"}`);
  }
}
