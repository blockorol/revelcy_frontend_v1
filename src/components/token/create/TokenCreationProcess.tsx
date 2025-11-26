// components/token/TokenCreationProcess.tsx
import { SvgIcon } from '@components/base/SvgIcon';
import { TokenCreateFullData } from '@components/token/create/interface';
import { ExtendedMD3Colors } from '@theme/types';
import { NETWORK } from 'env';
import React, { useEffect, useState } from 'react';
import { View, Image, ScrollView, Linking } from 'react-native';
import { Text, ActivityIndicator, useTheme } from 'react-native-paper';

type Props = {
  tokenData: TokenCreateFullData;
  onDone: () => void;
  isFinished: () => Promise<boolean>;
  txId: string | undefined;
};

export default function TokenCreationProcess({txId, tokenData, onDone, isFinished }: Props) {
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const colors= theme.colors as ExtendedMD3Colors

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const pollStatus = async () => {
      const done = await isFinished();
      if (done) {
        clearInterval(intervalId);
        setLoading(false);
        onDone();
      }
    };

    intervalId = setInterval(pollStatus, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const { tokenName, tokenTicker, avatar } = tokenData.mainData;

  return (
    <ScrollView showsVerticalScrollIndicator={false} style = {{
      backgroundColor: colors.surfaceContainerLowest, borderRadius: 16}}>
      <View style={{
        backgroundColor: colors.surfaceContainerLowest, padding: 24, 
        justifyContent: 'space-between', alignItems: 'stretch',
        width: '100%', height: '100%'
        }}>
        <Text style={{ color: theme.colors.onSurface, marginBottom: 16 }}>Creating your premarket on the blockchain...</Text>

        {avatar && (
          <Image
            source={{ uri: avatar }}
            style={{ width: 64, height: 64, borderRadius: 32, marginBottom: 12 }}
          />
        )}

        <Text variant='labelMedium' style={{ color: colors.onSurface, fontSize: 18, fontWeight: 'bold' }}>{tokenName}</Text>
        <Text variant='labelMedium' style={{ color: colors.onSurfaceVariant, marginBottom: 16 }}>{tokenTicker}</Text>
        <Text variant='labelSmall' style={{ color: colors.onSurfaceVariant, marginBottom: 16 }}>Waiting transaction confirmation in blockchain...</Text>
        
        <Text variant='labelSmall' 
        onPress={() => Linking.openURL(`https://solscan.io/tx/${txId}${NETWORK === 'devnet' ? '?cluster=devnet' : ''}`)}
        style={{ color: colors.onSurfaceVariant, marginBottom: 16 }}>
          Check on Solscan:
          {txId && (
            <SvgIcon name='search'  color={colors.onSurfaceVariant}/>
          )}
        </Text>
        {loading && <ActivityIndicator animating color={theme.colors.primary} size="large" />}
      </View>
    </ScrollView>
  );
}
