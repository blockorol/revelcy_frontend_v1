import React, { useState } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button, TextInput, useTheme } from 'react-native-paper';
import { confirmLogin, startSession, updateUsername, updateAvatar} from '@api/auth';
import { SvgIcon } from '@components/base/SvgIcon';
import { getConnectToWallet } from '@hooks/connectWallet';
import { useWallet } from '@storage/wallet-adapter';
import base64js from 'base64-js';



const ImageUploader: React.FC = () => {
    const theme = useTheme();
    const { publicKey, signMessage} = useWallet();
    

    const connetToWallet = getConnectToWallet()
    const [nonce, setNonce] = useState<undefined|string>(undefined);
    const [username, setUsername] = useState<undefined|string>(undefined);
    
    
    const [jwt, setJwt] = useState<undefined|string>(undefined);

    
    const [isConnected, setIsConnected] = useState<boolean>(false);

    
    const [signature, setSignature] = useState<undefined|Uint8Array<ArrayBufferLike>>(undefined);
    const [avatarUri, setAvatarUri] = useState<string>('');
    const [uploadStatus, setUploadStatus] = useState<string>('');

    
    
    const pickAndUploadImage = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [1, 1],
        allowsEditing: true,
        quality: 1,
      });
    
      if (!result.canceled) {
        const asset = result.assets[0];
        setAvatarUri(asset.uri);
    
        try {
          const response = await fetch(asset.uri);
          const blob = await response.blob();
    
          const file = new File([blob], 'avatar.png', { type: blob.type });
    
          const res = await updateAvatar({file:file, jwt:jwt??""});
          setJwt(res.jwt)
          setUploadStatus('Uploaded successfully');
        } catch (err) {
          console.error(err);
          setUploadStatus('Upload failed');
        }
      }
    };

  return (
    <View style={{}}>
        <Text style={styles.label}>JWT: {jwt}</Text>
        
        <View style={styles.wrapper}>
            <Button
                mode="outlined"
                onPress={async() => {
                    const res = await startSession()
                    setNonce(res.nonce)
                    setJwt(res.jwt)
                }}
                labelStyle={{...theme.fonts.labelLarge}}
                style={{flex:1, borderColor: theme.colors.outline, borderRadius: 14}}
                textColor={theme.colors.onSurface}
                icon={ () => <SvgIcon name='binoculars-outlined' size={24} color={theme.colors.onSurface} /> }
            >getNonce
            </Button>
            <Text style={styles.label}>nonce: {nonce}</Text>
        </View>

        <View style={styles.wrapper}>
            <Button
                mode="outlined"
                onPress={async() => {
                    const res = await connetToWallet()
                    setIsConnected(res)
                }}
                labelStyle={{...theme.fonts.labelLarge}}
                style={{flex:1, borderColor: theme.colors.outline, borderRadius: 14}}
                textColor={theme.colors.onSurface}
                icon={ () => <SvgIcon name='wallet-outlined' size={24} color={theme.colors.onSurface} /> }
            >connectWallet</Button>
            <Text style={styles.label}>{isConnected ? "Connected" : "Not Connected" }</Text>

        </View>

        
        <View style={styles.wrapper}>
            <Button
                mode="outlined"
                onPress={async() => {
                    const encoded = new TextEncoder().encode(nonce);
                    console.log("publicKey:", publicKey?.toString());
                    console.log("signMessage:", typeof signMessage);
                    console.log("nonce:", nonce);


                    if (signMessage) {
                      const res = await signMessage(encoded)
                      setSignature(res)
                    }
                }}
                labelStyle={{...theme.fonts.labelLarge}}
                style={{flex:1, borderColor: theme.colors.outline, borderRadius: 14}}
                textColor={theme.colors.onSurface}
                icon={ () => <SvgIcon name='wallet-outlined' size={24} color={theme.colors.onSurface} /> }>signature</Button>
            <Text style={styles.label}>signature: {signature}</Text>

        </View>
        
        <View style={styles.wrapper}>
            <Button
                mode="outlined"
                onPress={async() => {
                    const res = await confirmLogin({
                        walletAddress:publicKey?.toString()??"",
                        signature:signature!,
                        jwt:jwt??""
                    })
                    setJwt(res.jwt);
                }}
                labelStyle={{...theme.fonts.labelLarge}}
                style={{flex:1, borderColor: theme.colors.outline, borderRadius: 14}}
                textColor={theme.colors.onSurface}
                icon={ () => <SvgIcon name='check' size={24} color={theme.colors.onSurface} /> }>confirmLogin to </Button>
            <Text style={styles.label}>
                {publicKey?.toString()??"none"}
                 for {nonce}
                  with sign {signature === undefined?"not": base64js.fromByteArray(signature)}</Text>
        </View>
        
        <View style={styles.wrapper}>
            <TextInput
                style={styles.input}
                keyboardType="default"
                onChangeText={(text) => {
                    setUsername(text ==="" ? undefined : text);
                }}/>
            <Button
                mode="outlined"
                onPress={async() => {
                    const res = await updateUsername({
                        jwt:jwt??"",
                        username: username??"",
                    })
                    setJwt(res.jwt);
                }}
                labelStyle={{...theme.fonts.labelLarge}}
                style={{width:300, borderColor: theme.colors.outline, borderRadius: 14}}
                textColor={theme.colors.onSurface}
                icon={ () => <SvgIcon name='check' size={24} color={theme.colors.onSurface} /> }> setUserName </Button>
        </View>

        
              <View>
                <TouchableOpacity onPress={pickAndUploadImage} style={styles.avatarWrapper}>
                  <View style={[styles.avatarCircle, { backgroundColor: theme.colors.surfaceVariant }]}>
                    {avatarUri ? (
                      <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                    ) : (
                      <Text style={{ fontSize: 24, color: theme.colors.onSurface }}>+</Text>
                    )}
                  </View>
                </TouchableOpacity>
        
                <Text style={[styles.label, { color: theme.colors.onSurface }]}>Avatar</Text>
                <Text style={[styles.subLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Click to upload image
                </Text>
                <Text style={{ color: theme.colors.primary }}>{uploadStatus}</Text>
              </View>

    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 0,
    marginTop: 0,
    borderRadius: 4,
    height: 40,
  },
  wrapper: {
    alignItems: 'center',
    gap: 40,
    padding: 16,
    flexDirection: "row",
  },
  avatarWrapper: {
    alignSelf: 'center',
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  label: {
    flex:3,
    fontSize: 16,
    marginTop: 8,
  },
  subLabel: {
    fontSize: 12,
  },
});

export default ImageUploader;
