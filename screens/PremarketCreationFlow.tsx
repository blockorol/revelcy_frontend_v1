// screens/TokenCreationFlow.tsx
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useTheme } from "react-native-paper";
import { useRouter } from "@hooks/useSafeRouter";

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
} from "@components/token/create/interface";
import EditTokenomicsForm from "@components/token/create/EditTokenomicsForm";
import {
  useAnchorWalletSafe,
  useWallet,
} from "@storage/wallet-adapter/useWallet.web";
import {
  createPremarket,
  CreatePremarketArgs,
} from "@services/premarket/create";
import EditPremarketSettingsForm from "@components/token/create/EditPremarketSettings";
import { convertSmallCountToLamport } from "@utils/premarket";
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
  VESTING = 4,
  CUSTOMIZE_TOKEN = 5,
  OVERVIEW = 6,
  PROCESSING = 7,
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

  const [premarketPDA, setPremarketPDA] = useState<string | undefined>(
    undefined
  );
  const [txId, setTxId] = useState<string | undefined>(undefined);
  const [vestingData, setVestingData] = useState<VestingData | undefined>(undefined);
  const totalSteps = IsVestingEnable ? 5 : 4;

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
  const onRestore = React.useCallback((d: any) => {
    if (d.tokenMainData) setTokenMainData(d.tokenMainData);
    if (d.tokenomicsData) setTokenomicsData(d.tokenomicsData);
    if (d.premarketSettingsData)
      setPremarketSettingsData(d.premarketSettingsData);
    if (d.customizeTokenData) setCustomizeTokenData(d.customizeTokenData);
    if (d.vestingData) setVestingData(d.vestingData);
    setStep((d.step as FLOW_STEP) ?? FLOW_STEP.TOKEN_BASE_INFO);
  }, []);

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
    CustomizeTokenData
  >({
    loadTimeoutMs: 1500,
    retry: 1,
    clearOnTimeout: false,
    normalizeStep,
    onRestore,
    initialDraft: { step: FLOW_STEP.TOKEN_BASE_INFO },
  });

  if (loading) {
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
    const nextStep = IsVestingEnable ? FLOW_STEP.VESTING : FLOW_STEP.CUSTOMIZE_TOKEN;
    setStep(nextStep);
    await patch({
      premarketSettingsData: data,
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
    try {
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

      const tokenData = {
        mainData: tokenMainData,
        customData: customizeTokenData,
        tokenomicsData: tokenomicsData,
        premarketSettingsData: premarketSettingsData,
      };

      setLaunchState("Connecting wallet...");
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
        console.error("wallet is not connected");
        notify.error("testnet network is not supported");
        return;
      }

      const createPremarketArgs: CreatePremarketArgs = {
        avatar: tokenData.mainData.avatar,
        name: tokenData.mainData.tokenName,
        symbol: tokenData.mainData.tokenTicker,
        description: tokenData.mainData.description,
        links: tokenData.mainData.links,
        deadline: tokenData.premarketSettingsData.deadline_sec,
        goal_sol_lamp: convertSmallCountToLamport(tokenData.premarketSettingsData.goal_sol),
        max_sol_lamp: convertSmallCountToLamport(tokenData.premarketSettingsData.goal_sol+0.5),
        creator_allocate_lamp: convertSmallCountToLamport(
          tokenData.tokenomicsData.creatorInitialBuy
        ),
      };
      const communityInfo: AddCommunityInfoParams ={
        banner: tokenData.customData.banner ? {
          data: tokenData.customData.banner.data, 
          url: tokenData.customData.banner.url,
        } : undefined,
        description: tokenData.customData.description, 
        links: tokenData.customData.links
      }
      setLaunchState("Started premarket creation...");
      let resp:
        | undefined
        | {
            txId: string;
            premarketPDA: string;
          };

      try {
        resp = await createPremarket(
          network,
          wallet,
          currentConnection,
          createPremarketArgs,
          communityInfo,
          vestingData,
          {
            isHided: !discoverable,
            tokenShortUrlName: tokenData.premarketSettingsData.short_link_name,
          },
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
            onNext={async (d) => {
              const nextStep = IsVestingEnable
                ? FLOW_STEP.VESTING
                : FLOW_STEP.CUSTOMIZE_TOKEN;

              setPremarketSettingsData(d);
              setStep(nextStep);

              await patch({
                premarketSettingsData: d,
                step: nextStep,
              });
            }}
            onClose={onButtonClose}
            step={3}
            totalSteps={totalSteps}
            presetData={premarketSettingsData}
            tokenomicsData={tokenomicsData}
          />
        )}

        {IsVestingEnable && step === FLOW_STEP.VESTING && (
          <VestingSetupForm
            onBack={() => setStep(FLOW_STEP.PREMARKET_SETTINGS)}
            onNext={(d) => {
              setVestingData(d);
              patch({ vestingData: d, step: FLOW_STEP.CUSTOMIZE_TOKEN });
              setStep(FLOW_STEP.CUSTOMIZE_TOKEN);
            }}
            onSaveDraft={() => patch({ vestingData, step })}
            onClose={onButtonClose}
            step={4}
            totalSteps={totalSteps}
            presetData={vestingData}
          />
        )}

        {step === FLOW_STEP.CUSTOMIZE_TOKEN && (
          <CustomizeTokenForm
            onBack={() =>
              setStep(IsVestingEnable ? FLOW_STEP.VESTING : FLOW_STEP.PREMARKET_SETTINGS)
            }
            onNext={handleAfterCunstomizeToken}
            onClose={onButtonClose}
            steps={{ current: IsVestingEnable ? 5 : 4, total: totalSteps }}
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
            data={getTokenData()!}
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
