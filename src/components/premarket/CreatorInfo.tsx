import { premarketFinished, TokenMainInfo } from "@api/token";
import { finishPremarket, refundPremarket } from "@services/blockchain/premarket/finishPremarket";
import { getTimeLeftLabel } from "@utils/premarket";
import { useAuth, UserInfo } from "@providers/AuthContext";
import { useWallet } from "@storage/wallet-adapter";
import { useAnchorWalletSafe } from "@storage/wallet-adapter/useWallet.web";
import { useNetwork } from "@providers/NetworkContext";
import { getSolanaConnection } from "@services/blockchain/solana";
import { useNotification } from "@storage/NotificationContext";
import { useOverlay } from "@storage/UniversalOverlayProvider";

import { Linking, View } from "react-native";
import { Text, ActivityIndicator, useTheme } from "react-native-paper";
import {Button} from '@components/ui/Button'
import { ShareTextButton } from "@components/base/ButtonShare";
import { SvgIcon } from "@components/base/SvgIcon";


interface CreatorInfoProps {
  tokenMainInfo: TokenMainInfo;
  isGoalReached: boolean;
  onUpdated: () => Promise<void>;
  isDeadLine: boolean;
  currentURL: string;
}

export function CreatorInfo({ tokenMainInfo, onUpdated, isDeadLine, isGoalReached, currentURL}: CreatorInfoProps) {
  const { colors } = useTheme();
  const now = Math.floor(Date.now() / 1000);

  const notify = useNotification();
  const { network } = useNetwork();
  const connection = getSolanaConnection(network);
  const { connected, connect } = useWallet();
  const wallet = useAnchorWalletSafe();
  const { open, replace, close } = useOverlay();

  const renderLoader = (status: string) => (
    <View style={{ gap: 20 }}>
      <Text variant="titleMedium">{status}</Text>
      <ActivityIndicator animating color={colors.primary} size="large" />
    </View>
  );

  const handleRefund = async () => {
    if (!wallet || !connected) {
      notify.error("Wallet is not connected", {
        suggest: "Enable Phantom (or compatible) and try again",
        action: {
          label: "Connect",
          onAction: async () => {
            try {
              await connect();
            } catch (e) {
              console.log("connect error:", e);
            }
          },
        },
      });
      return;
    }
    if (wallet.publicKey.toBase58() !== tokenMainInfo.createdByPubkey) {
      notify.error("Only the creator can refund the premarket");
      return;
    }
    if (network === 'testnet') {
      notify.error("testnet is not supported");
      return;
    }


    try {
      open(renderLoader("Refunding premarket..."));
      const res = await refundPremarket(
        wallet,
        connection,
        network,
        tokenMainInfo.premarketPubkey,
        (text) => {replace(renderLoader(text))}
      );
      open(renderLoader("link data to Revelcy..."));
      await premarketFinished({
        premarketPubKey: tokenMainInfo.premarketPubkey.toString(),
        userWallet: wallet.publicKey.toString(),
        tx: res.txId,
        isKilled: true,
        network: network
      })


      notify.success("Premarket successfully refunding!", {action: {
        label: "check",
        onAction: ()=> {
          Linking.openURL(`https://solscan.io/tx/${res.txId}?cluster=devnet`)
        }
      }});
      close();
      onUpdated()
    } catch (e) {
      console.error("refund premarket error:", e);
      notify.error("Failed to refund premarket");
      close();
    }
  };
  
  const handleExtended = async () => {
      notify.error("is not implemented", {
        suggest: "ask admin to extend",
      });
      return;
  };

  const handleFinish = async () => {
    // if (tokenMainInfo.premarketDeadline > now) {
    //   notify.warning(
    //     `Finish will be available in ${getTimeLeftLabel(tokenMainInfo.premarketDeadline)}`
    //   );
    //   return;
    // }

    notify.info("Skipped deadline check")


    if (!wallet || !connected) {
      notify.error("Wallet is not connected", {
        suggest: "Enable Phantom (or compatible) and try again",
        action: {
          label: "Connect",
          onAction: async () => {
            try {
              await connect();
            } catch (e) {
              console.log("connect error:", e);
            }
          },
        },
      });
      return;
    }
    if (wallet.publicKey.toBase58() !== tokenMainInfo.createdByPubkey) {
      notify.error("Only the creator can finish the premarket");
      return;
    }
    if (network === 'testnet') {
      notify.error("testnet is not supported");
      return;
    }

    try {
      open(renderLoader("Finishing premarket..."));
      const res = await finishPremarket(
        wallet,
        connection,
        network,
        tokenMainInfo.premarketPubkey,
        (text) => {replace(renderLoader(text))}
      );
      premarketFinished({
        premarketPubKey: tokenMainInfo.premarketPubkey.toString(),
        userWallet: wallet.publicKey.toString(),
        tx: res.txId,
        isKilled: false,
        network: network
      })


      notify.success("Premarket successfully finished!", {action: {
        label: "check",
        onAction: ()=> {
          Linking.openURL(`https://solscan.io/tx/${res.txId}?cluster=devnet`)
        }
      }});
      close();
      onUpdated();
    } catch (e) {
      console.error("finish premarket error:", e);
      notify.error("Failed to finish premarket");
      close();
    }
  };

  
  if (isDeadLine && !isGoalReached) {
    return (
    <View style={{gap: 48}}>
      <View style={{flexDirection:'row', gap:16, width:'100%'}}>
        <Button style={{flex:1}} variant="error" 
          mode="elevated"
          onPress={handleRefund}>Refund all</Button>
        <Button style={{flex:1}} variant='primary' 
          mode="elevated"
          onPress={handleExtended}>Extend</Button>
      </View>
      <View style={{flexDirection:'row', gap:16, alignContent:'center', justifyContent:'flex-start' }}>
        <SvgIcon name='info-circle' size={24} color={colors.error} />
        <View style={{flex: 1, gap:8, alignContent:'flex-start', justifyContent:'center' }}>
          <Text variant='bodyMedium' selectionColor={colors.onSurfaceVariant} numberOfLines={2}>You have 48 hours left to either extend the deadline or refund everyone</Text>
          <Text variant='bodyMedium' selectionColor={colors.onSurfaceVariant} numberOfLines={2}>If you take no action, people will be automatically refunded</Text>
        </View>
      </View>
    </View>
    )
  }
  if (isDeadLine && isGoalReached) {
    return <View style={{flexDirection:'row', gap:16, width:'100%'}}>
      <Button leftSvgIconName='pumpfun' style={{flex:3}} variant='primary' 
        onPress={handleFinish}>Launch on Pump</Button>
      <ShareTextButton style={{flex: 1}} shareMessage={`Join to premarket on: ${currentURL}`}/>
    </View>
  }

  return (
      <View style={{flexDirection:'row', gap:16, alignContent:'center', justifyContent:'flex-start' , width:'100%'}}>
          <SvgIcon name='info-circle' size={24} color={colors.primary} />
          <View style={{flex: 1, gap:8, alignContent:'flex-start', justifyContent:'center' }}>
            <Text variant='bodyMedium' selectionColor={colors.onSurfaceVariant} numberOfLines={2}> Finish will be able in {getTimeLeftLabel(tokenMainInfo.premarketDeadline)}</Text>
          </View>
          
      <ShareTextButton shareMessage={`Join to premarket on: ${currentURL}`}/>
      </View>
  );
}
