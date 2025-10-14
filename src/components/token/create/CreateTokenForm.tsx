// components/token/CreateTokenForm.tsx
import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Badge, Text, useTheme } from 'react-native-paper';
import ContinueAndProgress from '@components/ContinueButtonWithProgressBar';
import TokenCreateFormHeader from '@components/token/create/TokenCreateFormHeader';
import { TokenMainData } from '@components/token/create/interface';
import { ScrollView } from 'react-native-gesture-handler';
import normalizeUrl from '@utils/url';
import { SvgIcon, SvgIconButton } from '@components/base/SvgIcon';
import TextInputMultiline from '@components/base/form/TextInputMutiline';
import TextInput from '@components/base/form/TextInput';
import useIsMobile, { useIsMobileWithDemention } from '@hooks/useIsMobile';
import { MD3ElevationColors } from 'react-native-paper/lib/typescript/types';
import { ExtendedMD3Colors } from '@theme/types';


type CreateTokenFormProps = {
  onNext: (data: TokenMainData) => void;
  onClose?: () => void;
  step: number;
  totalSteps: number;
  presetData?: TokenMainData;
  onBack?: () => void;
};

export default function CreateTokenForm({presetData, onNext, onClose, 
  onBack, step, totalSteps}: CreateTokenFormProps) {
  const theme = useTheme();
  const colors = theme.colors as ExtendedMD3Colors;
  const {isMobile, height} = useIsMobileWithDemention();
  
  const [tokenName, setTokenName] = useState(presetData?.tokenName??'');
  const [tokenTicker, setTokenTicker] = useState(presetData?.tokenTicker??'');
  const [description, setDescription] = useState(presetData?.description??'');
  const [avatar, setAvatar] = useState<string>(presetData?.avatar??'');
  const [twitter, setTwitter] = useState<string | undefined>(presetData?.links.twitter);
  const [telegram, setTelegram] = useState<string | undefined>(presetData?.links.telegram);
  const [website, setWebsite] = useState<string | undefined>(presetData?.links.website);
  
  const [enableTg, setEnableTg] = useState(presetData?.links.telegram !== undefined);
  const [enableTwitter, setEnableTwitter] = useState(presetData?.links.twitter !== undefined);
  const [enableWebsite, setEnableWebsite] = useState(presetData?.links.website !== undefined);


  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [1, 1],
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    onNext({
      tokenName,
      tokenTicker,
      description:description,
      avatar,
      links: {
        telegram,
        twitter,
        website
      }
    });
  };
  const isFilledAll = ():boolean => {
    return tokenName !== "" && tokenTicker !== "" && description !== "" && avatar !== ""
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{
        backgroundColor: colors.surfaceContainerLowest,
        borderRadius: isMobile ? 0 : 16,
        height: height,
      }}
    >
      <View
        style={{
          backgroundColor: colors.surfaceContainerLowest,
          width: "100%",
          paddingHorizontal: isMobile ? 16 : 24,
          paddingTop: isMobile ? 40 : 24,
          maxWidth: 500,
          minHeight: isMobile ? height - 40 : height * 0.85 - 24,
          justifyContent: "space-between",
        }}
      >
        <View style={{gap:16}}>
          <TokenCreateFormHeader title="Token Details" theme={theme} onClose={onClose} onBack={onBack}  />
          <View style={{gap:64}}>  
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, width: '100%', }}> 
              <TouchableOpacity onPress={pickAvatar} style={{ alignSelf: 'center' }}>
                <View
                  style={{
                    width: 112,
                    height: 112,
                    borderRadius: 32,
                    backgroundColor: colors.surfaceContainerHigh,
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {avatar ? (
                    <Image source={{ uri: avatar }} style={{  width: '100%', height: '100%'  }} />
                  ) : (
                    <Text variant='bodySmall' style={{ fontSize: 40, color: theme.colors.onSurface }}>+</Text>
                  )}
                </View>
              </TouchableOpacity>
              <View style={{flexDirection: 'column', gap: 4, justifyContent:'center', alignItems: 'baseline'}}>
                <Text variant="bodyLarge">Image, video or gif</Text>
                <View>
                  <Text variant="bodySmall">This will be shown as</Text>
                  <Text variant="bodySmall">your Token’s picture</Text>
                </View>
              </View> 
            </View>
            <View style={{flexDirection: 'column', gap: 48}}>
              <TextInput
                label="Token Name"
                value={tokenName}
                onChangeText={setTokenName}
                maxLength={20}
                placeholder="eg. Bitcoin"
                style={{ flex:1 }}
              />
              <TextInput
                label="Token Ticker"
                value={tokenTicker}
                onChangeText={setTokenTicker}
                maxLength={5}
                placeholder="eg. BTC"
                style={{ flex:1 }}
              />
              <TextInputMultiline
                id="Description"
                label="Description"
                value={description}
                onChangeValue={setDescription}
                placeholder="Describe your token..."
              />
              <View style={{gap:48}}>
                {enableTg && (
                  <View>
                    <TextInput
                      label="Telegram"
                      value={telegram}
                      onChangeText={(val) => setTelegram(normalizeUrl(val))}
                      placeholder="https://t.me/"
                      mode="flat"
                    />
                    <TouchableOpacity style={styles.badgeClose} onPress={() => setEnableTg(false)}>
                      <Badge style={[styles.badge, {backgroundColor:'transparent', color: colors.onBackground,}]}>✕</Badge>
                    </TouchableOpacity>
                  </View>
                )}
                
                {enableTwitter && (
                  <View>
                    <TextInput
                      label="Twitter"
                      value={twitter}
                      onChangeText={(val) => setTwitter(normalizeUrl(val))}
                      placeholder="x.com/"
                    />
                    <TouchableOpacity style={styles.badgeClose} onPress={() => setEnableTwitter(false)}>
                      <Badge style={[styles.badge, {backgroundColor:'transparent', color: colors.onBackground,}]}>✕</Badge>
                    </TouchableOpacity>
                  </View>
                )}

                
                {enableWebsite && (
                  <View>
                    <TextInput
                      label="Website"
                      value={website}
                      onChangeText={(val) => setWebsite(normalizeUrl(val))}
                    />
                    <TouchableOpacity style={styles.badgeClose} onPress={() => setEnableWebsite(false)}>
                      <Badge style={[styles.badge, {backgroundColor:'transparent', color: colors.onBackground,}]}>✕</Badge>
                    </TouchableOpacity>
                  </View>
                )}


                {/* Social Icons Actions */}
                { !(enableTwitter && enableTg && enableWebsite) && (
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-start', width:'100%', paddingTop: 8 }}>
                      <View style={{flexDirection: 'row', gap:16, height:24}}>
                        <SvgIcon name="add-circle-outlined" color={theme.colors.onSurfaceVariant} size={24} />
                        {!enableTg && (
                          <SvgIconButton size={24} name="tg-logo" color={theme.colors.onSurface} onPress={() => setEnableTg(true)}/>
                        )}
                        {!enableTwitter && (
                          <SvgIconButton size={24} name="x-logo" color={theme.colors.onSurface} onPress={() => setEnableTwitter(true)}/>
                        )}
                        {!enableWebsite && (
                          <SvgIconButton size={24} name="world-outlined" color={theme.colors.onSurface} onPress={() => setEnableWebsite(true)}/>
                        )}
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
        <View style={{gap:16}}>
          <ContinueAndProgress 
            theme={theme}
            progress={{
              before:(step-1)/totalSteps,
              after:(step)/totalSteps,
            }}
            handleSubmit={handleSubmit}
            isFilledAll={isFilledAll}
          />
        </View>
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  inputWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  input: {
    paddingRight: 36,
  },
  badgeClose: {
    position: 'absolute',
    top: 5,
    right: -5,
    zIndex: 1,
  },
  badge: {
    fontSize: 12,
    height: 22,
    minWidth: 22,
    borderRadius: 11,
    textAlign: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
});

