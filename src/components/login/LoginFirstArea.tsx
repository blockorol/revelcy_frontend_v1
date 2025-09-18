// components/LoginPopup.tsx
import React from 'react';
import { View, StyleSheet, DimensionValue} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import WalletButton from './buttons/WalletButton';
import { TermsNotice } from '@components/login/TermsNotice';
import { ExtendedMD3Colors } from '@theme/types';
// import TwitterButton from '@components/login/buttons/TwitterButton';
// import PrivyButton from '@components/login/buttons/PrivyButton';
interface LoginFirstAreaProps {
  height: DimensionValue;
  width: number;
  overrideSaveJwt?: (jwt:string, isNewUser: boolean) => void;
  toNext: () => void;
}

export default function LoginFirstArea({height, width, toNext, overrideSaveJwt }: LoginFirstAreaProps) {
  const theme = useTheme();
  const colors =theme.colors as ExtendedMD3Colors 

  return (
    <View style={{
        backgroundColor: colors.surfaceContainerLow,
        flex: 1,
        justifyContent: 'space-between',
        height:height,
        width: width,
    }}>
        <View style={styles.headerContainer}>      
            <Text variant="titleMedium" style={{color: colors.onSurface}}>
                Log in / Sign up
            </Text>
        </View>

        <View style={{gap:56}}>
            <View style={styles.centerSection}>
                {/* <TwitterButton /> */}
                <WalletButton afterClick={toNext} overrideSaveJwt={overrideSaveJwt}/>
                {/* <PrivyButton /> */}
            </View>

            <View style={styles.bottomSection}>
                {/* Footer */}
                <TermsNotice/>
            </View>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  centerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 20,
  },
  bottomSection: {
    width: '100%',
  },
});