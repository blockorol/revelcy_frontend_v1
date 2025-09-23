// screens/TokenCreationFlow.tsx
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';

import CreateTokenForm from '@components/token/create/CreateTokenForm';
import CustomizeTokenForm from '@components/token/create/CustomizeTokenForm';
import OverviewPremarketCreation from '@components/premarket/creationFlow/OverviewPremarketCreation';
import TokenCreationProcess from '@components/token/create/TokenCreationProcess';
import {
  TokenMainData,
  TokenomicsData,
  CustomizeTokenData,
  TokenCreateFullData,
  PremarketSettingData
} from '@components/token/create/interface';
import EditTokenomicsForm from '@components/token/create/EditTokenomicsForm';
import { useAnchorWalletSafe, useWallet } from '@storage/wallet-adapter/useWallet.web';
import { uploadBase64Image, uploadJsonMetadata } from '@services/files/ipfs';
import { createPremarket, CreatePremarketArgs } from '@services/blockchain/premarket/createPremarket';
import EditPremarketSettingsForm from '@components/token/create/EditPremarketSettings';
import { convertSmallCountToLamport } from '@utils/premarket';
import { premarketCreated, userJoinedToPremarket } from '@api/token';
import { useAuth } from '@providers/AuthContext';
import { uploadImage } from '@api/files';
import useIsMobile from '@hooks/useIsMobile';
import { useNetwork } from '@providers/NetworkContext';
import { getSolanaConnection } from '@services/blockchain/solana';
import { useNotification } from '@storage/NotificationContext';

