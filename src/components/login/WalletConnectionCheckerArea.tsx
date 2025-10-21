// components/LoginPopup.tsx
import React from 'react';
import { View, StyleSheet, DimensionValue} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { AnoterWalletButton } from './buttons/WalletButton';
// import TwitterButton from '@components/login/buttons/TwitterButton';
import { useWallet } from '@storage/wallet-adapter';
import TransparentButton from '@components/login/buttons/TransparentButton';
import { MD3Colors } from 'react-native-paper/lib/typescript/types';
import { SvgIcon } from '@components/base/SvgIcon';
import Loader from '@components/base/Loader';
import HumanityLevel from '@components/login/HumanityLevel';
import { convertJwtToUser, useAuth } from '@providers/AuthContext';
import { ExtendedMD3Colors } from '@theme/types';
interface WalletConnectionCheckerProps {
  height: DimensionValue
  width: number
  toBack: () => void
  toNext: () => void
  walletConnectionDate: string | undefined
  balance: number | undefined
  humanity: number | undefined
  overrideSaveJwt?: (jwt:string, isNewUser: boolean) => void;
  jwt?: string;
}

export default function WalletConnectionChecker({
  height, width, 
  toBack, toNext,
  overrideSaveJwt,
  walletConnectionDate, 
  balance,
  humanity,
  jwt
}: WalletConnectionCheckerProps) {
  const theme = useTheme();
  const user = jwt ? convertJwtToUser(jwt) : useAuth().user;
  const { connected } = useWallet();

  const data = (true) ? WalletConnectionSuccess({
      onClickNext: toNext, 
      colors: theme.colors,
      walletConnectionDate, balance, humanity}) :
    WalletConnectionFailed(toBack, theme.colors, overrideSaveJwt)
    

  return (
    <View style={{
        backgroundColor: 'transparent', 
        flex: 1,
        justifyContent: 'space-between',
        height:height,
        width: width,
    }}>
        {data.top}
        {data.bottom}
    </View>
  );
}


function WalletConnectionFailed(
  onClickBack: () => void, 
  colors: MD3Colors,
  overrideSaveJwt?: (jwt:string, isNewUser: boolean) => void,
) {
  return {
    top: (
    <View style={[styles.headerContainer, {gap:40}]}>
      <View style={[styles.headerContainer, {gap:12}]}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.error,
            justifyContent: 'center',
            alignItems: 'center',

          }}
        >
          <SvgIcon name = "smile-sad-outlined" color={colors.onError} size={22}/>
        </View>
        <Text
          variant="titleMedium"
          style={{ color: colors.onSurface, textAlign: 'center'}}
        >
          Wallet connection failed
        </Text>
      </View>


        <Text
          variant="labelLarge"
          style={{ color: colors.onSurface, textAlign: 'center'}}
        >
          Oops! Something went wrong.{'\n'}
          Switching to another wallet might help
        </Text>
    </View>
    ),
    bottom: (        
      <View style={styles.centerSection}>
        <AnoterWalletButton overrideSaveJwt={overrideSaveJwt} />
        <TransparentButton 
          buttonText='Back'
          onClick={onClickBack}
        />
      </View>
    )
  }
}

interface WalletConnectionSuccessParam {
  walletConnectionDate: string | undefined
  balance: number | undefined
  humanity: number | undefined
  onClickNext: () => void
  colors: MD3Colors
}

function WalletConnectionSuccess({
  walletConnectionDate, balance, humanity,
  onClickNext, colors
}: WalletConnectionSuccessParam) {
  return {
    top: (
    <View style={[styles.headerContainer, {gap:40}]}>
      <View style={[styles.headerContainer, {gap:12}]}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <SvgIcon name = "check" color={colors.onPrimary} size={22}/>
        </View>
        <Text
          variant="titleMedium"
          style={{ color: colors.onBackground }}
        >
          Wallet connected
        </Text>
      </View>
      <View style={{
        width: '100%'}} >
            <View style={{
        width: '100%',
        height: "100%",
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        paddingLeft: 24,
        position: 'absolute',
        opacity: 1,
        backgroundColor: colors.onSecondary,
        borderRadius: 24,
        flexDirection: 'row',
        gap: 8,
        borderWidth: 2, 
        borderColor: colors.secondary
      }}> 
        <SvgIcon name='star-outlined' color={colors.secondary}  />
        <Text variant='titleMedium' style={{color:colors.secondary}}>Soon</Text>
      </View>
      
      <View style={{
        width: '100%', opacity: 0.5}} >
      <WalletInfo colors={colors} humanity={humanity} walletConnectionDate={walletConnectionDate} balance={balance} 
        enabledFeatures={{humanity:true, dateAndBalance:true}}/>
      </View>

      </View>
    </View>
    ),
    bottom: (        
      <View style={styles.centerSection}>
        
      <View style={{
        width: '100%'}} >
            <View style={{
        width: '100%',
        height: "100%",
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        paddingLeft: 24,
        position: 'absolute',
        opacity: 1,
        backgroundColor: colors.onSecondary,
        borderRadius: 24,
        flexDirection: 'row',
        gap: 8,
        borderWidth: 2, 
        borderColor: colors.secondary
      }}> 
        <SvgIcon name='star-outlined' color={colors.secondary}  />
        <Text variant='titleMedium' style={{color:colors.secondary}}>Soon</Text>
      </View>
      
      <View style={{
        width: '100%', opacity: 0.5}} >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap:16}}>
          <SvgIcon name = "info-circle" color={(humanity??1) < 0.3 ? colors.error :  colors.primary} size={24}/>
          <Text variant='bodyMedium' style={{color:colors.onSurfaceVariant}}>
            {
              humanity === undefined ? `We're analyzing your wallet. This may take a moment, feel free to continue in the meantime` :
              humanity < 0.3 ? "We identified that this wallet is likely automated\nYou can continue, but we recommend to try connecting another one" :
              "Well done! We analyzed your wallet etc"
            }
          </Text>
        </View>
        </View></View>
        {/* <TwitterButton /> */}
        <TransparentButton 
          buttonText='Skip'
          onClick={onClickNext}
        />
      </View>
    )
  }
}
interface WalletInfoProps {
  walletConnectionDate?: string
  balance?: number
  humanity?: number
  transactionCount?: number
  colors: MD3Colors
  enabledFeatures: {
    dateAndBalance?: boolean
    humanity?: boolean
    transactionCount?: boolean
  }
}

