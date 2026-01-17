import { TokenMainInfo, updateTokenAvailbility } from "@api/token";
import { finishPremarket, refundPremarket } from "@services/blockchain/premarket/finishPremarket";
import { extendPremarket } from "@services/blockchain/premarket/extendPremarket";
import { useAuth } from "@providers/AuthContext";
import { useWallet } from "@storage/wallet-adapter";
import { useAnchorWalletSafe } from "@storage/wallet-adapter/useWallet.web";
import { useNetwork } from "@providers/NetworkContext";
import { getSolanaConnection } from "@services/blockchain/solana";
import { useNotification } from "@providers/NotificationContext";
import { useOverlay } from "@storage/UniversalOverlayProvider";

import { Linking, View, StyleSheet} from "react-native";
import { Text, useTheme, HelperText, Portal, Modal} from "react-native-paper";
import {Button} from '@components/ui/Button'
import { ShareTextButton } from "@components/base/ButtonShare";
import { SvgIcon } from "@components/base/SvgIcon";
import { DatePickerMD3FromCalendar } from "@components/base/DatePickerMD3";
import TimePickerMD3, { TimeValue } from "@components/base/TimePickerMD3";
import { useState } from "react";
import { Switch } from "@components/ui/Switch";
import { AppTheme } from "@theme/types";
import { uploadTokenMetadataToIPFS } from "@services/files/ipfs/pumpfun";
import { updateUriPremarket } from "@services/blockchain/premarket/updateUriPremarket";
import CreateTokenForm from "@components/token/create/CreateTokenForm";
import { TokenMainData } from "@components/token/create/interface";
import TextedLoader from "@components/ui/Loader";

interface CreatorInfoProps {
  tokenMainInfo: TokenMainInfo;
  isGoalReached: boolean;
  onUpdated: () => Promise<void>;
  isDeadLine: boolean;
  currentURL: string;
}