import { draftKey, loadDraft, saveDraft, clearDraft } from '@storage/PremarketDraft';

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

  const router = useRouter();
  const { network } = useNetwork();
  const currentConnection = getSolanaConnection(network);

  // Ключ для черновика — уникален на пользователя и сеть
  const storageKey = draftKey(user.user?.userId, network);

  const [step, setStep] = useState<FLOW_STEP>(1);
  const [tokenMainData, setTokenMainData] = useState<TokenMainData | undefined>(undefined);
  const [tokenomicsData, setTokenomicsData] = useState<TokenomicsData | undefined>(undefined);
  const [customizeTokenData, setCustomizeTokenData] = useState<CustomizeTokenData | undefined>(undefined);
  const [premarketSettingsData, setPremarketSettingsData] = useState<PremarketSettingData | undefined>(undefined);

  const [premarketPDA, setPremarketPDA] = useState<string | undefined>(undefined);
  const [txId, setTxId] = useState<string | undefined>(undefined);

  const theme = useTheme();
  const [launchState, setLaunchState] = useState<string | undefined>(undefined);

  // === ВОССТАНОВЛЕНИЕ ЧЕРНОВИКА ПРИ МОНТАЖЕ ===
  useEffect(() => {
    (async () => {
      const draft = await loadDraft<TokenMainData, TokenomicsData, PremarketSettingData, CustomizeTokenData>(storageKey);
      if (!draft) return;

      if (draft.tokenMainData) setTokenMainData(draft.tokenMainData);
      if (draft.tokenomicsData) setTokenomicsData(draft.tokenomicsData);
      if (draft.premarketSettingsData) setPremarketSettingsData(draft.premarketSettingsData);
      if (draft.customizeTokenData) setCustomizeTokenData(draft.customizeTokenData);

      // Если черновик был на PROCESSING — безопаснее вернуть на OVERVIEW,
      // чтобы пользователь мог видеть обзор и перезапустить.
      const restored = draft.step === FLOW_STEP.PROCESSING ? FLOW_STEP.OVERVIEW : draft.step;
      setStep(restored);
    })();
  }, [storageKey]);

  const handleAfterSetTokenBaseInfo = async (data: TokenMainData) => {
    setTokenMainData(data);
    setStep(FLOW_STEP.TOKENOMICS);
    await saveDraft<TokenMainData, TokenomicsData, PremarketSettingData, CustomizeTokenData>(storageKey, {
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
    await saveDraft(storageKey, {
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
    await saveDraft(storageKey, {
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
    await saveDraft(storageKey, {
      customizeTokenData: data,
      step: FLOW_STEP.OVERVIEW,
    });
  };

  const uploadToIPFS = async (tokenData: TokenCreateFullData & { premarketSettingsData: PremarketSettingData; tokenomicsData: TokenomicsData; }) => {
    console.log("uploadToIPFS in TokenCreationFLow");
    try {
      const fileName = `avatar_${tokenData.mainData.tokenName}.jpg`;
      const avatarIpfsUri = await uploadBase64Image(tokenData.mainData.avatar, fileName);

      if (!avatarIpfsUri) {
        throw Error("avatar is not upload");
      }
      const descriptionUpdated =
        `The presale was done with revelcy.com. More: https://revelcy.com/premarket \n${tokenData.mainData.description}`;

      const metadata = {
        name: tokenData.mainData.tokenName,
        symbol: tokenData.mainData.tokenTicker,
        description: descriptionUpdated,
        image: avatarIpfsUri,
        tags: [],
        createdOn: "https://revelcy.com",
        creator: {
          name: "Revelcy",
          site: "https://revelcy.com"
        },
        telegram: tokenData.mainData.links.telegram,
        twitter: tokenData.mainData.links.twitter,
        tokenWebsite: tokenData.mainData.links.website
      };
      console.log(`metadata: ${metadata}; image: ${avatarIpfsUri}`);

      const metadataIpfsUri = await uploadJsonMetadata(metadata);

      if (!metadataIpfsUri) {
        throw Error("metadata is not upload");
      }
      console.log(`metadataIpfsUri: ${metadataIpfsUri}`);

      return {
        metadataUri: metadataIpfsUri,
        avatarUri: avatarIpfsUri,
      };
    } catch (error) {
      console.error('failed to upload to IPFS:', error);
      return null;
    }
  };

  const handleLaunch = async () => {
    setLaunchState("Started launch process");
    // Зафиксируем, что мы на обзоре — пригодится при рефреше
    await saveDraft(storageKey, { step: FLOW_STEP.OVERVIEW });

    console.log("handleLaunch");
    if (!tokenMainData || !customizeTokenData || !tokenomicsData || !premarketSettingsData) {
      setLaunchState(undefined);
      console.error("no tokenData");
      notify.error("no tokenData", {
        suggest: "reload page and set all token data",
      });
      return;
    }

    const tokenData = {
      mainData: tokenMainData,
      customData: customizeTokenData,
      tokenomicsData: tokenomicsData,
      premarketSettingsData: premarketSettingsData
    };

    setLaunchState("Connecting wallet...");
    if (wallet === undefined || !connected) {
      setLaunchState(undefined);
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
          }
        }
      });
      return;
    }
    if (network === 'testnet') {
      console.error("wallet is not connected");
      notify.error("testnet network is not supported");
      return;
    }

    setLaunchState("Uploading data to IPFS...");
    const ipfsData = await uploadToIPFS(tokenData);
    if (!ipfsData) {
      setLaunchState(undefined);
      notify.error("failed to upload data to IPFS", {
        suggest: "Please, try again later"
      });
      return;
    }

    setLaunchState("Creating premarket in blockchain...");
    try {
      console.info("after uploadToIPFS", tokenData.premarketSettingsData.goal_sol_lamp.toString());
      const createPremarketArgs: CreatePremarketArgs = {
        name: tokenData.mainData.tokenName,
        symbol: tokenData.mainData.tokenTicker,
        uri: ipfsData.metadataUri,
        deadline: tokenData.premarketSettingsData.deadline,
        goal_sol_lamp: tokenData.premarketSettingsData.goal_sol_lamp,
        max_sol_lamp: tokenData.premarketSettingsData.goal_sol_lamp,
        creator_allocate_lamp: convertSmallCountToLamport(tokenData.tokenomicsData.creatorInitialBuy)
      };
      setLaunchState("try to create TX...");

      const resp = await createPremarket(
        network,
        wallet,
        currentConnection,
        createPremarketArgs,
        (text) => { setLaunchState(text); }
      );

      setLaunchState("Transaction created...");
      console.log(`createBondedToken done! tx: ${resp.txId}; premarket: ${resp.premarketPDA.toString()}`);
      setPremarketPDA(resp.premarketPDA.toString());
      setTxId(resp.txId);

      // Сразу пишем в черновик PROCESSING (на случай перезагрузки)
      await saveDraft(storageKey, { step: FLOW_STEP.PROCESSING });

      setLaunchState("Adding to white list to Revelcy...");
      try {
        if (tokenData.customData.banner?.data) {
          const response = await fetch(tokenData.customData.banner?.data);
          const blob = await response.blob();
          const fileName = `${resp.premarketPDA.toString()}_banner`;
          const file = new File([blob], `${fileName}.png`, { type: blob.type });
          tokenData.customData.banner.url = await uploadImage(file, fileName);
        }

        await premarketCreated({
          tx: resp.txId,
          premarketPubKey: resp.premarketPDA.toString(),
          userWallet: wallet.publicKey.toString(),
          userId: user.user?.userId,
          mainInfo: {
            id: "",
            premarketPubkey: resp.premarketPDA,
            name: tokenData.mainData.tokenName,
            description: tokenData.mainData.description,
            symbol: tokenData.mainData.tokenTicker,
            imageURL: ipfsData.avatarUri,
            ipfsURI: ipfsData.metadataUri,
            links: {
              telegram: tokenData.mainData.links.telegram,
              twitter: tokenData.mainData.links.twitter,
              webSite: tokenData.mainData.links.website,
            },
            premarketGoalPers: tokenData.premarketSettingsData.goal_percent,
            premarketGoalSolLamp: tokenData.premarketSettingsData.goal_sol_lamp,
            premarketDeadline: tokenData.premarketSettingsData.deadline,
            premarketCreated: Math.floor(Date.now() / 1000),
            createdByPubkey: wallet.publicKey.toString(),
            state: 'premarket'
          },
          communityInfo: {
            description: tokenData.customData.description ?? "",
            tokenBannerURL: tokenData.customData.banner?.url,
            links: tokenData.customData.links
          },
        });

        setLaunchState("Adding to white list to Revelcy step2...");
        if (tokenData.tokenomicsData.creatorInitialBuy > 0) {
          await userJoinedToPremarket({
            joinAmountInSolLamport: convertSmallCountToLamport(tokenData.tokenomicsData.creatorInitialBuy),
            premarketPubKey: resp.premarketPDA.toString(),
            tx: resp.txId,
            userWallet: wallet.publicKey.toString(),
            userId: user.user?.userId,
          });
        }
      } catch (error) {
        notify.error("failed to add premarket to whitelist", {
          suggest: "Please, contact administrator with premarket address:" + resp.premarketPDA.toString(),
          duration: 60000,
          action: {
            label: 'Ok',
            onAction: () => { }
          }
        });
      }

      setStep(FLOW_STEP.PROCESSING);
    } catch (error) {
      setLaunchState(undefined);
      console.error("Error creating premarket:", error);
      notify.error("Error creating: premarket is not created in blockchain", {
        suggest: "Please, wait and try again",
      });
    }
    setLaunchState(undefined);
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
    console.error(`tx ${txId} is not finished: ${resp.value.err?.toString?.() ?? JSON.stringify(resp.value.err)}`);
    return false;
  };

  const handleOnDone = async () => {
    console.log("handleOnDone move to page:", `/premarket/${premarketPDA}`);
    await clearDraft(storageKey); // очистить черновик после успеха
    router.push(`/token/${premarketPDA}`);
  };

  const getTokenData = (): TokenCreateFullData | undefined => {
    if (tokenMainData === undefined || customizeTokenData === undefined || tokenomicsData === undefined) {
      return undefined;
    }
    return {
      mainData: tokenMainData,
      customData: customizeTokenData,
      tokenomicsData: tokenomicsData
    };
  };
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.shadow,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <View style={{ maxWidth: 500, maxHeight: 1000, width: '100%', height: isMobile ? '100%' : '85%' }}>
        {step === FLOW_STEP.TOKEN_BASE_INFO && (
          <CreateTokenForm
            onNext={handleAfterSetTokenBaseInfo}
            step={1}
            totalSteps={4}
            presetData={tokenMainData}
          />
        )}

        {step === FLOW_STEP.TOKENOMICS && (
          <EditTokenomicsForm
            onBack={()=>setStep(FLOW_STEP.TOKEN_BASE_INFO)}
            onNext={handleAfterTokenomics}
            step={2}
            totalSteps={4}
            presetData={tokenomicsData}
          />
        )}

        {step === FLOW_STEP.PREMARKET_SETTINGS && (
          <EditPremarketSettingsForm
            onBack={()=>setStep(FLOW_STEP.TOKENOMICS)}
            onNext={handleAfterPremarketSettings}
            step={3}
            totalSteps={4}
            presetData={premarketSettingsData}
          />
        )}

        {step === FLOW_STEP.CUSTOMIZE_TOKEN && (
          <CustomizeTokenForm
            onBack={()=>setStep(FLOW_STEP.PREMARKET_SETTINGS)}
            onNext={handleAfterCunstomizeToken}
            steps={{ current: 4, total: 4 }}
            presetData={customizeTokenData}
          />
        )}

        {step === FLOW_STEP.OVERVIEW && (
          <OverviewPremarketCreation
            onBack={()=>setStep(FLOW_STEP.CUSTOMIZE_TOKEN)}
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
