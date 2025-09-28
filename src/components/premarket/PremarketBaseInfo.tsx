import { TokenMainInfo } from "@api/token";
import { RoundIconLink } from "@components/premarket/RoundIcons";
import { useIsMobileForTwoScreenWithDemention } from "@hooks/useIsMobile";
import { getTimeLeftLabel } from "@utils/premarket";
import { View, Image } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { ExpandableText } from '@components/base/ExpandableText';

interface PremarketBaseInfoProps {
  tokenMainInfo: TokenMainInfo;
  isMobile: boolean
}

export function PremarketBaseInfo({ tokenMainInfo, isMobile}: PremarketBaseInfoProps) {
  const theme = useTheme();
  const { left } = useIsMobileForTwoScreenWithDemention();


  const button = (state: "premarket" | "canceled" | "finished") => {
    return state === 'premarket' ? 
    (<Button
      textColor={theme.colors.secondary}
      buttonColor={theme.colors.onSecondary}
      focusable={false}
    >Premarket</Button>
    ) : state === 'finished' ? (
    <Button
      textColor={theme.colors.onPrimary}
      buttonColor={theme.colors.primary}
      focusable={false}
    >Launched</Button>
  ) : state === 'canceled' ? (
    <Button
      textColor={theme.colors.onError}
      buttonColor={theme.colors.error}
      focusable={false}
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
          gap: 16,
        }}
      >
        {button(tokenMainInfo.state)}
        <Text variant="labelLarge" style={{ color: theme.colors.secondary }}>
          {deadlineText}
        </Text>
      </View>
    </View>
  );
}

