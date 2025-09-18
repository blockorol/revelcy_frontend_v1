import BN from "bn.js";

export interface TokenCreateFullData {
    mainData: TokenMainData;
    customData: CustomizeTokenData;
    tokenomicsData: TokenomicsData

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
    deadline: number,
    goal_percent: number,
    goal_sol_lamp: BN
}