/*

export function WalletInfo({walletConnectionDate, transactionCount, balance, humanity, colors, enabledFeatures}:WalletInfoProps ) {
  return (<View style={{flexDirection: 'row', width: "100%", justifyContent:"flex-start", alignItems: 'flex-start', gap:16 }}>
          <SvgIcon name="wallet-outlined" color={colors.onSurface} size={26} 
            style={{
              paddingTop:6,
              paddingBottom:6,
              paddingLeft: 4,
              paddingRight: 4,
            }}
          />
          <View style={{flex: 1,gap:8}}>
            <Text variant='titleMedium'>Wallet</Text>
            {
              (enabledFeatures.dateAndBalance === true) && (
                (walletConnectionDate===undefined) ? (
                  <Loader text="Calculating stats"/>
                ) : (
                  
                  <View style={{
                    flexDirection: 'row',
                    width: "100%",
                    justifyContent:"flex-start",
                    alignItems: 'flex-start',
                    gap:16 }}>

                    <View style={{
                      flexDirection: 'row',
                      justifyContent:"flex-start",
                      alignItems: 'flex-start',
                      gap:4 }}>
                        <SvgIcon name="plant-outlined" color={colors.onSurface} size={16} />
                        <Text variant='labelMedium' selectionColor={colors.onSurface}>{walletConnectionDate}</Text>
                        
                    </View>
                    {balance !== undefined ? (
                      <View style={{
                        flexDirection: 'row',
                        justifyContent:"flex-start",
                        alignItems: 'flex-start',
                        gap:4 }}> 
                        <Text variant='labelMedium'  selectionColor={colors.onSurface}>Balance</Text>
                        <Text variant='labelMedium' selectionColor={colors.onSurface}>$ {balance}</Text>
                      </View>
                    ) : (
                      <Loader text='Calculation'/>
                    )}
                    
                    {(enabledFeatures.transactionCount ===true) && 
                      (transactionCount !== undefined ) ?
                        ( <View style={{
                          flexDirection: 'row',
                          justifyContent:"flex-start",
                          alignItems: 'flex-start',
                          gap:4 }}> 
                          <Text variant='labelMedium'  selectionColor={colors.onSurface}>Transaction</Text>
                        <Text variant='labelMedium' selectionColor={colors.onSurface}>{transactionCount}</Text>
                      </View>
                    ) : (
                      <Loader text='Calculation'/>
                    )}
                  </View>
                )
              )
            }
            <View style={{height:0, padding:0, margin:0}}/>
            
            {(enabledFeatures.humanity === true) &&
             (humanity !== undefined) ?
              (<View style={{flex:1}}> <HumanityLevel level={humanity}/></View>) :
              (<Loader text='Checking humanity'/>)
            }
          </View>
      </View>
  )
}

*/

export function WalletInfo({walletConnectionDate, transactionCount, balance, humanity, colors, enabledFeatures}:WalletInfoProps ) {
  return (<View style={{flexDirection: 'row', width: "100%", justifyContent:"flex-start", alignItems: 'flex-start', gap:16 }}>
    <SvgIcon name="wallet-outlined" color={colors.onSurface} size={26} 
      style={{
        paddingTop:6,
        paddingBottom:6,
        paddingLeft: 4,
        paddingRight: 4,
      }}
    />
    <View style={{flex: 1,gap:8}}>
      <Text variant='titleMedium'>Wallet</Text>
      <Loader text="Stats are in development"/>
    </View>
  </View>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  centerSection: {
    justifyContent: 'center',
    width: '100%',
    gap: 20,
  },
  bottomSection: {
    width: '100%',
  },
});