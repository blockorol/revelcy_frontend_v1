// screens/TokenCreationFlow.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useTheme } from "react-native-paper";
import { useRouter } from "@hooks/useSafeRouter";
import BN from "bn.js";

import CreateTokenForm from "@components/token/create/CreateTokenForm";
import CustomizeTokenForm from "@components/token/create/CustomizeTokenForm";
import OverviewPremarketCreation from "@components/premarket/creationFlow/OverviewPremarketCreation";
import TokenCreationProcess from "@components/token/create/TokenCreationProcess";
import VestingSetupForm, { VestingData } from "@components/token/create/VestingSetupForm";
import {
  TokenMainData,
  TokenomicsData,
  CustomizeTokenData,
  TokenCreateFullData,
  PremarketSettingData,
  WhitelistData,
} from "@components/token/create/interface";
import EditTokenomicsForm from "@components/token/create/EditTokenomicsForm";
import {
  useAnchorWalletSafe,
  useWallet,
} from "@storage/wallet-adapter/useWallet.web";
import {
  createPremarket,
  CreatePremarketArgs,
  createPremarketConcept,
} from "@services/premarket/create";
import { getUserConcept } from "@api/tx_premarket";
import { getAllWhitelistUsers } from "@api/token";
import EditPremarketSettingsForm from "@components/token/create/EditPremarketSettings";
import EditWhitelistForm from "@components/token/create/EditWhitelistForm";
import { convertLamportToSmallCount, convertSmallCountToLamport } from "@utils/premarket";
import useIsMobile from "@hooks/useIsMobile";
import { useNetwork } from "@providers/NetworkContext";
import { getSolanaConnection } from "@services/blockchain/solana";
import { useNotification } from "@providers/NotificationContext";

import { usePremarketDraft, type FlowStep } from "@hooks/usePremarketDraft";
import { useOverlay } from "@storage/UniversalOverlayProvider";
import { AddCommunityInfoParams } from "@services/premarket/addCommunityInfo";
import { confirmTxFinalised } from "@services/blockchain/signAndSend";
import { IsVestingEnable } from "env";
import { TextedLoader } from "@components/ui/Loader";

enum FLOW_STEP {
  TOKEN_BASE_INFO = 1,
  TOKENOMICS = 2,
  PREMARKET_SETTINGS = 3,
  WHITELIST = 4,
  VESTING = 5,
  CUSTOMIZE_TOKEN = 6,
  OVERVIEW = 7,
  PROCESSING = 8,
}

