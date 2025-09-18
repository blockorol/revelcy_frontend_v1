// components/LoginPopup.tsx
import React, { useState} from 'react';
import { View, StyleSheet, DimensionValue, TouchableOpacity, Image} from 'react-native';
import { HelperText, Text, useTheme } from 'react-native-paper';
import GreenButton from '@components/login/buttons/GreenButton';
import * as ImagePicker from 'expo-image-picker';
import { SvgIcon } from '@components/base/SvgIcon';
import { ExtendedMD3Colors } from '@theme/types';

interface WalletConnectionCheckerProps {
  height: DimensionValue
  width: number
  toNext: () => void
  setUploadAvatarToServer: (avatarUri:string) => Promise<void>
}



export default function UserAvatar({
  height, width, 
  toNext, setUploadAvatarToServer
}: WalletConnectionCheckerProps) {
  const theme = useTheme()
  const colors = theme.colors as ExtendedMD3Colors;    
  const [avatarUri, setAvatarUri] = useState("")
  const [error, setError] = useState<undefined|string>("")
    const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [1, 1],
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  return (
    <View style={{
        backgroundColor: colors.surfaceContainerLow,
        flex: 1,
        justifyContent: 'space-between',
        height:height,
        width: width,
    }}>
      <View style={[styles.headerContainer, {gap:80}]}>
        <View style={[styles.headerContainer,{gap:8}]}>
          <Text
            variant="titleMedium"
            style={{ color: colors.onBackground }}
          > Get profile picture </Text>
          
          <Text
            variant="labelMedium"
            style={{ color: colors.onBackground }}
          > You can update this later in your profile </Text>
        </View>


        {/* token icon */}
        <View style={{ flexDirection: 'column', alignItems: 'center', gap:16, width: '100%' }}>
          <View style={{ position: 'relative' }}>
            <TouchableOpacity onPress={pickAvatar} style={{ alignSelf: 'center' }}>
              <View
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 9999,
                  backgroundColor: colors.surfaceVariant,
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <Text style={{ fontSize: 24, color: colors.onSurface }}>+</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Кружок с иконкой снизу слева */}
            {avatarUri && (
              <TouchableOpacity
                onPress={pickAvatar}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: colors.surfaceVariant,
                  borderRadius: 9999,
                  padding: 4,
                }}
              >
                <SvgIcon name='arrows-clockwise' size={16} color="white" />
              </TouchableOpacity>
            )}
          </View>

          <View style={{flexDirection: 'column', gap: 4, justifyContent:'center',alignItems: 'center'}}>
            <Text style={{ ...theme.fonts.bodyLarge, textAlign: 'center', color: colors.onSurface}}>
              Avatar
            </Text>
            <Text style={{ ...theme.fonts.bodySmall, textAlign: 'center', fontSize:12, color: colors.onSurfaceVariant }}>
              Image or gif
            </Text>
          </View>
        </View>


      </View>
      
      <View style={[styles.headerContainer, {gap:40}]}>
        <GreenButton buttonText='Finish' onClick={async () => {
          try {
            await setUploadAvatarToServer(avatarUri)
            toNext()
          } catch {
            console.log("error: Some error")
            setError(" Something went wrong. Please, try again")
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