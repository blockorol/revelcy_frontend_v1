import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { IconName, SvgIcon } from '@components/base/SvgIcon';
import { TokenInfo } from '@api/token';
import {
  convertDecimalToToken,
  convertSmallCountToLamport,
  convertSolanaToTokenBuy,
  convertTimeStampToDataMonth,
  formatNumberCompact
} from '@utils/premarket';
import { AppTheme } from '@theme/types';
import { useJoinFlow } from '@hooks/useJoinFlow';
import { TextProminent } from '@components/ui/Text';
const avatarPlaceholder = require("@assets/avatar-placeholder.png");

const DEFAULT_BUY_AMOUNT = 0.5;
const DEFAULT_BUY_AMOUNT_LAMP = convertSmallCountToLamport(DEFAULT_BUY_AMOUNT);

interface Props {
  tokenInfo: TokenInfo;
  withJoinButton: boolean;
  onUpdated: ()=>void
}

const AvatarWithFallback: React.FC<{ uri?: string }> = ({ uri }) => {
  const [src, setSrc] = useState<ImageSourcePropType>(uri ? { uri } : avatarPlaceholder);

  useEffect(() => {
    setSrc(uri ? { uri } : avatarPlaceholder);
  }, [uri]);

  return (
    <Image
      source={src}
      style={styles.avatarImage}
      onError={() => setSrc(avatarPlaceholder)}
      accessibilityLabel="holder avatar"
    />
  );
};

export const PremarketTimelineSection: React.FC<Props> = ({ withJoinButton, tokenInfo, onUpdated }) => {
  const { colors } = useTheme() as AppTheme;
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(tokenInfo.mainInfo.premarketDeadline));
  const { joinPremarketBySol } = useJoinFlow(onUpdated);

  const state = tokenInfo.mainInfo.state


  useEffect(() => {
    if (state === 'premarket'){
      const interval = setInterval(() => {
        setTimeLeft(getTimeLeft(tokenInfo.mainInfo.premarketDeadline));
      }, 1000);
      return () => clearInterval(interval); 
    }
  }, [tokenInfo.mainInfo.premarketDeadline]);

  const avatars = tokenInfo.dynamicInfo.holders.length < 3 ? tokenInfo.dynamicInfo.holders:
  tokenInfo.dynamicInfo.holders
    .filter(h => h.iconURL)
    .slice(0, 3);


  return (
    <View style={styles.container}>
      {/* Created */}
      <Row 
       icon="plant-outlined"
        iconColor={colors.onSurface}
        text={{
          text:convertTimeStampToDataMonth(tokenInfo.mainInfo.premarketCreated),
          color: colors.onSurface
        }}
        subText={{
          text: 'Created',
          color: colors.onSurfaceVariant
        }}
        />

      <View style={{ position: 'relative', paddingLeft: 2 }}>
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 6,
            width: 1,
            backgroundColor: colors.onSurfaceVariant,
          }}
        />
        {/* People joined */}
        <View style={[styles.row, { paddingVertical: 32 }]}>
          <View style={[styles.timelineLine, { backgroundColor: colors.onSurfaceVariant }]} />
          <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>
            {tokenInfo.dynamicInfo.holdersCount} people joined
          </Text>
          <View style={styles.avatarGroup}>
            {avatars.map((holder, i) => (
              <View
                key={holder.id}
                style={[
                  styles.avatarCircle,
                  {
                    backgroundColor: colors.onSurfaceVariant,
                    marginLeft: i === 0 ? 0 : -10,
                    borderColor: colors.background,
                  },
                ]}
              >
                <AvatarWithFallback uri={holder.iconURL || undefined} />
              </View>
            ))}
          </View>
        </View>

        {/* Now */}
        {state === 'premarket' && 
          <View style={styles.row}>
            <View style={[styles.timelineLine, { backgroundColor: colors.primary }]} />
            <TextProminent variant="labelMedium" style={{ color: colors.onSurface }}>
              Now <Text style={{ color: colors.onSurfaceVariant }}>Time left</Text>
            </TextProminent>
          </View>
        }
        {state === 'canceled' && 
          <View style={styles.row}>
            <View style={[styles.timelineLine, { backgroundColor: colors.error }]} />
            <TextProminent variant="labelMedium" style={{ color: colors.onSurface }}>
              Now <Text style={{ color: colors.error }}>Refunded</Text>
            </TextProminent>
          </View>
        }


        {state === 'premarket' ?
        <View style={{ position: 'relative', paddingLeft: 20, paddingVertical: 24, gap: 12, width: 180}}>
          <Text style={[styles.countdownText, { color: colors.onSurface }]}>{timeLeft}</Text>
          {withJoinButton && <Button 
          onPress={() => joinPremarketBySol(tokenInfo.mainInfo.premarketPubkey, DEFAULT_BUY_AMOUNT)}
          mode="outlined" style={{ marginTop: 4 }} textColor={colors.onSurface}>
            + Buy{' '}
            {formatNumberCompact(
              convertDecimalToToken(
                convertSolanaToTokenBuy({
                  sol_amount: DEFAULT_BUY_AMOUNT_LAMP,
                  reserves_sol: tokenInfo.dynamicInfo.reservedSolLamp,
                  reserves_token: tokenInfo.dynamicInfo.reservedTokenLamp,
                })
              )
            )}{' '}
            for {DEFAULT_BUY_AMOUNT} SOL
          </Button>}
        </View>
        : <View style={{ position: 'relative', paddingLeft: 20, paddingVertical: 24, gap: 12 }}/>}
      </View>

      {/* Launch */}
      <Row 
        icon="smile" 
        iconColor={tokenInfo.mainInfo.state === 'finished' ? colors.primary :colors.onSurface}
        text={{
          text:convertTimeStampToDataMonth(tokenInfo.mainInfo.premarketDeadline),
          color: colors.onSurface
        }}
        subText={{
          text: tokenInfo.mainInfo.state === 'finished' ? 'Launched' : 'Launching',
          color: tokenInfo.mainInfo.state === 'finished' ? colors.primary :colors.onSurfaceVariant
        }}
        isStripe={tokenInfo.mainInfo.state === 'finished'}
         />
    </View>
  );
};


const Row = ({ icon, iconColor, text, subText, isStripe }: { 
  icon: IconName; 
  iconColor: string;
  text?: {
    text: string; 
    color: string
  };
  subText?: {
    text: string; 
    color: string
  };
  isStripe?:boolean;
}) => (
  <View style={styles.row}>
    <SvgIcon name={icon} size={16} color={iconColor} />
    
    {text&&<TextProminent variant="labelMedium" style={{ textDecorationLine: isStripe ? 'line-through':undefined,paddingLeft: 8, color: text.color }}>
      {text.text} 
    </TextProminent>}
    {subText && <Text variant="labelMedium" style={{textDecorationLine: isStripe ? 'line-through':undefined, paddingLeft: 8, color: subText.color }}>
      {subText.text}
    </Text>}
  </View>
);

const getTimeLeft = (deadlineTs: number): string => {
  const now = new Date();
  const deadline = new Date(deadlineTs * 1000);
  const diff = Math.max(0, deadline.getTime() - now.getTime());
  const seconds = Math.floor(diff / 1000);

  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (d > 0) return `${d}d ${h}h ${m}m ${s}s`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const styles = StyleSheet.create({
  container: {
    padding: 5,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  avatarGroup: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  timelineLine: {
    width: 10,
    height: 10,
    borderRadius: 10,
  },
  countdownText: {
    minHeight: 150,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
