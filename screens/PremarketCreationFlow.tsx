// screens/TokenCreationFlow.tsx
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useTheme } from "react-native-paper";
import { useRouter } from "expo-router";

import CreateTokenForm from "@components/token/create/CreateTokenForm";
import CustomizeTokenForm from "@components/token/create/CustomizeTokenForm";
import OverviewPremarketCreation from "@components/premarket/creationFlow/OverviewPremarketCreation";
import TokenCreationProcess from "@components/token/create/TokenCreationProcess";
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
  updateTokenAvailbility,
  userJoinedToPremarket,
} from "@api/token";
import { useAuth } from "@providers/AuthContext";
import { uploadImage } from "@api/files";
import useIsMobile from "@hooks/useIsMobile";
import { useNetwork } from "@providers/NetworkContext";
import { getSolanaConnection } from "@services/blockchain/solana";
import { useNotification } from "@providers/NotificationContext";
import { validateImageFile, uriToFile, BANNER_MAX_FILE_SIZE_BYTES } from "@utils/imageValidation";

import { usePremarketDraft } from "@hooks/usePremarketDraft";
import { useOverlay } from "@storage/UniversalOverlayProvider";
import TransactionLoadingModal from "@components/modals/TransactionLoadingModal";

enum FLOW_STEP {
  TOKEN_BASE_INFO = 1,
  TOKENOMICS = 2,
  PREMARKET_SETTINGS = 3,
  CUSTOMIZE_TOKEN = 4,
  OVERVIEW = 6,
  PROCESSING = 7,
}

export default function PremarketCreationFlow() {
  const notify = useNotification();
  const isMobile = useIsMobile();
  const user = useAuth();
  const wallet = useAnchorWalletSafe();
  const { connected, connect } = useWallet();
  const {open: openOverlay, replace: replaceOverlay, isOpen: isOverlayOpen, close: closeOverlay} = useOverlay();


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
    setStep((d.step as FLOW_STEP) ?? FLOW_STEP.TOKEN_BASE_INFO);
  }, []);

  const normalizeStep = React.useCallback(
    (s: number) =>
      (s === FLOW_STEP.PROCESSING ? FLOW_STEP.OVERVIEW : s) as FLOW_STEP,
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
    setStep(FLOW_STEP.CUSTOMIZE_TOKEN);
    await patch({
      premarketSettingsData: data,
      step: FLOW_STEP.CUSTOMIZE_TOKEN,
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

      try {
        await patch({ step: FLOW_STEP.PROCESSING });

        setLaunchState("Adding info to Revelcy...");
        try {
          if (tokenData.tokenomicsData.creatorInitialBuy > 0) {
            await userJoinedToPremarket({
              joinAmountInSolLamport: convertSmallCountToLamport(
                tokenData.tokenomicsData.creatorInitialBuy
              ),
              premarketPubKey: resp.premarketPDA.toString(),
              tx: resp.txId,
              userWallet: wallet.publicKey.toString(),
              userId: user.user?.userId,
            });
          }
        } catch (error) {
          notify.error(
            "Premarket created, but info about your entry is not added",
            {
              suggest:
                "Please, contact administrator with premarket address:" +
                resp.premarketPDA.toString(),
              duration: 60000,
              action: {
                label: "Ok",
                onAction: () => {},
              },
            }
          );
          return;
        }

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
            totalSteps={4}
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
            totalSteps={4}
            presetData={tokenomicsData}
          />
        )}

        {step === FLOW_STEP.PREMARKET_SETTINGS && (
          <EditPremarketSettingsForm
            onBack={() => setStep(FLOW_STEP.TOKENOMICS)}
            onNext={handleAfterPremarketSettings}
            onClose={async () => {
              await clear();
              router.push("/discover");
            }}
            step={3}
            totalSteps={4}
            presetData={premarketSettingsData}
            tokenomicsData={tokenomicsData}
          />
        )}

        {step === FLOW_STEP.CUSTOMIZE_TOKEN && (
          <CustomizeTokenForm
            onBack={() => setStep(FLOW_STEP.PREMARKET_SETTINGS)}
            onNext={handleAfterCunstomizeToken}
            onClose={async () => {
              await clear();
              router.push("/discover");
            }}
            steps={{ current: 4, total: 4 }}
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