export function CreatorInfo({ tokenMainInfo, onUpdated, isDeadLine, isGoalReached, currentURL}: CreatorInfoProps) {
  const { colors } = useTheme();

  const notify = useNotification();
  const { network } = useNetwork();
  const connection = getSolanaConnection(network);
  const { connected, connect } = useWallet();
  const wallet = useAnchorWalletSafe();
  const { open, replace, close: closeOverlay } = useOverlay();
  const { user } = useAuth();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEditLink, setShowEditLink] = useState(false);
  const closEditLinkOpen = () => {setShowEditLink(false)}

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
      open(<TextedLoader text ={"Refunding premarket..."}/>);
      const res = await refundPremarket(
        wallet,
        connection,
        network,
        tokenMainInfo.premarketPubkey,
        (text) => {replace(<TextedLoader text ={text}/>)}
      );
      closeOverlay();
      notify.success("Premarket successfully refunding!", {action: {
        label: "check",
        onAction: ()=> {
          Linking.openURL(`https://solscan.io/tx/${res.txId}${network === 'devnet' ? '?cluster=devnet' : ''}`)
        }
      }});
      onUpdated();
    } catch (e) {
      console.error("refund premarket error:", e);
      notify.error("Failed to refund premarket");
      closeOverlay();
    }
  };
  
  const handleExtended = () => {
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
      notify.error("Only the creator can extend the premarket");
      return;
    }
    if (network === 'testnet') {
      notify.error("testnet is not supported");
      return;
    }

    // Show calendar to pick new deadline
    setShowDatePicker(true);
  };

  const handleDateConfirm = (date: Date) => {
    if (!date) {
      return;
    }

    // Validate date is not more than 1 week from now
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const selectedTime = date.getTime();

    // Check if date is in the past
    if (selectedTime+ONE_DAY_MS < now) {
      notify.error("Deadline must be in the future");
      return;
    }

    // Check if date is more than 1 week away
    if (selectedTime > now + ONE_WEEK_MS) {
      notify.error("Premarket deadline is longer than one week from now");
      return;
    }

    setShowDatePicker(false);
    setSelectedDate(date);
    setShowTimePicker(true);
  };

  const handleTimeConfirm = async (time: TimeValue) => {
    setShowTimePicker(false);

    if (!wallet || !connected || !selectedDate) {
      return;
    }

    if (!user?.userId) {
      notify.error("User must be logged in to extend premarket deadline");
      setSelectedDate(null);
      return;
    }

    // Combine selected date with selected time
    const finalDate = new Date(selectedDate);
    finalDate.setHours(time.hour);
    finalDate.setMinutes(time.minute);
    finalDate.setSeconds(0);

    const ONE_HOUR_MS = 60 * 60 * 1000;
    const now = Date.now();
    const selectedTime = finalDate.getTime();

    // Validate selected date/time
    if (selectedTime <= now + ONE_HOUR_MS) {
      notify.error("Deadline must be at least 1 hour from now");
      setSelectedDate(null);
      return;
    }



    // Convert milliseconds to seconds (Unix timestamp)
    const newDeadline = Math.floor(selectedTime / 1000);

    console.log("newDeadline", newDeadline);

    // Type guard: network is already checked to not be 'testnet' in handleExtended
    if (network === 'testnet') {
      notify.error("testnet is not supported");
      setSelectedDate(null);
      return;
    }

    try {
      open(<TextedLoader text ={"Extending premarket deadline..."}/>);
      const res = await extendPremarket(
        wallet,
        connection,
        network,
        tokenMainInfo.premarketPubkey,
        newDeadline,
        (text) => {replace(<TextedLoader text ={text}/>)}
      );

      notify.success("Premarket deadline successfully extended!", {action: {
        label: "check",
        onAction: ()=> {
          Linking.openURL(`https://solscan.io/tx/${res.txId}${network === 'devnet' ? '?cluster=devnet' : ''}`)
        }
      }});
      onUpdated();
    } catch (e) {
      console.error("extend premarket error:", e);
      notify.error("Failed to extend premarket deadline");
    } finally {
      closeOverlay();
      setSelectedDate(null);
    }
  };
  

  const handleFinish = async () => {
    // const now = Math.floor(Date.now() / 1000);
    // if (tokenMainInfo.premarketDeadline > now) {
    //   notify.warning(
    //     `Finish will be available in ${getTimeLeftLabel(tokenMainInfo.premarketDeadline)}`
    //   );
    //   return;
    // }

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
      open(<TextedLoader text ={"Finishing premarket..."}/>);
      const res = await finishPremarket(
        wallet,
        connection,
        network,
        tokenMainInfo.premarketPubkey,
        (text) => {replace(<TextedLoader text ={text}/>)}
      );

      notify.success("Premarket successfully finished!", {action: {
        label: "check",
        onAction: ()=> {
          Linking.openURL(`https://solscan.io/tx/${res.txId}${network === 'devnet' ? '?cluster=devnet' : ''}`)
        }
      }});
    } catch (e) {
      console.error("finish premarket error:", e);
      notify.error("Failed to finish premarket");
    } finally {
      closeOverlay();
      onUpdated();
    }
  };

  
  if (isDeadLine && !isGoalReached) {
    return (
    <>
      <View style={{gap: 48}}>
        <View style={{flexDirection:'row', gap:16, width:'100%'}}>
          <Button style={{flex:1}} variant="error" 
            mode="contained"
            onPress={handleRefund}>Refund all</Button>
          {tokenMainInfo.isExtended ? null : <Button style={{flex:1}} variant='primary' 
            mode="contained"
            onPress={handleExtended}>Extend</Button>}
        </View>
        {(tokenMainInfo.state !== 'finished' && tokenMainInfo.state !== 'canceled') &&
          <View style={{flexDirection:'row', gap:16, width:'100%'}}>
            <Button style={{flex:1}} variant='primary' 
              mode="contained"
              onPress={()=>setShowEditLink(true)}>Edit links</Button>
          </View>
        }

        {tokenMainInfo.isExtended ? null :
        <View style={{flexDirection:'row', gap:16, alignContent:'center', justifyContent:'flex-start' }}>
          <SvgIcon name='info-circle' size={24} color={colors.error} />
          <View style={{flex: 1, gap:8, alignContent:'flex-start', justifyContent:'center' }}>
            <Text variant='bodyMedium' selectionColor={colors.onSurfaceVariant} numberOfLines={2}>You have 48 hours left to either extend the deadline or refund everyone</Text>
            <Text variant='bodyMedium' selectionColor={colors.onSurfaceVariant} numberOfLines={2}>If you take no action, people will be automatically refunded</Text>
          </View>
        </View>
        }
      </View>

      {/* Date Picker for Extending Deadline */}
      <DatePickerMD3FromCalendar
        visible={showDatePicker}
        date={new Date()}
        onDismiss={() => setShowDatePicker(false)}
        onConfirm={handleDateConfirm}
        label="Select new deadline"
      />

      {/* Time Picker for Extending Deadline */}
      <TimePickerMD3
        visible={showTimePicker}
        value={selectedDate || undefined}
        onDismiss={() => {
          setShowTimePicker(false);
          setSelectedDate(null);
        }}
        onConfirm={handleTimeConfirm}
        label="Pick time"
      />
      <EditLinksModal visible={showEditLink} onClose={closEditLinkOpen} tokenMainInfoPreset={tokenMainInfo} onUpdated={onUpdated} />

      <VisabilitySwitch
        isDiscoverablePreset={!tokenMainInfo.isHided}
        shortLink={tokenMainInfo.shortLinkPrefix?"https://beta.revelcy.com/token/"+tokenMainInfo.shortLinkPrefix:undefined}
        premarketPubkey={tokenMainInfo.premarketPubkey.toString()}
        onUpdated={onUpdated}
      />
    </>
    )
  }
  if (isGoalReached) {
  // if (isDeadLine && isGoalReached) {
    return (
      <View style={{ gap:16, width:'100%'}}>
        <View style={{flexDirection:'row'}}>
          <Button leftSvgIconName='pumpfun' style={{flex:3}} variant='primary' 
            onPress={handleFinish}>Launch on Pump</Button>
          <ShareTextButton style={{flex: 1}} shareMessage={`Join to premarket on: ${currentURL}`}/>
        </View>
        {(tokenMainInfo.state !== 'finished' && tokenMainInfo.state !== 'canceled') &&
          <View style={{flexDirection:'row', gap:16, width:'100%'}}>
            <Button style={{flex:1}} variant='primary' 
              mode="contained"
              onPress={()=>setShowEditLink(true)}>Edit links</Button>
          </View>
        }

        <EditLinksModal visible={showEditLink} onClose={closEditLinkOpen} tokenMainInfoPreset={tokenMainInfo} onUpdated={onUpdated} />

        <VisabilitySwitch
          isDiscoverablePreset={!tokenMainInfo.isHided}
          shortLink={tokenMainInfo.shortLinkPrefix?"https://beta.revelcy.com/token/"+tokenMainInfo.shortLinkPrefix:undefined}
          premarketPubkey={tokenMainInfo.premarketPubkey.toString()}
          onUpdated={onUpdated}
        />
      </View>
    )
  }

  return (
    <View style={{gap:16, width:'100%'}}>
        <ShareTextButton style={{width:'100%'}} shareMessage={`Join to premarket on: ${currentURL}`}>Share</ShareTextButton>
        {(tokenMainInfo.state !== 'finished' && tokenMainInfo.state !== 'canceled') &&
          <View style={{flexDirection:'row', gap:16, width:'100%'}}>
            <Button style={{flex:1}} variant='primary' 
              mode="contained"
              onPress={()=>setShowEditLink(true)}>Edit links</Button>
          </View>
        }
        <View style={{flexDirection:'row', gap:16, alignItems:'center'}}>
          <SvgIcon name='info-circle' size={24} color={colors.primary} />
          <Text variant='bodyMedium' selectionColor={colors.onSurfaceVariant} numberOfLines={2}>You can finalize the Premarket once the goal is reached.</Text>
          {/* <Text variant='bodyMedium' selectionColor={colors.onSurfaceVariant} numberOfLines={2}>You can finalize the Premarket in {getTimeLeftLabel(tokenMainInfo.premarketDeadline)}, after deadline passes.</Text> */}
        </View>
        {(tokenMainInfo.state !== 'finished' && tokenMainInfo.state !== 'canceled') &&
           <EditLinksModal visible={showEditLink} onClose={closEditLinkOpen} 
            tokenMainInfoPreset={tokenMainInfo} onUpdated={onUpdated} />
        }

        
        <VisabilitySwitch
          isDiscoverablePreset={!tokenMainInfo.isHided}
          shortLink={tokenMainInfo.shortLinkPrefix?"https://beta.revelcy.com/token/"+tokenMainInfo.shortLinkPrefix:undefined}
          premarketPubkey={tokenMainInfo.premarketPubkey.toString()}
          onUpdated={onUpdated}
        />
    </View>
  );
}


