import { TokenMainInfo } from "@api/token";
import { RoundIconLink } from "@components/premarket/RoundIcons";
import { useIsMobileForTwoScreenWithDemention } from "@hooks/useIsMobile";
import { getTimeLeftLabel } from "@utils/premarket";
import { View, Image } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { ExpandableText } from '@components/base/ExpandableText';
import Svg, { Circle, Path } from 'react-native-svg';

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
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, fontSize: 15 }}>
            {/* CHANGE tokenMainInfo.premarketPubkey to tokenMainInfo.mintAddress later!!! */}
            {tokenMainInfo?.premarketPubkey ? truncateAddress(tokenMainInfo.premarketPubkey.toString()) : "No token address available!"} 
          </Text>
        )}
        {tokenMainInfo.state === 'finished' && (
          <Svg width={14} height={14} viewBox="0 0 12 12">
            <Path
              d="M10.9513 2.85078C10.9513 1.75312 10.0615 0.863281 8.96384 0.863281H3.76884C3.4996 0.863281 3.28134 1.08154 3.28134 1.35078C3.28134 1.62002 3.4996 1.83828 3.76884 1.83828H8.96384C9.52303 1.83828 9.97634 2.29159 9.97634 2.85078V8.6037C9.97634 8.87294 10.1946 9.0912 10.4638 9.0912C10.7331 9.0912 10.9513 8.87294 10.9513 8.6037V2.85078Z"
              fill={theme.colors.onSurfaceVariant}
            />
            <Path
              d="M8.71858 4.33231C8.71858 3.64886 8.16453 3.09481 7.48108 3.09481H2.28608C1.60263 3.09481 1.04858 3.64886 1.04858 4.33231V9.89992C1.04858 10.5834 1.60263 11.1374 2.28608 11.1374H7.48108C8.16453 11.1374 8.71858 10.5834 8.71858 9.89992V4.33231ZM7.48108 4.06981C7.62606 4.06981 7.74358 4.18734 7.74358 4.33231V9.89992C7.74358 10.0449 7.62606 10.1624 7.48108 10.1624H2.28608C2.14111 10.1624 2.02358 10.0449 2.02358 9.89992V4.33231C2.02358 4.18734 2.14111 4.06981 2.28608 4.06981H7.48108Z"
              fill={theme.colors.onSurfaceVariant}
            />
          </Svg>
        )}
        <Text variant="bodySmall" style={{ color: theme.colors.secondary, fontWeight: '100', fontSize: 13 }}>
          {deadlineText}
        </Text>
        {(tokenMainInfo.state === 'premarket' || tokenMainInfo.state === 'canceled') && (
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Circle
              cx="12"
              cy="12"
              r="9"
              stroke="#666666"
              strokeWidth="1.5"
              fill="transparent"
            />
            <Path
              d="M12,13c0-2,3-1,3-4S9,6,9,9"
              stroke="#666666"
              strokeWidth="2"
              fill="transparent"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M12.05,17 L11.95,17"
              stroke="#666666"
              strokeWidth="2"
              fill="transparent"
              strokeLinecap="round"
            />
          </Svg>
        )}
      </View>
    </View>
  );
}

