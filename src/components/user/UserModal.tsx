import React, { useState } from "react";
import { View, Linking, Image, TouchableOpacity } from "react-native";
import { Avatar, Button, IconButton, Text, useTheme } from "react-native-paper";
import { SvgIconButton, SvgIcon, IconName } from "@components/base/SvgIcon";
import { LinearGradient } from "expo-linear-gradient";
import { WalletInfo } from "@components/login/WalletConnectionCheckerArea";
import { useIsMobileForOneScreenWithDemention } from "@hooks/useIsMobile";
import { MD3Colors } from "react-native-paper/lib/typescript/types";
import shortString from "@utils/address_shorter";
import * as ImagePicker from 'expo-image-picker';

interface UserModalProps {
  user: {
    userId: string;
    username: string;
    walletAddress: string;
    avatarUrl: string | null;
  };
  isPersonal: boolean;
  updateAvatar: (avatarUri:string) => Promise<void>;
  logout: () => void;
  onClose: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({updateAvatar, logout, isPersonal, user, onClose }) => {
  const { colors } = useTheme();
  const { isMobile, width } = useIsMobileForOneScreenWithDemention();
  const [avatarFailed, setAvatarFailed] = useState(false);
      const pickAvatar = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [1, 1],
        allowsEditing: true,
        quality: 0.5,
      });
  
      if (!result.canceled) {
        user.avatarUrl=result.assets[0].uri
        updateAvatar(result.assets[0].uri)
      }
    };
  

  const containerWidth = isMobile ? width : 480;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.backdrop + "CC", // semi-transparent
        zIndex: 999,
      }}
    >
      <View
        style={{
          width: containerWidth,
          borderRadius: 20,
          overflow: "hidden",
          backgroundColor: colors.background,
        }}
      >
        <LinearGradient
          colors={[colors.primary, colors.background]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            width: containerWidth,
          }}
        >
            <View style={{width: '100%', justifyContent: 'space-between',flexDirection: 'row', alignItems: 'center',}}>
                <View/>
                {<IconButton icon="close" size={24} iconColor={colors.onSurface} onPress={onClose} />}
            </View>
            <View style={{
                paddingBottom: 64,
                paddingHorizontal: 24,
                gap: 16,
                alignItems: "center",
                position: "relative",
            }}>

            {/* Avatar or fallback */}
            <View style={{width:112, height:112, padding:0, margin:0}}>
              {!avatarFailed ? (
                  <Avatar.Image
                  source={{ uri: user.avatarUrl??"" }}
                  onError={() => setAvatarFailed(true)}
                  style={{
                      width: 112,
                      height: 112,
                      borderRadius: 56,
                      borderWidth: 2,
                      borderColor: colors.primary,
                      backgroundColor: colors.background,
                  }}
                  />
              ) : (
                  <SvgIcon name="smile-outlined" size={112} color={colors.primary} />
              )}
              {/* Кружок с иконкой снизу слева */}
              {isPersonal && (
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
                  <SvgIcon name='arrows-clockwise' size={16} color={colors.onBackground} />
                </TouchableOpacity>
              )}
            </View>


            <Text variant="titleLarge">{user.username ?? shortString(user.walletAddress, 3)}</Text>

            <View
                style={{
                flexDirection: "row",
                gap: 8,
                alignItems: "center",
                justifyContent: "center",
                }}
            >
                <RoundIconLink
                name="search"
                colors={colors}
                link={getSolanaUserProfileLink(user.walletAddress)}
                />
                <RoundIconLink
                name="pumpfun"
                colors={colors}
                link={getPumpFunUserProfileLink(user.walletAddress)}
                />
            </View>
          
          </View>
        </LinearGradient>
        
        <View style={{ padding: 24 }}>
          <WalletInfo
            colors={colors}
            enabledFeatures={{
              dateAndBalance: true,
              transactionCount: true,
              humanity: true,
            }}
          />
          <Button style={{width:144}} mode='outlined' onPress={logout}>Log out</Button>
      </View>
    </View>
    </View>
  );
};

function getSolanaUserProfileLink(userAddress: string) {
  return `https://solscan.io/account/${userAddress}`;
}

function getPumpFunUserProfileLink(userAddress: string) {
  return `https://pump.fun/profile/${userAddress}`;
}

interface SvgIconButtonProps {
  name: IconName;
  size?: number;
  iconSize?: number;
  colors: MD3Colors;
  link: string;
}

function RoundIconLink({
  name,
  size = 32,
  iconSize = 16,
  colors,
  link,
}: SvgIconButtonProps) {
  return (
    <SvgIconButton
      onPress={() => Linking.openURL(link)}
      name={name}
      size={iconSize}
      color={colors.onSurface}
      containerStyle={{
        justifyContent: "center",
        alignItems: "center",
        width: size,
        height: size,
        borderWidth: 2,
        borderColor: colors.onSurfaceVariant,
        backgroundColor: colors.surfaceVariant,
        opacity: 0.4,
        borderRadius: size / 2,
      }}
      style={{
        opacity: 1,
      }}
    />
  );
}
