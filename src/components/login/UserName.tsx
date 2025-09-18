// components/LoginPopup.tsx
import React, { useState } from 'react';
import { View, StyleSheet, DimensionValue} from 'react-native';
import { HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import GreenButton from '@components/login/buttons/GreenButton';
import { SvgIcon } from '@components/base/SvgIcon';
interface WalletConnectionCheckerProps {
  height: DimensionValue
  width: number
  toNext: () => void
  setUsernameToServer: (username: string) => Promise<{ok: boolean, reason?:string}>
}

export default function UserName({
  height, width, 
  toNext, setUsernameToServer
}: WalletConnectionCheckerProps) {
  const theme = useTheme();    
  const [userName, setUserName] = useState("")
  const [error, setError] = useState<string>("")

  return (
    <View style={{
        backgroundColor: theme.colors.background, // todo: change to surfaceContainerLow
        flex: 1,
        justifyContent: 'space-between',
        height:height,
        width: width,
    }}>
      <View style={[styles.headerContainer, {gap:80}]}>
        <Text
          variant="titleMedium"
          style={{ color: theme.colors.onBackground }}
        > Choose username </Text>
        <View style={{width:'100%'}}>
          <TextInput
            label="Username"
            autoFocus={true}
            mode='flat'
            dense={true}
            style={{
              width:'100%',
              backgroundColor: 'transparent',
            }}
            onChangeText={(text) => {
              if (text.length === 0) {
                setError("")
                setUserName("")
              }

              if (text.length < 5) {
                setError("Username must be at least 5 characters long")
                setUserName("")
                return
              }
              if (text.length > 20) {
                setError("Username can't exceed 20 characters")
                setUserName("")
                return
              }
              setError("")
              setUserName(text)
            }}
            error={error !== ""}
            right={
              error !== "" && <TextInput.Icon
                icon={() => (<SvgIcon name="info-circle" size={24} color={theme.colors.error} />)}
                onPress={() => console.log('Icon pressed')}
              />
            }

            />
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
          </View>

      </View>
      
      <View style={[styles.headerContainer, {gap:40}]}>
        <GreenButton buttonText='Continue' disabled={userName === ""} onClick={async () => {
          try {
            const resp = await setUsernameToServer(userName)
            if (!resp.ok) {
              const reason = (resp.reason??"")
              if (reason === "already exist"){
                setError("This username is already taken!")
                console.log("error: This username is already taken")
              } else {
                throw Error(`not ok with unexpected reason: ${reason}`)
              }
            } else {
              toNext()
            }
          } catch {
            console.log("error: Some error")
            setError("Something went wrong. Please, try again")
          }
        }}/>
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
});