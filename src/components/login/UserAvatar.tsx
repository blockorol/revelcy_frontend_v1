// components/LoginPopup.tsx
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  DimensionValue,
  TouchableOpacity,
  Image,
} from "react-native";
import { HelperText, Text, useTheme } from "react-native-paper";
import GreenButton from "@components/login/buttons/GreenButton";
import * as ImagePicker from "expo-image-picker";
import { SvgIcon } from "@components/base/SvgIcon";
import { ExtendedMD3Colors } from "@theme/types";

interface WalletConnectionCheckerProps {
  height: DimensionValue;
  width: number;
  toNext: () => void;
  setUploadAvatarToServer: (avatarUri: string) => Promise<void>;
}

export default function UserAvatar({
  height,
  width,
  toNext,
  setUploadAvatarToServer,
}: WalletConnectionCheckerProps) {
  const theme = useTheme();
  const colors = theme.colors as ExtendedMD3Colors;
  const [avatarUri, setAvatarUri] = useState("");
  const [error, setError] = useState<undefined | string>("");
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
    <View
      style={{
        backgroundColor: colors.surfaceContainerLow,
        flex: 1,
        justifyContent: "space-between",
        height: height,
        width: width,
      }}
    >
      <View style={[styles.headerContainer, { gap: 72 }]}>
        <View style={[styles.headerContainer, { gap: 8 }]}>
          <Text variant="titleMedium" style={{ color: colors.onSurface }}>
            Get profile picture
          </Text>
          <Text variant="labelMedium" style={{ color: colors.onSurface }}>
            You can update this later in your profile
          </Text>
        </View>

        <View
          style={{
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            width: "100%",
          }}
        >
          <View style={{ position: "relative" }}>
            <TouchableOpacity
              onPress={pickAvatar}
              style={{ alignSelf: "center" }}
            >
              <View
                style={{
                  width: 112,
                  height: 112,
                  borderRadius: 9999,
                  backgroundColor: colors.surfaceVariant,
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <SvgIcon
                    name="plus"
                    size={24}
                    color={theme.colors.onSurface}
                  />
                )}
              </View>
            </TouchableOpacity>

            {avatarUri && (
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
              flexDirection: "column",
              gap: 4,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              variant="bodyLarge"
              style={{
                textAlign: "center",
                color: colors.onSurface,
              }}
            >
              Avatar
            </Text>
            <Text
              variant="bodySmall"
              style={{
                textAlign: "center",
                color: colors.onSurfaceVariant,
              }}
            >
              Image or gif
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.headerContainer, { gap: 40 }]}>
        <GreenButton
          buttonText="Finish"
          onClick={async () => {
            try {
              if (avatarUri) {
                await setUploadAvatarToServer(avatarUri);
              }
              toNext();
            } catch {
              setError(" Something went wrong. Please, try again");
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
});
