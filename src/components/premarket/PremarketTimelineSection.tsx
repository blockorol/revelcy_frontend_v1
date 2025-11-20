import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { IconName, SvgIcon } from '@components/base/SvgIcon';
import { AvatarGroup } from '@components/base/AvatarGroup';
import { TokenInfo } from '@api/token';
import {
  convertDecimalToToken,
  convertSmallCountToLamport,
  convertTimeStampToDataMonth,
  formatNumberCompact
} from '@utils/premarket';
import { makeTransparent } from '@utils/colors';
import { AppTheme } from '@theme/types';
import { useJoinFlow } from '@hooks/useJoinFlow';
import { TextProminent } from '@components/ui/Text';
import { convertSolanaToTokenWithFee } from "@services/pumpfun/convertors";

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
  const { joinPremarketBySol } = useJoinFlow(onUpdated);
  const pingScale = useRef(new Animated.Value(1)).current;
  const pingOpacity = useRef(new Animated.Value(1)).current;

  const state = tokenInfo.mainInfo.state;

  const [timeLeft, setTimeLeft] = useState(getTimeLeft(tokenInfo.mainInfo.premarketDeadline, colors, state === 'expired'));

  // Ping animation (expanding ring effect)
  useEffect(() => {
    if (state === 'premarket' || state === 'expired' || state === 'canceled') {
      const ping = Animated.loop(
        Animated.parallel([
          Animated.timing(pingScale, {
            toValue: 2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pingOpacity, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      ping.start();
      return () => {
        ping.stop();
        pingScale.setValue(1);
        pingOpacity.setValue(1);
      };
    }
  }, [state]);

  useEffect(() => {
    if (state === 'premarket' || state === 'expired'){
      const interval = setInterval(() => {
        setTimeLeft(getTimeLeft(tokenInfo.mainInfo.premarketDeadline, colors, state === 'expired'));
      }, 1000);
      return () => clearInterval(interval); 
    }
  }, [tokenInfo.mainInfo.premarketDeadline, state]);

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

      <View style={{ position: 'relative', paddingLeft: 1.5 }}>
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
        <View style={[styles.row, { paddingVertical: 32 }, { gap: 22 }]}>
          <View style={[styles.timelineLine, { backgroundColor: colors.onSurfaceVariant }]} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>
              {tokenInfo.dynamicInfo.holdersCount} people joined
            </Text>
            <AvatarGroup 
              holders={tokenInfo.dynamicInfo.holders}
              maxAvatars={3}
              size={24}
            />
          </View>
        </View>

        {/* Now */}
        {state === 'premarket' && 
          <View style={[styles.row, { gap: 22 }]}>
            <View style={[styles.timelineLine, { backgroundColor: colors.primary + '33', justifyContent: 'center', alignItems: 'center' }]}>
              <Animated.View 
                style={[
                  styles.pingRing,
                  { 
                    backgroundColor: colors.primary,
                    transform: [{ scale: pingScale }],
                    opacity: pingOpacity,
                  }
                ]} 
              />
              <View style={[styles.pingDot, { backgroundColor: colors.primary }]} />
            </View>
            <TextProminent variant="labelMedium" style={{ color: colors.onSurface }}>
              Now  <Text style={{ color: colors.onSurfaceVariant }}>Time left</Text>
            </TextProminent>
          </View>
        }
        {state === 'expired' && 
          <View style={[styles.row, { gap: 22 }]}>
            <View style={[styles.timelineLine, { backgroundColor: makeTransparent(colors.error, 0.8), justifyContent: 'center', alignItems: 'center' }]}>
              <Animated.View 
                style={[
                  styles.pingRing,
                  { 
                    backgroundColor: colors.error,
                    transform: [{ scale: pingScale }],
                    opacity: pingOpacity,
                  }
                ]} 
              />
              <View style={[styles.pingDot, { backgroundColor: colors.error }]} />
            </View>
            <TextProminent variant="labelMedium" style={{ color: colors.onSurface }}>
              {convertTimeStampToDataMonth(tokenInfo.mainInfo.premarketDeadline)}{' '}
              <Text style={{ color: colors.error }}>Expired</Text>
            </TextProminent>
          </View>
        }
        {state === 'canceled' && 
          <View style={[styles.row, { gap: 22 }]}>
            <View style={[styles.timelineLine, { backgroundColor: makeTransparent(colors.error, 0.8), justifyContent: 'center', alignItems: 'center' }]}>
              <Animated.View 
                style={[
                  styles.pingRing,
                  { 
                    backgroundColor: colors.error,
                    transform: [{ scale: pingScale }],
                    opacity: pingOpacity,
                  }
                ]} 
              />
              <View style={[styles.pingDot, { backgroundColor: colors.error }]} />
            </View>
            <TextProminent variant="labelMedium" style={{ color: colors.onSurface }}>
              {convertTimeStampToDataMonth(tokenInfo.mainInfo.premarketDeadline)}{' '}
              <Text style={{ color: colors.error }}> Expired</Text>
            </TextProminent>
          </View>
        }
        {state === 'premarket' ?
        <View style={{ position: 'relative', paddingLeft: 30, paddingVertical: 24, gap: 12, width: 280}}>
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
                      convertSolanaToTokenWithFee({
                        input_sol_lamp: DEFAULT_BUY_AMOUNT_LAMP,
                        before_sol_lamp: tokenInfo.dynamicInfo.reservedSolLamp,
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
        icon={state === 'expired' ? "ringing-clock" : tokenInfo.mainInfo.state === 'canceled' ? "ringing-clock" : "rocket"} 
        iconColor={tokenInfo.mainInfo.state === 'finished' ? colors.primary :colors.onSurface}
        text={{
          text: state === 'expired' 
            ? 'Now' 
            : tokenInfo.mainInfo.state === 'canceled' && tokenInfo.mainInfo.finishDate
              ? convertTimeStampToDataMonth(tokenInfo.mainInfo.finishDate)
              : convertTimeStampToDataMonth(tokenInfo.mainInfo.premarketDeadline),
          color: colors.onSurface
        }}
        subText={{
          text: state === 'expired' 
            ? 'Extension or refund' 
            : tokenInfo.mainInfo.state === 'canceled' 
              ? 'Refunded' 
              : tokenInfo.mainInfo.state === 'finished' 
                ? 'Launched' 
                : 'Launching',
          color: tokenInfo.mainInfo.state === 'finished' ? colors.primary :colors.onSurfaceVariant
        }}
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

const getTimeLeft = (deadlineTs: number, colors: any, isExpired: boolean = false) => {
  if (isExpired) {
    return null;
  }
  
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
        <Text style={{ color: colors.onSurface, fontSize: 30, fontWeight: '700', fontFamily: 'Inter_700Bold' }}>{d}d</Text>
        <Text style={{ color: colors.onSurface, fontSize: 30, fontWeight: '700', fontFamily: 'Inter_700Bold' }}> {h}h</Text>
        <Text style={{ color: colors.onSurface, fontSize: 30, fontWeight: '800', fontFamily: 'Inter_100Thin' }}> {m}m {s}s</Text>
      </View>
    );
  }
  if (h > 0) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: colors.onSurface, fontSize: 30, fontWeight: '700', fontFamily: 'Inter_700Bold' }}>{h}h</Text>
        <Text style={{ color: colors.onSurface, fontSize: 25, fontWeight: '800', fontFamily: 'Inter_100Thin'}}> {m}m {s}s</Text>
      </View>
    );
  }
  if (m > 0) {
    return (
      <Text style={{ color: colors.onSurface, fontSize: 25, fontWeight: '800', fontFamily: 'Inter_100Thin'}}>
        {m}m {s}s
      </Text>
    );
  }
  if (s > 0) {
    return (
      <Text style={{ color: colors.onSurface, fontSize: 25, fontWeight: '800', fontFamily: 'Inter_100Thin'}}>
        {s}s
      </Text>
    );
  }
  return (
    <Text style={{ color: colors.onSurface, fontSize: 25, fontWeight: '800', fontFamily: 'Inter_100Thin'}}>
      Deadline reached
    </Text>
  );
};

const styles = StyleSheet.create({
  container: {
    //paddingVertical: 16,
    //paddingHorizontal: 5,
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
  pingRing: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 10,
  },
  pingDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
  },
  countdownText: {
    minHeight: 30,
    minWidth: 180,
    marginTop: 4,
  },
});