function VisabilitySwitch({isDiscoverablePreset, shortLink, premarketPubkey, onUpdated}: {
  premarketPubkey: string,
  isDiscoverablePreset: boolean,
  shortLink?: string,
  onUpdated: () => Promise<void>,
}) {
  const { colors } = useTheme<AppTheme>();
  const [isDiscoverable, setIsDiscoverable] = useState<boolean>(isDiscoverablePreset);
  const notify = useNotification();


  const changeAvailability = async () => {
    const newValue = !isDiscoverable;
    try {
      setIsDiscoverable(newValue);
      await updateTokenAvailbility(premarketPubkey, {
        isHided: !newValue,
      });
      onUpdated();
    } catch (e) {
      setIsDiscoverable(!newValue)
      console.error("change availability error:", e);
      notify.error("Failed to change availability to "+(newValue?"discoverable":"hidden"));
    }
  };


  return (
    <View>
      <View style={{
        paddingVertical: 16,
        paddingHorizontal: 12,
        backgroundColor: colors.surfaceContainerLow,
        borderRadius: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <Text variant='bodyMedium' selectionColor={colors.onSurface}>{isDiscoverable?"Your premarket is discoverable":"Your premarket is hidden"}</Text>
        <Switch value={isDiscoverable} onValueChange={changeAvailability}/>
      </View>
    <HelperText type="info" visible={!isDiscoverable}>
      Token is hidden from Discovery.
      {shortLink?"People can only find it via short link ("+shortLink+")":null}
    </HelperText>
  </View>);
}


function EditLinksModal({
  visible,
  onClose, 
  tokenMainInfoPreset, onUpdated}: {
  visible: boolean, 
  onClose: ()=>void,
  tokenMainInfoPreset: TokenMainInfo,
  onUpdated: () => Promise<void>;
}) {
  const notify = useNotification();
  const { network } = useNetwork();
  const {colors} = useTheme()
  const connection = getSolanaConnection(network);
  const { connected, connect } = useWallet();
  const wallet = useAnchorWalletSafe();
  const { open, replace, close: closeOverlay } = useOverlay();

    const handleUpdateURIConfirm = async (tokenMainInfo: TokenMainData) => {
    open(<TextedLoader text ={"Update premarket links..."}/>);
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
    if (wallet.publicKey.toBase58() !== tokenMainInfoPreset.createdByPubkey) {
      notify.error("Only the creator can finish the premarket");
      return;
    }
    if (network === 'testnet') {
      notify.error("testnet is not supported");
      return;
    }
    if (tokenMainInfo.avatar === undefined) {
      notify.error("Please add token avatar");
      return;

    }
    open(<TextedLoader text ={"Uploading data to IPFS..."}/>);
    
    try {
      const ipfsData = await uploadTokenMetadataToIPFS({
        avatar: tokenMainInfo.avatar,
        tokenInfo: {
          name: tokenMainInfo.tokenName,
          symbol: tokenMainInfo.tokenTicker,
          description: tokenMainInfo.description,
          links: {
            telegram: tokenMainInfo.links.telegram,
            twitter: tokenMainInfo.links.twitter,
            website: tokenMainInfo.links.website,
          },
        },
      });
      if (!ipfsData) {
        replace(<TextedLoader text ={"Failed to upload to IPFS..."}/>);
        notify.error("failed to upload data to IPFS", {
          suggest: "Please, try again later",
        });
        closeOverlay();
        return;
      }
      await updateUriPremarket(
        wallet, connection, network,
        tokenMainInfoPreset.premarketPubkey,
        ipfsData.metadataUri, 
        (text) => {replace(<TextedLoader text ={text}/>)}
      )
    } catch (e) {
      console.error("update links error:", e);
      notify.error("Failed to update links for premarket");
    } finally {
      closeOverlay();
      onUpdated();
    }
  }

  return (
    <Portal >
      <Modal
        style={{alignItems: 'center', justifyContent: 'center',}}
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={[styles.modalContainer]}>     
          <CreateTokenForm
            onNext={handleUpdateURIConfirm}
            onClose={onClose}
            step={1}
            totalSteps={4}
            presetData={{
              tokenName: tokenMainInfoPreset.name,
              tokenTicker: tokenMainInfoPreset.symbol,
              description: tokenMainInfoPreset.description,
              avatar: tokenMainInfoPreset.imageURL??"", 
              links: {
                telegram: tokenMainInfoPreset.links.telegram,
                twitter: tokenMainInfoPreset.links.twitter,
                website: tokenMainInfoPreset.links.webSite,
              }
            }}
          />
      </Modal>
    </Portal>
    
  )
}



const styles = StyleSheet.create({
  modalContainer: { 
    maxHeight: 700, 
    maxWidth: 600,
    padding: 24 
},
})