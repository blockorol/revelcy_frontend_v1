import { TokenMainInfo } from "@api/token";
import { RoundIconLink } from "@components/premarket/RoundIcons";
import { useIsMobileForTwoScreenWithDemention } from "@hooks/useIsMobile";
import { getTimeLeftLabel } from "@utils/premarket";
import shortString from "@utils/address_shorter";
import { View, Image } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { ExpandableText } from '@components/base/ExpandableText';
import Svg, { Circle, Path } from 'react-native-svg';
import { SvgIcon } from '@components/base/SvgIcon';  

interface PremarketBaseInfoProps {
  tokenMainInfo: TokenMainInfo;
  isMobile: boolean
}

export function PremarketBaseInfo({ tokenMainInfo, isMobile}: PremarketBaseInfoProps) {
  const theme = useTheme();
  const { left } = useIsMobileForTwoScreenWithDemention();

  // Function to truncate address/identifier
  const truncateAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const button = (state: "premarket" | "canceled" | "finished") => {
    return state === 'premarket' ? 
    (<Button
      textColor={theme.colors.secondary}
      buttonColor={theme.colors.onSecondary}
      focusable={false}
      style={{ borderRadius: 10 }}
      contentStyle={{marginLeft:8, marginRight:8, maxHeight:30}}
      labelStyle={{fontSize:15, fontWeight: 'bold'}}
    >Premarket</Button>
    ) : state === 'finished' ? (
    <Button
      textColor={theme.colors.primary}
      buttonColor={theme.colors.onPrimary}
      focusable={false}
      style={{ borderRadius: 10 }}
      contentStyle={{marginLeft:8, marginRight:8, maxHeight:30}}
      labelStyle={{fontSize:15, fontWeight: 'bold'}}
    >Launched</Button>
  ) : state === 'canceled' ? (
    <Button
      textColor={theme.colors.error}
      buttonColor={theme.colors.onError}
      focusable={false}
      style={{ borderRadius: 10 }}
      contentStyle={{marginLeft:8, marginRight:8, maxHeight:30}}
      labelStyle={{fontSize:15, fontWeight: 'bold'}}
    >Refunded</Button>
  ) : (
    <Button
      textColor={theme.colors.onPrimary}
      buttonColor={theme.colors.primary}
      focusable={false}
    >{state}</Button>
  ) 
  }
  let deadlineText = ""

  if (tokenMainInfo.state === "premarket") {
    const deadline = getTimeLeftLabel(tokenMainInfo.premarketDeadline)
    deadlineText = deadline === 'Expired' ? "reached deadline":  deadline+" left"
  }

  return (
    <View style={{ gap: 16, padding: isMobile?16:24}}>
      {!!tokenMainInfo.imageURL && (
        <View style={{padding: isMobile?24:0, paddingBottom: 18,}}>
          <Image
            source={{ uri: tokenMainInfo.imageURL }}
            style={{
              width: '100%',
              aspectRatio: 1,
              borderRadius: 20,
              backgroundColor:  'transparent',
            }}
          />
        </View>
      )}
      <View
        style={{
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        <View style={{ gap: 4}}>
          <Text variant="headlineSmall"> {tokenMainInfo?.name}</Text>
          <Text variant="labelLarge"> {tokenMainInfo?.symbol}</Text>
        </View>
        <View
          style={{
            justifyContent: "center",
            alignItems: "flex-start",
            flexDirection: "row",
            gap: 8,
          }}
        >
          {tokenMainInfo?.links.twitter !== undefined && (
            <RoundIconLink
              name="x-logo"
              colors={theme.colors}
              link={tokenMainInfo.links.twitter}
            />
          )}
          {tokenMainInfo?.links.webSite !== undefined && (
            <RoundIconLink
              name="world-outlined"
              colors={theme.colors}
              link={tokenMainInfo.links.webSite}
            />
          )}
          {tokenMainInfo?.links.telegram !== undefined && (
            <RoundIconLink
              name="tg-logo"
              colors={theme.colors}
              link={tokenMainInfo.links.telegram}
            />
          )}
        </View>
      </View>
      <ExpandableText text={tokenMainInfo.description} maxLineExpanded={2} />
      <View
        style={{
          width: left.width - 48,
          justifyContent: "flex-start",
          alignItems: "center",
          flexDirection: "row",
          gap: 10,
        }}
      >
        {button(tokenMainInfo.state)}
        {tokenMainInfo.state === 'finished' && (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, fontSize: 15, fontStyle: 'Inter_500' }}>
            {/* CHANGE tokenMainInfo.premarketPubkey to tokenMainInfo.mintAddress later!!! */}
            {tokenMainInfo?.premarketPubkey ? shortString(tokenMainInfo.premarketPubkey.toString()) : "No token address available!"} 
          </Text>
        )}
        {tokenMainInfo.state === 'finished' && (
          <SvgIcon 
            name="copy-icon" 
            size={14} 
            color={theme.colors.onSurfaceVariant} 
          />
        )}
        <Text variant="bodySmall" style={{ color: theme.colors.secondary, fontWeight: '100', fontSize: 16, fontStyle: 'Inter_500' }}>
          {deadlineText}
        </Text>
        {(tokenMainInfo.state === 'premarket' || tokenMainInfo.state === 'canceled') && (
          <SvgIcon 
          name="question-mark-circle" 
          size={24} 
          color="#938F9566" 
        />
        )}
      </View>
    </View>
  );
}

