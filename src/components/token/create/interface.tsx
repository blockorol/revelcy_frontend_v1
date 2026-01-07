export interface TokenCreateFullData {
    mainData: TokenMainData;
    customData: CustomizeTokenData; // Community data
    tokenomicsData: TokenomicsData;
    premarket: PremarketSettingData;

}
export interface TokenMainData {
    tokenName: string;
    tokenTicker: string;
    description: string;
    avatar: string;
    links: {
        telegram?: string;
        twitter?: string;
        website?: string;
    }
}

export interface TokenomicsData {
    creatorInitialBuy: number;
    teamAllocationPercent?: number;
    treasuryAllocationPercent?: number;
};

 // Community data
export type CustomizeTokenData = {
  description?:string;
  links?: Link[]
  banner?: {
    data?: string;
    url?: string
  }
};
export type Link ={
    text: string;
    url: string;
    type: 'x'|'tg'|'other';
}

export type PremarketSettingData = {
    deadline_sec: number,
    goal_sol: number,
    short_link_name?: string,
}
