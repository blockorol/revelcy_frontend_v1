import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import {  Text, useTheme, Surface } from "react-native-paper";
import LoginButton from "@components/login/LoginButton";
import { useAuth } from "@providers/AuthContext";
import shortString from "@utils/address_shorter";
import type { AppTheme, ExtendedMD3Colors } from "@theme/types";
import { useUserModal } from "@storage/UserModalContext";
import { Avatar } from "@components/ui/Avatar";

export function NavigationProfileWidget({
  isMobile,
  style,
}: {
  isMobile: boolean;
  style?: ViewStyle;
}) {
  const { user } = useAuth();
  const { openPersonalUserModal } = useUserModal()

  const { colors } = useTheme() as AppTheme;
  const mdColors = colors as ExtendedMD3Colors;

  if (!user) {
    return <LoginButton style={style} />;
  }

  return (
    <TouchableOpacity onPress={openPersonalUserModal}>
      <View style={[style, styles.containerStyle]}>
        <Avatar size={24} source={user.avatarUrl} walletAddress={user.walletAddress} />

        {!isMobile && (
          <Text
            variant="labelLarge"
            style={{ color: mdColors.onSurface, alignSelf: "center" }}
          >
            {user.username !== ""
              ? user.username
              : shortString(user.walletAddress, 4)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  containerStyle: {
    flexDirection: "row",
    gap: 12,
    alignContent: "flex-start",
    justifyContent: "flex-start",
  },
});
