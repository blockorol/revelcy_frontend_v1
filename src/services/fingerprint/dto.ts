export type UserInfoEventType =
  | "register"
  | "login"
  | "logout"
  | "daily_active"
  | "create_premarket"
  | "join_premarket"
  | "out_of_premarket"
  | "claim_token"
  | "finish_premarket"
  | "other";

export interface ClientContextDTO {
  user_id?:string;
  user_agent?: string;
  language?: string;
  languages?: string[];
  timezone?: string;
  locale?: string;
  screen_width?: number;
  screen_height?: number;
  pixel_ratio?: number;

  install_id?: string;
  install_id_source?: string;

  phantom_version?: string;
  wallet_provider?: string; // "phantom"
  wallet_chain?: string;    // "solana"
}

export interface UserSetInfoRequestDTO {
  event_type: UserInfoEventType;
  client_timestamp_ms?: number;
  premarket?: string;
  client: ClientContextDTO;
}

