import { TokenMainInfo, TokenDynamicInfo } from "@api/token";
import { RoundIconLink } from "@components/premarket/RoundIcons";
import { useIsMobileForTwoScreenWithDemention } from "@hooks/useIsMobile";
import { getTimeLeftLabel } from "@utils/premarket";
import shortString from "@utils/address_shorter";
import { View, Image, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { ExpandableText } from '@components/base/ExpandableText';
import { SvgIcon, SvgIconButton } from '@components/base/SvgIcon';
import { ChipDisplay } from '@components/ui/Chip';
import { QuestionMarkModal } from "@components/modals/QuestionMarkModal";
import { useState } from "react";  
import { tr } from "react-native-paper-dates";
import { tryCopy } from "@utils/actions";

interface PremarketBaseInfoProps {
  tokenMainInfo: TokenMainInfo;
  isMobile: boolean
}

export function PremarketBaseInfo({ tokenMainInfo, isMobile}: PremarketBaseInfoProps) {
  const theme = useTheme();
  const { left } = useIsMobileForTwoScreenWithDemention();
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  const stateChip = (state: "premarket" | "canceled" | "finished" | "times_up" | "expired") => {
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
      variant="error"
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
    deadlineText = deadline === 'Expired' ? "" :  deadline+" left"
  }

  return (
    <View style={{ 
      gap: 16, 
      paddingHorizontal: isMobile?16:24, 
      paddingTop: isMobile?0:24,
      width: '100%',
      }}>
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
        {stateChip(tokenMainInfo.state)}
        {tokenMainInfo.state === 'finished' && (
          <TouchableOpacity
            onPress={() => {
              if (!tokenMainInfo.tokenMint) return;
              tryCopy(tokenMainInfo.tokenMint);
            }}
            >
            <Text variant="labelLarge">
              {tokenMainInfo.tokenMint ? shortString(tokenMainInfo.tokenMint) : "No token address available!"} 
            </Text>
            <SvgIcon 
              name="copy-icon" 
              size={14} 
              color={theme.colors.onSurfaceVariant} 
            />
          </TouchableOpacity>
        )}
        {deadlineText && (
          <Text variant="labelLarge" style={{color: theme.colors.secondary}}>
            {deadlineText}
          </Text>
        )}
        {(tokenMainInfo.state === 'premarket' || tokenMainInfo.state === 'canceled') && (
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <SvgIconButton 
              name="question-mark-circle" 
              size={24} 
              color={theme.colors.outline}
              onPress={() => setShowQuestionModal(true)}
            />
          </View>
        )}
      </View>
      
      <QuestionMarkModal 
        visible={showQuestionModal} 
        onClose={() => setShowQuestionModal(false)} 
      />
    </View>
  );
}

