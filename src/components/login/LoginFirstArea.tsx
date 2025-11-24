// components/LoginPopup.tsx
import React from 'react';
import { View, StyleSheet, DimensionValue} from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
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
  onClose?: () => void;
}

export default function LoginFirstArea({height, width, toNext, overrideSaveJwt, onClose }: LoginFirstAreaProps) {
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
            <Text variant="titleMedium" style={styles.titleText}>
                Log in / Sign up
            </Text>
            {onClose && (
                <IconButton 
                    icon="close" 
                    size={24} 
                    iconColor={colors.onSurface} 
                    onPress={onClose}
                    style={styles.closeButton}
                />
            )}
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
    flexDirection: 'row',
    position: 'relative',
  },
  titleText: {
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    margin: 0,
    padding: 0,
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