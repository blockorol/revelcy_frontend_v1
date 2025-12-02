import React, { useState } from "react";
import { View, Linking, TouchableOpacity, StyleSheet } from "react-native";
import { Modal, Portal, Text, useTheme } from "react-native-paper";
import { Avatar } from "@components/ui/Avatar";
import { Button } from "@components/ui/Button";
import { SvgIconButton, SvgIcon, IconName } from "@components/base/SvgIcon";
import { LinearGradient } from "expo-linear-gradient";
import { WalletInfo } from "@components/login/WalletConnectionCheckerArea";
import { useIsMobileForOneScreenWithDemention } from "@hooks/useIsMobile";
import { MD3Colors } from "react-native-paper/lib/typescript/types";
import shortString from "@utils/address_shorter";
import * as ImagePicker from "expo-image-picker";
import { AppTheme } from "@theme/types";
import { MobileBottomSheet } from "@components/ui/MobileBottomSheet";
import { validateImageFile, AVATAR_MAX_FILE_SIZE_BYTES } from "@utils/imageValidation";
import { useNotification } from "@providers/NotificationContext";

interface UserModalProps {
  user: {
    userId: string;
    username: string;
    walletAddress: string;
    avatarUrl: string | null;
  };
  isPersonal: boolean;
  updateAvatar: (avatarUri: string) => Promise<void>;
  logout: () => void;
  onClose: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({
  updateAvatar,
  logout,
  isPersonal,
  user,
  onClose,
}) => {
  const { isMobile } = useIsMobileForOneScreenWithDemention();
  if (isMobile) {
    return (
      <MobileBottomSheet visible onDismiss={onClose}>
        <UserModalInternal
          updateAvatar={updateAvatar}
          logout={logout}
          isPersonal={isPersonal}
          user={user}
          onClose={onClose}
        />
      </MobileBottomSheet>
    );
  }

  return (
    <Portal>
      <Modal
        visible
        onDismiss={onClose}
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <UserModalInternal
          updateAvatar={updateAvatar}
          logout={logout}
          isPersonal={isPersonal}
          user={user}
          onClose={onClose}
        />
      </Modal>
    </Portal>
  );
};
export const UserModalInternal: React.FC<UserModalProps> = ({
  updateAvatar,
  logout,
  isPersonal,
  user,
  onClose,
}) => {
  const { colors } = useTheme() as AppTheme;
  const { isMobile, width } = useIsMobileForOneScreenWithDemention();
  const notify = useNotification();
  
  const pickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        aspect: [1, 1],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        
        // Validate image format (PNG or JPEG) with 5 MB limit for avatars
        const validationError = await validateImageFile(uri, { maxSizeBytes: AVATAR_MAX_FILE_SIZE_BYTES });
        if (validationError) {
          notify.error(validationError.message);
          return;
        }
        
        user.avatarUrl = uri;
        updateAvatar(uri);
      }
    } catch (err) {
      notify.error("Failed to pick avatar image. Please try again.");
    }
  };

  const containerWidth = isMobile ? width : 480;

  return (
    <View
      style={{
        width: containerWidth,
        borderRadius: 28,
        paddingBottom: 24,
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
        <View style={styles.topCloseLine}>
          <SvgIconButton
            name="x-base"
            size={24}
            color={colors.onPrimary}
            onPress={onClose}
          />
        </View>
        <View style={styles.userInfoContainer}>
          {/* Avatar or fallback */}
          <View style={{ width: 112, height: 112, padding: 0, margin: 0 }}>
            <Avatar
              size={112}
              source={user.avatarUrl}
              walletAddress={user.walletAddress}
            />
            {isPersonal && (
              <TouchableOpacity
                onPress={pickAvatar}
                style={{
                  height: 32,
                  width: 32,
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: colors.surfaceContainerHighest,
                  borderRadius: 9999,
                  padding: 4,
                  justifyContent: "center",
                  alignContent: "center",
                }}
              >
                <SvgIcon
                  name="arrows-clockwise"
                  size={20}
                  color={colors.onSurface}
                />
              </TouchableOpacity>
            )}
          </View>

          <View
            style={{
              gap: 16,
              alignItems: "center",
            }}
          >
            <Text variant="titleLarge">
              {user.username ?? shortString(user.walletAddress, 3)}
            </Text>

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
                tooltipText={"Open Solana scan"}
                link={getSolanaUserProfileLink(user.walletAddress)}
              />
              <RoundIconLink
                name="pumpfun"
                tooltipText={"Open Pumpfun account"}
                colors={colors}
                link={getPumpFunUserProfileLink(user.walletAddress)}
              />
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* user statistic */}
      <View style={{ marginTop: 16, paddingHorizontal: 24 }}>
        <WalletInfo
          colors={colors}
          enabledFeatures={{
            dateAndBalance: true,
            transactionCount: true,
            humanity: true,
          }}
        />
      </View>

      {isPersonal && (
        <View
          style={{
            paddingTop: 56,
            paddingHorizontal: "30%",
            justifyContent: "center",
          }}
        >
          <Button
            size="small"
            mode="outlined"
            onPress={() => {
              logout();
              onClose();
            }}
          >
            Log out
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  topCloseLine: {
    paddingTop: 20,
    paddingRight: 24,
    width: "100%",
    justifyContent: "flex-end",
    flexDirection: "row",
    alignItems: "center",
  },
  userInfoContainer: {
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 24,
    gap: 12,
    alignItems: "center",
  },
});

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
  tooltipText?: string;
}

function RoundIconLink({
  name,
  size = 32,
  iconSize = 16,
  colors,
  link,
  tooltipText
}: SvgIconButtonProps) {
  return (
    <SvgIconButton
      tooltipText={tooltipText}
      onPress={() => Linking.openURL(link)}
      name={name}
      size={iconSize}
      color={colors.onSurface}
      containerStyle={{
        justifyContent: "center",
        alignItems: "center",
        width: size,
        height: size,
        borderWidth: 1,
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
