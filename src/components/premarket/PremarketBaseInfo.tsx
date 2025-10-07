import { TokenMainInfo, TokenDynamicInfo } from "@api/token";
import { RoundIconLink } from "@components/premarket/RoundIcons";
import { useIsMobileForTwoScreenWithDemention } from "@hooks/useIsMobile";
import { getTimeLeftLabel } from "@utils/premarket";
import shortString from "@utils/address_shorter";
import { View, Image } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { ExpandableText } from '@components/base/ExpandableText';
import { SvgIcon } from '@components/base/SvgIcon';
import { ChipDisplay } from '@components/ui/Chip';  

interface PremarketBaseInfoProps {
  tokenMainInfo: TokenMainInfo;
  tokenDynamicInfo: TokenDynamicInfo;
  isMobile: boolean
}

export function PremarketBaseInfo({ tokenMainInfo, tokenDynamicInfo, isMobile}: PremarketBaseInfoProps) {
  const theme = useTheme();
  const { left } = useIsMobileForTwoScreenWithDemention();

  // Determine the effective state based on conditions
  const getEffectiveState = () => {
    const now = Math.floor(Date.now() / 1000);
    const isPremarket = tokenMainInfo.state === 'premarket';
    const isDeadlinePassed = tokenMainInfo.premarketDeadline < now;
    const isGoalNotReached = tokenDynamicInfo.reservedSolLamp.lt(tokenMainInfo.premarketGoalSolLamp);
    
    // If it's premarket and deadline passed and goal reached, show "times_up"
    if (isPremarket && isDeadlinePassed && !isGoalNotReached) {
      return 'times_up';
    }
    if (isPremarket && isDeadlinePassed && isGoalNotReached) {
      return 'expired';
    }
    
    return tokenMainInfo.state;
  };

  const button = (state: "premarket" | "canceled" | "finished" | "times_up" | "expired") => {
    return state === 'premarket' ? 
    (<ChipDisplay
      variant="secondary"
      size="normal"
      mode="flat"
    >Premarket</ChipDisplay>
    ) : state === 'finished' ? (
    <ChipDisplay
      variant="primary"
      size="normal"
      mode="flat"
    >Launched</ChipDisplay>
  ) : state === 'canceled' ? (
    <ChipDisplay
      variant="error"
      size="normal"
      mode="flat"
    >Refunded</ChipDisplay>
  ) : state === 'times_up' ? (
    <ChipDisplay
      variant="primary"
      size="normal"
      mode="flat"
    >Times Up</ChipDisplay>
  ) : state === 'expired' ? (
    <ChipDisplay
      variant="primary"
      size="normal"
      mode="flat"
    >Expired</ChipDisplay>
  ) : (
    <ChipDisplay
      variant="primary"
      size="normal"
      mode="flat"
    >{state}</ChipDisplay>
  ) 
  }
  let deadlineText = ""

  if (tokenMainInfo.state === "premarket") {
    const deadline = getTimeLeftLabel(tokenMainInfo.premarketDeadline)
    deadlineText = deadline === 'Expired' ? "reached deadline":  deadline+" left"
  }

  return (
    <View style={{ gap: 16, paddingHorizontal: isMobile?16:24, paddingVertical: isMobile?0:24,}}>
      {!!tokenMainInfo.imageURL && (
        <View style={{paddingHorizontal: isMobile?24:0, paddingBottom: 8, paddingTop: 0}}>
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
          <Text variant="headlineSmall" style={{color:theme.colors.onSurface}}>{tokenMainInfo?.name}</Text>
          <Text variant="labelLarge" style={{color:theme.colors.onSurfaceVariant}}>{tokenMainInfo?.symbol}</Text>
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
              withoutBackgroud={true}
            />
          )}
          {tokenMainInfo?.links.webSite !== undefined && (
            <RoundIconLink
              name="world-outlined"
              colors={theme.colors}
              link={tokenMainInfo.links.webSite}
              withoutBackgroud={true}
            />
          )}
          {tokenMainInfo?.links.telegram !== undefined && (
            <RoundIconLink
              name="tg-logo"
              colors={theme.colors}
              link={tokenMainInfo.links.telegram}
              withoutBackgroud={true}
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
        {button(getEffectiveState())}
        {tokenMainInfo.state === 'finished' && (
            <Text variant="labelLarge">
            {/* CHANGE tokenMainInfo.premarketPubkey to tokenMainInfo.mintAddress later!!! */}
            {tokenMainInfo?.token_mint ? shortString(tokenMainInfo.token_mint) : "No token address available!"} 
          </Text>
        )}
        {tokenMainInfo.state === 'finished' && (
          <SvgIcon 
            name="copy-icon" 
            size={14} 
            color={theme.colors.onSurfaceVariant} 
          />
        )}
        <Text variant="labelLarge" style={{color:theme.colors.secondary}}>
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

