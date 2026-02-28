import { createConcept } from "@api/tx_premarket";
import { uploadTokenMetadataToIPFS } from "@services/files/ipfs/pumpfun";
import { createPremarket as createPremarketInBlockchain} from "@services/blockchain/premarket/createPremarket";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import BN from "bn.js";
import { addCommunityInfo, AddCommunityInfoParams } from "@services/premarket/addCommunityInfo";
import { addWhitelistUserList, updateTokenAvailbility, updateVestingInfo } from "@api/token";
import { NoticeOptions } from "@providers/NotificationContext";
import { VestingData } from "@components/token/create/VestingSetupForm";
import { WhitelistData } from "@components/token/create/interface";

const SECONDS_IN_HOUR = 60 * 60;

export interface CreatePremarketArgs {
  avatar: string;
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
type ErrorNotifier = (message: string, options?: Omit<NoticeOptions, "type"> | undefined)=>void 


export async function createPremarket(
  network: "devnet" | "mainnet-beta",
  wallet: AnchorWallet,
  connection: Connection,
  args: CreatePremarketArgs,
  communityInfo: AddCommunityInfoParams,
  vestingData: VestingData | undefined,
  whitelistData: WhitelistData | undefined,
  visabilityInfo: {
    isHided: boolean;
    tokenShortUrlName?: string;
  },
  onChangeState?: (state: string) => void,
  notifyError?: ErrorNotifier,
) {
      onChangeState?.("Creating concept...");
      const conceptResp = await createConcept(args, wallet.publicKey.toBase58(), network)

      onChangeState?.("Adding rest info...");
      const effectiveWhitelist: WhitelistData = whitelistData ?? {
        state: "disabled",
        items: [],
      };

      await Promise.all([
        addCommunityInfo(conceptResp.premarket_account_pda, communityInfo, notifyError),
        updateTokenAvailbility(conceptResp.premarket_account_pda, {
            isHided: visabilityInfo.isHided,
            isWhitelistEnabled: effectiveWhitelist.state === "enabled",
            tokenShortUrlName: visabilityInfo.tokenShortUrlName,
        }),
        vestingData?updateVestingInfo(
          conceptResp.premarket_account_pda, wallet.publicKey.toBase58(),
          {
            unlock_at_launch_percent: vestingData.unlockAtLaunchPercent,
            vesting_period_sec: vestingData.vestingPeriodSec,
            enabled: vestingData.enabled
        }):Promise.resolve(),
        effectiveWhitelist.state === "enabled" && effectiveWhitelist.items.length > 0?
        addWhitelistUserList({
          premarket_id: String(conceptResp.premarket_id),
          user_pubkeys: effectiveWhitelist.items.map((item) => item.pubkey),
        }):Promise.resolve(),
    ]);
    console.log("[createPremarket] whitelist payload", {
      state: effectiveWhitelist.state,
      size: effectiveWhitelist.items.length,
    });
      
      onChangeState?.("Uploading data to IPFS...");
      const ipfsData = await uploadTokenMetadataToIPFS({
        premarketPDA: conceptResp.premarket_account_pda,
        avatar: args.avatar,
        tokenInfo: {
          name: args.name,
          symbol: args.symbol,
          description: args.description,
          links: {
            telegram: args.links.telegram,
            twitter: args.links.twitter,
            website: args.links.website,
          },
        },
      });
      if (!ipfsData) {
        throw Error("failed to upload data to IPFS");
      }
    
      onChangeState?.("Creating transaction...");
    
      const nowSec = Math.floor(Date.now() / 1000);
      if (args.deadline < nowSec + SECONDS_IN_HOUR - 1) {
        throw new Error(
          `deadline should be more than 1 h after current. now: ${nowSec}, deadline: ${args.deadline}`
        );
      }
      return createPremarketInBlockchain(network, wallet, connection, {
        premarketAccountPda: conceptResp.premarket_account_pda,
        avatarUrl: ipfsData.avatarUri, 
        metadataUri: ipfsData.metadataUri,
        creatorAllocateLamp: args.creator_allocate_lamp,
      }, onChangeState)
}