export default function PremarketCreationFlow() {
  const notify = useNotification();
  const isMobile = useIsMobile();
  const wallet = useAnchorWalletSafe();
  const { connected, connect } = useWallet();
  const { open: openOverlay, replace: replaceOverlay, isOpen: isOverlayOpen, close: closeOverlay } = useOverlay();


  const router = useRouter();
  const { network } = useNetwork();
  const currentConnection = getSolanaConnection(network);

  const [step, setStep] = useState<FLOW_STEP>(FLOW_STEP.TOKEN_BASE_INFO);
  const [tokenMainData, setTokenMainData] = useState<TokenMainData | undefined>(
    undefined
  );
  const [tokenomicsData, setTokenomicsData] = useState<
    TokenomicsData | undefined
  >(undefined);
  const [customizeTokenData, setCustomizeTokenData] = useState<
    CustomizeTokenData | undefined
  >(undefined);
  const [premarketSettingsData, setPremarketSettingsData] = useState<
    PremarketSettingData | undefined
  >(undefined);
  const [whitelistData, setWhitelistData] = useState<WhitelistData>({
    state: "disabled",
    items: [],
  });

  const [premarketPDA, setPremarketPDA] = useState<string | undefined>(
    undefined
  );
  const [txId, setTxId] = useState<string | undefined>(undefined);
  const [vestingData, setVestingData] = useState<VestingData | undefined>(undefined);
  const [loadingConcept, setLoadingConcept] = useState(true);
  const shouldRestoreFromStorageRef = useRef(true);
  const shouldHydrateFromBackendRef = useRef(true);
  const tokenomicsDataRef = useRef<TokenomicsData | undefined>(undefined);
  const whitelistDataRef = useRef<WhitelistData>({ state: "disabled", items: [] });
  const vestingDataRef = useRef<VestingData | undefined>(undefined);
  const totalSteps = IsVestingEnable ? 6 : 5;

  const theme = useTheme();
  const [launchState, setLaunchState] = useState<string | undefined>(undefined);
  useEffect(()=> {
    if (!launchState) {
      if (isOverlayOpen){
        closeOverlay();
      }
      return
    }
    const stateDisplay = (<TextedLoader text={launchState} />)
    if (isOverlayOpen) {
        replaceOverlay(stateDisplay)
    } else {
      openOverlay(stateDisplay)
    }
  }, [launchState])

  // === Хук черновика: авто-восстановление, таймаут, patch/clear ===
  const applyRestoredData = React.useCallback((d: any) => {
    console.log("[PremarketCreationFlow] applyRestoredData", d);
    if (d.tokenMainData) setTokenMainData(d.tokenMainData);
    if (d.tokenomicsData) setTokenomicsData(d.tokenomicsData);
    if (d.premarketSettingsData) setPremarketSettingsData(d.premarketSettingsData);
    if (d.whitelistData) setWhitelistData(d.whitelistData as WhitelistData);
    if (d.customizeTokenData) setCustomizeTokenData(d.customizeTokenData);
    if (d.vestingData) setVestingData(d.vestingData);
    setStep(resolveFlowStep(d.step));
  }, []);

  const onRestore = React.useCallback((d: any) => {
    if (!shouldRestoreFromStorageRef.current) {
      console.log("[PremarketCreationFlow] onRestore:skip repeated restore");
      return;
    }
    shouldRestoreFromStorageRef.current = false;
    applyRestoredData(d);
  }, [applyRestoredData]);

  useEffect(() => {
    tokenomicsDataRef.current = tokenomicsData;
  }, [tokenomicsData]);

  useEffect(() => {
    whitelistDataRef.current = whitelistData;
  }, [whitelistData]);

  useEffect(() => {
    vestingDataRef.current = vestingData;
  }, [vestingData]);

  const normalizeStep = React.useCallback(
    (s: FlowStep): FlowStep => {
      if (!IsVestingEnable && s === FLOW_STEP.VESTING) return FLOW_STEP.CUSTOMIZE_TOKEN;
      return s === FLOW_STEP.PROCESSING ? FLOW_STEP.OVERVIEW : s;
    },
    []
  );

  const { loading, patch, clear } = usePremarketDraft<
    TokenMainData,
    TokenomicsData,
    PremarketSettingData,
    CustomizeTokenData,
    VestingData
  >({
    loadTimeoutMs: 1500,
    retry: 1,
    clearOnTimeout: false,
    normalizeStep,
    onRestore,
    initialDraft: { step: FLOW_STEP.TOKEN_BASE_INFO },
  });

  useEffect(() => {
    let cancelled = false;

    const hydrateConceptFromBackend = async () => {
      if (!shouldHydrateFromBackendRef.current) {
        console.log("[PremarketCreationFlow] hydrateConceptFromBackend:skip repeated hydrate");
        return;
      }
      console.log("[PremarketCreationFlow] hydrateConceptFromBackend:start", {
        loading,
        network,
      });
      if (loading) {
        console.log("[PremarketCreationFlow] hydrateConceptFromBackend:skip because draft is still loading");
        return;
      }

      if (network === "testnet") {
        console.log("[PremarketCreationFlow] hydrateConceptFromBackend:skip on testnet");
        if (!cancelled) setLoadingConcept(false);
        return;
      }

      try {
        const rawConcept = await getUserConcept(network);
        console.log("[PremarketCreationFlow] hydrateConceptFromBackend:rawConcept", rawConcept);
        if (cancelled) {
          console.log("[PremarketCreationFlow] hydrateConceptFromBackend:cancelled after fetch");
          return;
        }

        const mappedConcept = mapBackendConceptToDraft(rawConcept, {
          tokenomicsData: tokenomicsDataRef.current,
          whitelistData: whitelistDataRef.current,
          vestingData: vestingDataRef.current,
        });
        console.log("[PremarketCreationFlow] hydrateConceptFromBackend:mappedConcept", mappedConcept);
        if (!mappedConcept) {
          console.log("[PremarketCreationFlow] hydrateConceptFromBackend:no mapped concept, keeping local draft");
          setLoadingConcept(false);
          return;
        }

        const conceptId =
          rawConcept?.blockchain_info?.id ??
          rawConcept?.blockchainInfo?.id ??
          rawConcept?.id;

        if (mappedConcept.whitelistData.state === "enabled" && conceptId) {
          console.log("[PremarketCreationFlow] hydrateConceptFromBackend:loading full whitelist", {
            conceptId,
          });
          try {
            const users = await getAllWhitelistUsers({
              premarket_id: String(conceptId),
            });
            mappedConcept.whitelistData = {
              state: "enabled",
              items: users.flatMap((user) =>
                user.wallets.map((wallet) => ({
                  pubkey: wallet,
                  state: "enabled" as const,
                }))
              ),
            };
            console.log("[PremarketCreationFlow] hydrateConceptFromBackend:full whitelist loaded", {
              count: mappedConcept.whitelistData.items.length,
            });
          } catch (e) {
            console.error("[PremarketCreationFlow] hydrateConceptFromBackend:failed to load full whitelist", e);
          }
        }

        shouldHydrateFromBackendRef.current = false;
        shouldRestoreFromStorageRef.current = false;
        applyRestoredData(mappedConcept);
        console.log("[PremarketCreationFlow] hydrateConceptFromBackend:state applied");
        await patch(mappedConcept);
        console.log("[PremarketCreationFlow] hydrateConceptFromBackend:draft patched");
      } catch (e) {
        console.error("[PremarketCreationFlow] failed to hydrate concept from backend", e);
      } finally {
        if (!cancelled) {
          console.log("[PremarketCreationFlow] hydrateConceptFromBackend:finish");
          setLoadingConcept(false);
        }
      }
    };

    hydrateConceptFromBackend();

    return () => {
      cancelled = true;
    };
  }, [loading, network, patch, applyRestoredData]);

  if (loading || loadingConcept) {
    console.log("[PremarketCreationFlow] render loading", { loading, loadingConcept });
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.shadow,
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  const handleAfterSetTokenBaseInfo = async (data: TokenMainData) => {
    setTokenMainData(data);
    setStep(FLOW_STEP.TOKENOMICS);
    await patch({
      tokenMainData: data,
      step: FLOW_STEP.TOKENOMICS,
    });
  };

  const handleAfterTokenomics = async (data: TokenomicsData) => {
    if (!tokenMainData) {
      setStep(FLOW_STEP.TOKEN_BASE_INFO);
      return;
    }
    setTokenomicsData(data);
    setStep(FLOW_STEP.PREMARKET_SETTINGS);
    await patch({
      tokenomicsData: data,
      step: FLOW_STEP.PREMARKET_SETTINGS,
    });
  };

  const handleAfterPremarketSettings = async (data: PremarketSettingData) => {
    if (!tokenMainData) {
      setStep(FLOW_STEP.TOKEN_BASE_INFO);
      return;
    }
    if (!tokenomicsData) {
      setStep(FLOW_STEP.TOKENOMICS);
      return;
    }
    setPremarketSettingsData(data);
    const nextStep = FLOW_STEP.WHITELIST;
    setStep(nextStep);
    await patch({
      premarketSettingsData: data,
      step: nextStep,
    });
  };

  const handleAfterWhitelist = async (data: WhitelistData) => {
    setWhitelistData(data);
    const nextStep = IsVestingEnable ? FLOW_STEP.VESTING : FLOW_STEP.CUSTOMIZE_TOKEN;
    setStep(nextStep);
    await patch({
      whitelistData: data,
      step: nextStep,
    });
  };

  const handleAfterCunstomizeToken = async (data: CustomizeTokenData) => {
    if (!tokenMainData) {
      setStep(FLOW_STEP.TOKEN_BASE_INFO);
      return;
    }
    if (!tokenomicsData) {
      setStep(FLOW_STEP.TOKENOMICS);
      return;
    }
    if (!premarketSettingsData) {
      setStep(FLOW_STEP.PREMARKET_SETTINGS);
      return;
    }

    setCustomizeTokenData(data);
    setStep(FLOW_STEP.OVERVIEW);
    await patch({
      customizeTokenData: data,
      step: FLOW_STEP.OVERVIEW,
    });
  };

  const handleLaunch = async (discoverable: boolean) => {
    const prepared = await preparePremarketCreation(discoverable);
    if (!prepared) {
      return;
    }

    try {
      setLaunchState("Connecting wallet...");
      setLaunchState("Started premarket creation...");
      let resp:
        | undefined
        | {
            txId: string;
            premarketPDA: string;
          };

      try {
        resp = await createPremarket(
          prepared.network,
          prepared.wallet,
          currentConnection,
          prepared.createPremarketArgs,
          prepared.communityInfo,
          vestingData,
          prepared.effectiveWhitelist,
          prepared.visibilityInfo,
          (text) => {
            setLaunchState(text);
          },
          notify.error
        );
        setPremarketPDA(resp.premarketPDA.toString());
        setTxId(resp.txId);
      } catch (error) {
        console.error("failed to create premarket in blockchain", error);
        notify.error("failed to create premarket", {
          suggest: "Please, try again",
          duration: 60000,
          action: {
            label: "Ok",
            onAction: () => {},
          },
        });
        return;
      }
      if (resp === undefined) {
        notify.error("failed to create premarket: no txId linked", {
          suggest: "Please, try again or contact admin",
          duration: 60000,
          action: {
            label: "Ok",
            onAction: () => {},
          },
        });
        return;
      }
      await patch({ step: FLOW_STEP.PROCESSING });
      setStep(FLOW_STEP.PROCESSING);
    } finally {
      closeOverlay();
      setLaunchState(undefined);
    }
  };

  const handleCreateConcept = async (discoverable: boolean) => {
    const prepared = await preparePremarketCreation(discoverable);
    if (!prepared) {
      return;
    }

    try {
      setLaunchState("Creating concept...");
      const resp = await createPremarketConcept(
        prepared.network,
        prepared.wallet,
        prepared.createPremarketArgs,
        prepared.communityInfo,
        vestingData,
        prepared.effectiveWhitelist,
        prepared.visibilityInfo,
        (text) => {
          setLaunchState(text);
        },
        notify.error
      );

      router.push(`/token/${resp.premarketPDA}`);
    } catch (error) {
      console.error("failed to create concept", error);
      notify.error("failed to create concept", {
        suggest: "Please, try again",
        duration: 60000,
        action: {
          label: "Ok",
          onAction: () => {},
        },
      });
    } finally {
      closeOverlay();
      setLaunchState(undefined);
    }
  };

  const preparePremarketCreation = async (discoverable: boolean) => {
    await patch({ step: FLOW_STEP.OVERVIEW });

    if (
      !tokenMainData ||
      !customizeTokenData ||
      !tokenomicsData ||
      !premarketSettingsData
    ) {
      console.error("no tokenData");
      notify.error("no tokenData", {
        suggest: "reload page and set all token data",
      });
      return;
    }

    const nowSec = Math.floor(Date.now() / 1000);
    const SEC_IN_H = 60 * 60;
    const SEC_IN_DAY = 24 * SEC_IN_H;

    if (premarketSettingsData.deadline_sec < nowSec + SEC_IN_H) {
      notify.error("Min deadline - 1 h", {
        suggest: "Change deadline",
      });
      return;
    }
    if (premarketSettingsData.deadline_sec > nowSec + SEC_IN_DAY * 31) {
      notify.error("Max deadline - 31 days", {
        suggest: "Change deadline",
      });
      return;
    }

    if (wallet === undefined || !connected) {
      console.error("wallet is not connected");
      notify.error("wallet is not connected", {
        suggest: "enable phantom extention and try again",
        action: {
          label: "connect",
          onAction: async () => {
            try {
              await connect();
            } catch (e) {
              console.log("error during connect:", e);
            }
          },
        },
      });
      return;
    }

    if (network === "testnet") {
      notify.error("testnet network is not supported");
      return;
    }

    const creationNetwork = network;

    const createPremarketArgs: CreatePremarketArgs = {
      avatar: tokenMainData.avatar,
      name: tokenMainData.tokenName,
      symbol: tokenMainData.tokenTicker,
      description: tokenMainData.description,
      links: tokenMainData.links,
      deadline: premarketSettingsData.deadline_sec,
      goal_sol_lamp: convertSmallCountToLamport(premarketSettingsData.goal_sol),
      max_sol_lamp: convertSmallCountToLamport(premarketSettingsData.goal_sol + 0.5),
      creator_allocate_lamp: convertSmallCountToLamport(
        tokenomicsData.creatorInitialBuy
      ),
    };

    const communityInfo: AddCommunityInfoParams = {
      banner: customizeTokenData.banner
        ? {
            data: customizeTokenData.banner.data,
            url: customizeTokenData.banner.url,
          }
        : undefined,
      description: customizeTokenData.description,
      links: customizeTokenData.links,
    };

    const effectiveWhitelist: WhitelistData = {
      state: whitelistData?.state ?? "disabled",
      items: whitelistData?.items ?? [],
    };

    return {
      network: creationNetwork,
      wallet,
      createPremarketArgs,
      communityInfo,
      effectiveWhitelist,
      visibilityInfo: {
        isHided: !discoverable,
        tokenShortUrlName: premarketSettingsData.short_link_name,
      },
    };
  };

  const handleIsFinished = async (): Promise<boolean> => {
    if (txId === undefined || txId === "") {
      console.error(`tx is not defined!`);
      return false;
    }

    await confirmTxFinalised(currentConnection, txId).catch(()=>{return false});
    return true;
  };

  const handleOnDone = async () => {
    console.log("handleOnDone move to page:", `/premarket/${premarketPDA}`);
    if (isOverlayOpen) {
      closeOverlay();
    }
    await clear();
    router.push(`/token/${premarketPDA}`);
  };

  const onButtonClose = async () => {
    await clear();
    router.push("/discover");
  }

  const getTokenData = (): TokenCreateFullData | undefined => {
    if (
      tokenMainData === undefined ||
      customizeTokenData === undefined ||
      tokenomicsData === undefined ||
      premarketSettingsData === undefined
    ) {
      return undefined;
    }
    return {
      mainData: tokenMainData,
      customData: customizeTokenData,
      tokenomicsData: tokenomicsData,
      premarket: premarketSettingsData,
    };
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.shadow,
        justifyContent: isMobile ? "flex-start" : "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <View
        style={{
          maxWidth: 480,
          maxHeight: isMobile ? undefined : 792,
          width: "100%",
          height: isMobile ? "100%" : "90%",
        }}
      >
        {step === FLOW_STEP.TOKEN_BASE_INFO && (
          <CreateTokenForm
            onNext={handleAfterSetTokenBaseInfo}
            onClose={async () => {
            }}
            step={1}
            totalSteps={totalSteps}
            presetData={tokenMainData}
          />
        )}

        {step === FLOW_STEP.TOKENOMICS && (
          <EditTokenomicsForm
            onBack={() => setStep(FLOW_STEP.TOKEN_BASE_INFO)}
            onNext={handleAfterTokenomics}
            onClose={onButtonClose}
            step={2}
            totalSteps={totalSteps}
            presetData={tokenomicsData}
          />
        )}
        {step === FLOW_STEP.PREMARKET_SETTINGS && (
          <EditPremarketSettingsForm
            onBack={() => setStep(FLOW_STEP.TOKENOMICS)}
            onNext={handleAfterPremarketSettings}
            onClose={onButtonClose}
            step={3}
            totalSteps={totalSteps}
            presetData={premarketSettingsData}
            tokenomicsData={tokenomicsData}
          />
        )}
        {step === FLOW_STEP.WHITELIST && (
          <EditWhitelistForm
            onBack={() => setStep(FLOW_STEP.PREMARKET_SETTINGS)}
            onNext={handleAfterWhitelist}
            onClose={onButtonClose}
            step={4}
            totalSteps={totalSteps}
            presetData={whitelistData}
          />
        )}

        {IsVestingEnable && step === FLOW_STEP.VESTING && (
          <VestingSetupForm
            onBack={() => setStep(FLOW_STEP.WHITELIST)}
            onNext={(d) => {
              setVestingData(d);
              patch({ vestingData: d, step: FLOW_STEP.CUSTOMIZE_TOKEN });
              setStep(FLOW_STEP.CUSTOMIZE_TOKEN);
            }}
            onSaveDraft={() => patch({ vestingData, step })}
            onClose={onButtonClose}
            step={5}
            totalSteps={totalSteps}
            presetData={vestingData}
          />
        )}

        {step === FLOW_STEP.CUSTOMIZE_TOKEN && (
          <CustomizeTokenForm
            onBack={() =>
              setStep(IsVestingEnable ? FLOW_STEP.VESTING : FLOW_STEP.WHITELIST)
            }
            onNext={handleAfterCunstomizeToken}
            onClose={onButtonClose}
            steps={{ current: IsVestingEnable ? 6 : 5, total: totalSteps }}
            presetData={customizeTokenData}
          />
        )}

        {step === FLOW_STEP.OVERVIEW && (
          <OverviewPremarketCreation
            onBack={() => setStep(FLOW_STEP.CUSTOMIZE_TOKEN)}
            removeAll={async () => {
              await clear();
              setStep(FLOW_STEP.TOKEN_BASE_INFO);
            }}
            onClose={onButtonClose}
            launchState={launchState}
            onLaunch={handleLaunch}
            onCreateConcept={handleCreateConcept}
            data={getTokenData()!}
            whitelistData={whitelistData}
            vestingData={vestingData}
          />
        )}

        {step === FLOW_STEP.PROCESSING && (
          <TokenCreationProcess
            isFinished={handleIsFinished}
            onDone={handleOnDone}
            tokenData={getTokenData()!}
            txId={txId}
          />
        )}
      </View>
    </View>
  );
}

function mapBackendConceptToDraft(
  raw: any,
  fallback?: {
    tokenomicsData?: TokenomicsData;
    whitelistData?: WhitelistData;
    vestingData?: VestingData;
  }
):
  | {
      step: FLOW_STEP;
      tokenMainData: TokenMainData;
      tokenomicsData?: TokenomicsData;
      premarketSettingsData: PremarketSettingData;
      customizeTokenData: CustomizeTokenData;
      whitelistData: WhitelistData;
      vestingData?: VestingData;
    }
  | null {
  if (!raw) {
    console.log("[mapBackendConceptToDraft] raw is empty");
    return null;
  }

  const blockchainInfo = raw.blockchain_info ?? raw.blockchainInfo ?? raw.token_info ?? raw.tokenInfo ?? raw;
  const communityInfo = raw.community_info ?? raw.communityInfo ?? {};
  const availabilityInfo = raw.availability_info ?? raw.availabilityInfo ?? {};
  const whitelistInfo = raw.whitelist_info ?? raw.whitelistInfo ?? raw.whitelist ?? {};
  const vestingInfo = raw.vesting_info ?? raw.vestingInfo ?? {};

  const tokenName = blockchainInfo.name ?? raw.name;
  const tokenTicker = blockchainInfo.symbol ?? raw.symbol;
  const description = blockchainInfo.description ?? raw.description ?? "";
  const avatar =
    blockchainInfo.image_url ??
    blockchainInfo.imageURL ??
    raw.image_url ??
    raw.imageURL ??
    "";

  const deadlineSec = Number(
    blockchainInfo.premarket_deadline ??
      blockchainInfo.deadline ??
      raw.premarket_deadline ??
      raw.deadline ??
      0
  );

  const goalSolLamp =
    blockchainInfo.premarket_goal_sol_lamp ??
    blockchainInfo.goal_sol_lamp ??
    raw.premarket_goal_sol_lamp ??
    raw.goal_sol_lamp;

  const creatorAllocateLamp =
    blockchainInfo.creator_allocate_lamp ??
    raw.creator_allocate_lamp;

  if (!tokenName && !tokenTicker && !description && !avatar && !deadlineSec && goalSolLamp == null) {
    console.log("[mapBackendConceptToDraft] required fields missing", {
      tokenName,
      tokenTicker,
      deadlineSec,
      goalSolLamp,
      creatorAllocateLamp,
      raw,
    });
    return null;
  }

  const tokenMainData: TokenMainData = {
    tokenName: String(tokenName ?? ""),
    tokenTicker: String(tokenTicker ?? ""),
    description: String(description),
    avatar: String(avatar),
    links: {
      telegram: blockchainInfo.links?.telegram ?? raw.links?.telegram ?? undefined,
      twitter: blockchainInfo.links?.twitter ?? raw.links?.twitter ?? undefined,
      website:
        blockchainInfo.links?.web_site ??
        blockchainInfo.links?.website ??
        raw.links?.web_site ??
        raw.links?.website ??
        undefined,
    },
  };

  const tokenomicsData: TokenomicsData | undefined =
    creatorAllocateLamp != null
      ? {
          creatorInitialBuy: convertLamportToSmallCount(new BN(String(creatorAllocateLamp))),
        }
      : fallback?.tokenomicsData;

  const premarketSettingsData: PremarketSettingData | undefined =
    deadlineSec && goalSolLamp != null
      ? {
          deadline_sec: deadlineSec,
          goal_sol: convertLamportToSmallCount(new BN(String(goalSolLamp))),
          short_link_name:
            availabilityInfo.token_short_url_name ??
            availabilityInfo.tokenShortUrlName ??
            raw.token_short_url_name ??
            raw.tokenShortUrlName ??
            undefined,
        }
      : undefined;

  const customizeTokenData: CustomizeTokenData = {
    description: communityInfo.description ?? "",
    links: Array.isArray(communityInfo.links)
      ? communityInfo.links.map((link: any) => ({
          text: String(link.text ?? ""),
          url: String(link.url ?? ""),
          type: normalizeCommunityLinkType(link.type),
        }))
      : [],
    banner:
      communityInfo.token_banner_url || communityInfo.tokenBannerURL
        ? {
            url: communityInfo.token_banner_url ?? communityInfo.tokenBannerURL,
          }
        : undefined,
  };

  const whitelistItemsRaw =
    whitelistInfo.items ??
    whitelistInfo.user_pubkeys ??
    whitelistInfo.userPubkeys ??
    raw.whitelist_user_pubkeys ??
    [];

  const whitelistData: WhitelistData =
    Array.isArray(whitelistItemsRaw) || availabilityInfo.is_whitelist_enabled || availabilityInfo.isWhitelistEnabled
      ? {
          state:
            availabilityInfo.is_whitelist_enabled || availabilityInfo.isWhitelistEnabled
              ? "enabled"
              : "disabled",
          items: Array.isArray(whitelistItemsRaw)
            ? whitelistItemsRaw.map((item: any) => ({
                pubkey: String(item?.pubkey ?? item?.user_pubkey ?? item),
                state: "enabled" as const,
              }))
            : [],
        }
      : fallback?.whitelistData ?? { state: "disabled", items: [] };

  const vestingEnabled = Boolean(vestingInfo.enabled);
  const vestingData: VestingData | undefined =
    vestingInfo.enabled !== undefined ||
    vestingInfo.unlock_at_launch_percent !== undefined ||
    vestingInfo.vesting_period_sec !== undefined
      ? {
          enabled: vestingEnabled,
          unlockAtLaunchPercent: Number(vestingInfo.unlock_at_launch_percent ?? 0),
          vestingPeriodSec: Number(vestingInfo.vesting_period_sec ?? 0),
        }
      : fallback?.vestingData;

  const step = getEarliestIncompleteStep({
    tokenMainData,
    tokenomicsData,
    premarketSettingsData,
  });

  const mapped = {
    step,
    tokenMainData,
    tokenomicsData,
    premarketSettingsData,
    customizeTokenData,
    whitelistData,
    vestingData,
  };
  console.log("[mapBackendConceptToDraft] mapped draft", mapped);
  return mapped;
}

function normalizeCommunityLinkType(type: unknown): "x" | "tg" | "other" {
  if (type === "x" || type === "tg" || type === "other") {
    return type;
  }

  if (typeof type !== "string") {
    return "other";
  }

  const normalized = type.toLowerCase();
  if (normalized === "x" || normalized === "twitter") return "x";
  if (normalized === "tg" || normalized === "telegram") return "tg";
  return "other";
}

function resolveFlowStep(step: unknown): FLOW_STEP {
  return typeof step === "number" && step in FLOW_STEP
    ? (step as FLOW_STEP)
    : FLOW_STEP.TOKEN_BASE_INFO;
}

function getEarliestIncompleteStep({
  tokenMainData,
  tokenomicsData,
  premarketSettingsData,
}: {
  tokenMainData: TokenMainData;
  tokenomicsData?: TokenomicsData;
  premarketSettingsData?: PremarketSettingData;
}): FLOW_STEP {
  const isMainInfoIncomplete =
    !tokenMainData.tokenName.trim() ||
    !tokenMainData.tokenTicker.trim() ||
    !tokenMainData.description.trim() ||
    !tokenMainData.avatar.trim();

  if (isMainInfoIncomplete) {
    return FLOW_STEP.TOKEN_BASE_INFO;
  }

  const isTokenomicsIncomplete =
    tokenomicsData?.creatorInitialBuy === undefined ||
    tokenomicsData.creatorInitialBuy <= 0;

  if (isTokenomicsIncomplete) {
    return FLOW_STEP.TOKENOMICS;
  }

  const isPremarketIncomplete =
    !premarketSettingsData ||
    !premarketSettingsData.deadline_sec ||
    premarketSettingsData.goal_sol === undefined ||
    premarketSettingsData.goal_sol <= 0;

  if (isPremarketIncomplete) {
    return FLOW_STEP.PREMARKET_SETTINGS;
  }

  return FLOW_STEP.OVERVIEW;
}
