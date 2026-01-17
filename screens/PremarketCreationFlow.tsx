// screens/TokenCreationFlow.tsx
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useTheme } from "react-native-paper";
import { useRouter } from "expo-router";

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
import { uploadTokenMetadataToIPFS } from "@services/files/ipfs/pumpfun";
import {
  createPremarket,
  CreatePremarketArgs,
} from "@services/blockchain/premarket/createPremarket";
import EditPremarketSettingsForm from "@components/token/create/EditPremarketSettings";
import { convertSmallCountToLamport } from "@utils/premarket";
import {
  updateAboutCommunity,
  updateVestingInfo,
  updateTokenAvailbility,
} from "@api/token";
import { useAuth } from "@providers/AuthContext";
import { uploadImage } from "@api/files";
import useIsMobile from "@hooks/useIsMobile";
import { useNetwork } from "@providers/NetworkContext";
import { getSolanaConnection } from "@services/blockchain/solana";
import { useNotification } from "@providers/NotificationContext";
import { validateImageFile, uriToFile, BANNER_MAX_FILE_SIZE_BYTES } from "@utils/imageValidation";

import { usePremarketDraft, type FlowStep } from "@hooks/usePremarketDraft";
import { PublicKey } from "@solana/web3.js";
import { useOverlay } from "@storage/UniversalOverlayProvider";
import TransactionLoadingModal from "@components/modals/TransactionLoadingModal";
import { IsVestingEnable } from "env";

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
  const user = useAuth();
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
    const stateDisplay = (
    <View>
      <TransactionLoadingModal launchState={launchState} />
    </View>)
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

      setLaunchState("Uploading data to IPFS...");
      const ipfsData = await uploadTokenMetadataToIPFS({
        avatar: tokenData.mainData.avatar,
        tokenInfo: {
          name: tokenData.mainData.tokenName,
          symbol: tokenData.mainData.tokenTicker,
          description: tokenData.mainData.description,
          links: {
            telegram: tokenData.mainData.links.telegram,
            twitter: tokenData.mainData.links.twitter,
            website: tokenData.mainData.links.website,
          },
        },
      });
      if (!ipfsData) {
        notify.error("failed to upload data to IPFS", {
          suggest: "Please, try again later",
        });
        return;
      }

      setLaunchState("Creating premarket in blockchain...");
      const createPremarketArgs: CreatePremarketArgs = {
        name: tokenData.mainData.tokenName,
        symbol: tokenData.mainData.tokenTicker,
        uri: ipfsData.metadataUri,
        deadline: tokenData.premarketSettingsData.deadline_sec,
        goal_sol_lamp: convertSmallCountToLamport(tokenData.premarketSettingsData.goal_sol),
        max_sol_lamp: convertSmallCountToLamport(tokenData.premarketSettingsData.goal_sol+0.5),
        creator_allocate_lamp: convertSmallCountToLamport(
          tokenData.tokenomicsData.creatorInitialBuy
        ),
      };
      setLaunchState("Trying to create TX...");
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
          (text) => {
            setLaunchState(text);
          }
        );
        setLaunchState("Premarket created...");
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
          suggest: "Please, try again and contact admin",
          duration: 60000,
          action: {
            label: "Ok",
            onAction: () => {},
          },
        });
        return;
      }
       // Send vesting info 
        try {
          if (IsVestingEnable && vestingData?.enabled) {
            await updateVestingInfo(resp.premarketPDA.toString(), {
              unlock_at_launch_percent: vestingData.unlockAtLaunchPercent,
              vesting_period_sec: vestingData.vestingPeriodSec,
            });
          }
        } catch (e) {
          notify.error("Failed to add vesting info", {
            suggest: "You can update it later from premarket page",
            duration: 60000,
            action: { label: "Ok", onAction: () => { } },
          });
        }

      try {
        await patch({ step: FLOW_STEP.PROCESSING });

        setLaunchState("Adding community info");
        try {
          try {
            if (tokenData.customData.banner?.data) {
              const validationError = await validateImageFile(tokenData.customData.banner.data, { maxSizeBytes: BANNER_MAX_FILE_SIZE_BYTES });
              if (validationError) {
                notify.error(validationError.message, {
                  suggest: "Please, select a PNG or JPEG image under 5 MB",
                  duration: 60000,
                  action: {
                    label: "Ok",
                    onAction: () => {},
                  },
                });
                tokenData.customData.banner = undefined;
                return;
              }
              
              const fileName = `${resp.premarketPDA.toString()}_banner`;
              const file = await uriToFile(tokenData.customData.banner.data, fileName);
              tokenData.customData.banner.url = await uploadImage(file, fileName);
            }
          } catch {
            notify.error("Failed to upload community banner", {
              suggest: "Please, add it again from premarket page",
              duration: 60000,
              action: {
                label: "Ok",
                onAction: () => {},
              },
            });
            tokenData.customData.banner = undefined;
          }

          await updateAboutCommunity(resp.premarketPDA.toString(), {
            description: tokenData.customData.description ?? "",
            tokenBannerURL: tokenData.customData.banner?.url,
            links: tokenData.customData.links,
          });
        } catch {
          notify.error("failed to add community info", {
            suggest: "Please, add it again from premarket page",
            duration: 60000,
            action: {
              label: "Ok",
              onAction: () => {},
            },
          });
          // no return just notify
        }
        
        setLaunchState("Change token params...");
        try {
          await updateTokenAvailbility(resp.premarketPDA.toString(), {
            isHided: !discoverable,
            tokenShortUrlName: tokenData.premarketSettingsData.short_link_name,
          });
        } catch {
          notify.error("failed to change tokens params", {
            suggest: "Please, ask admin to change it",
            duration: 60000,
            action: {
              label: "Ok",
              onAction: () => {},
            },
          });
        }


        setStep(FLOW_STEP.PROCESSING);
      } catch (error) {
        console.error("Error creating premarket:", error);
        notify.error("Error creating: premarket is not created in blockchain", {
          suggest: "Please, wait and try again",
        });
      }
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

    const resp = await currentConnection.confirmTransaction(txId, "finalized");
    if (resp.value.err === null) {
      return true;
    }
    console.error(
      `tx ${txId} is not finished: ${
        resp.value.err?.toString?.() ?? JSON.stringify(resp.value.err)
      }`
    );
    return false;
  };

  const handleOnDone = async () => {
    console.log("handleOnDone move to page:", `/premarket/${premarketPDA}`);
    if (isOverlayOpen) {
      closeOverlay();
    }
    await clear();
    router.push(`/token/${premarketPDA}`);
  };

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
              await clear();
              router.push("/discover");
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
            onClose={async () => {
              await clear();
              router.push("/discover");
            }}
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
            onClose={async () => {
              await clear();
              router.push("/discover");
            }}
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
            onClose={async () => {
              await clear();
              router.push("/discover");
            }}
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
            onClose={async () => {
              await clear();
              router.push("/discover");
            }}
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
            onClose={async () => {
              await clear();
              router.push("/discover");
            }}
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
