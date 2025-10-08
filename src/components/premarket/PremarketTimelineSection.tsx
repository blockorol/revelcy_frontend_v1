import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { IconName, SvgIcon } from '@components/base/SvgIcon';
import { AvatarGroup } from '@components/base/AvatarGroup';
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

const DEFAULT_BUY_AMOUNT = 0.5;
const DEFAULT_BUY_AMOUNT_LAMP = convertSmallCountToLamport(DEFAULT_BUY_AMOUNT);

interface Props {
  tokenInfo: TokenInfo;
  withJoinButton: boolean;
  onUpdated: ()=>void
}

// AvatarWithFallback component removed - now using AvatarGroup component

export const PremarketTimelineSection: React.FC<Props> = ({ withJoinButton, tokenInfo, onUpdated }) => {
  const { colors } = useTheme() as AppTheme;
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(tokenInfo.mainInfo.premarketDeadline, colors));
  const { joinPremarketBySol } = useJoinFlow(onUpdated);

  const state = tokenInfo.mainInfo.state


  useEffect(() => {
    if (state === 'premarket'){
      const interval = setInterval(() => {
        setTimeLeft(getTimeLeft(tokenInfo.mainInfo.premarketDeadline, colors));
      }, 1000);
      return () => clearInterval(interval); 
    }
  }, [tokenInfo.mainInfo.premarketDeadline]);

  // Avatar data is now handled by AvatarGroup component


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
            top: 8,
            bottom: 8,
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
          <AvatarGroup 
            holders={tokenInfo.dynamicInfo.holders}
            maxAvatars={3}
            size={24}
          />
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
        <View style={{ position: 'relative', paddingLeft: 20, paddingVertical: 24, gap: 12, width: 280}}>
          <View style={styles.countdownText}>{timeLeft}</View>
          {withJoinButton && <Button 
            style={{ 
              width: 'auto',
              height: 30,
              alignSelf: 'flex-start',
              borderRadius: 10,
            }}
            mode="outlined"
            onPress={() => joinPremarketBySol(tokenInfo.mainInfo.premarketPubkey, DEFAULT_BUY_AMOUNT)} 
            textColor={colors.onSurface}
            contentStyle={{
              height: 28,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text variant="labelMedium" style={{color:colors.onSurface}}>
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
                for{' '}
                {DEFAULT_BUY_AMOUNT} SOL
              </Text>
          </Button>}
        </View>
        : <View style={{ 
            position: 'relative', 
            paddingLeft: 20, 
            paddingVertical: state === 'finished' ? 0 : 24, 
            gap: 12 
          }}/>
        }
      </View>

      {/* Launch */}
      <Row 
        icon="rocket" 
        iconColor={tokenInfo.mainInfo.state === 'finished' ? colors.primary :colors.onSurface}
        text={{
          text:convertTimeStampToDataMonth(tokenInfo.mainInfo.premarketDeadline),
          color: colors.onSurface
        }}
        subText={{
          text: tokenInfo.mainInfo.state === 'finished' ? 'Launched' : 'Launching',
          color: tokenInfo.mainInfo.state === 'finished' ? colors.primary :colors.onSurfaceVariant
        }}
        isStripe={tokenInfo.mainInfo.state === 'canceled'}
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
    
    {text&&<TextProminent variant="labelMedium" style={{ textDecorationLine: isStripe ? 'line-through':undefined,paddingLeft: 10, color: text.color }}>
      {text.text} 
    </TextProminent>}
    {subText && <Text variant="labelMedium" style={{textDecorationLine: isStripe ? 'line-through':undefined, paddingLeft: 0, color: subText.color }}>
      {subText.text}
    </Text>}
  </View>
);

const getTimeLeft = (deadlineTs: number, colors: any) => {
  const now = new Date();
  const deadline = new Date(deadlineTs * 1000);
  const diff = Math.max(0, deadline.getTime() - now.getTime());
  const seconds = Math.floor(diff / 1000);

  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (d > 0) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: colors.onSurface, fontSize: 30, fontWeight: '800', fontFamily: 'Arial' }}>{d}d</Text>
        <Text style={{ color: colors.onSurface, fontSize: 30, fontWeight: '800', fontFamily: 'Arial' }}> {h}h</Text>
        <Text style={{ color: colors.onSurface, fontSize: 30, fontWeight: '800', fontFamily: 'Inter_100Thin' }}> {m}m {s}s</Text>
      </View>
    );
  }
  if (h > 0) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: colors.onSurface, fontSize: 30, fontWeight: '800', fontFamily: 'Arial' }}>{h}h</Text>
        <Text style={{ color: colors.onSurface, fontSize: 25, fontWeight: '800', fontFamily: 'Inter_100Thin'}}> {m}m {s}s</Text>
      </View>
    );
  }
  if (m > 0) {
    return (
      <Text style={{ color: colors.onSurface, fontSize: 18, fontWeight: '100', fontFamily: 'Arial' }}>
        {m}m {s}s
      </Text>
    );
  }
  return (
    <Text style={{ color: colors.onSurface, fontSize: 18, fontWeight: '100', fontFamily: 'Arial' }}>
      {s}s
    </Text>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 5,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  // Avatar styles moved to AvatarGroup component
  timelineLine: {
    width: 10,
    height: 10,
    borderRadius: 10,
  },
  countdownText: {
    minHeight: 30,
    minWidth: 100,
    marginTop: 4,
  },
});
