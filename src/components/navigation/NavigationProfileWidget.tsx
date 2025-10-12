import { StyleSheet, View, ViewStyle } from "react-native";
import { Avatar, Text, useTheme, Surface } from "react-native-paper";
import Login from "@components/login/LoginButton";
import { SvgIcon } from "@components/base/SvgIcon";
import { useAuth } from "@providers/AuthContext";
import shortString from "@utils/address_shorter";
import type { AppTheme, ExtendedMD3Colors } from "@theme/types";

export function NavigationProfileWidget({
  isMobile,
  style,
}: {
  isMobile: boolean;
  style?: ViewStyle;
}) {
  const { user } = useAuth();
  const { colors } = useTheme() as AppTheme;
  const mdColors = colors as ExtendedMD3Colors;

  if (!user) {
    return <Login style={style} />;
  }

  return (
    <View style={[style, styles.containerStyle]}>
      {user.avatarUrl ? (
        <Avatar.Image
          size={24}
          source={{ uri: user.avatarUrl }}
          style={{
            backgroundColor: mdColors.elevation.level1,
            borderColor: mdColors.primary,
            borderWidth: 1,
          }}
        />
      ) : (
        <SvgIcon name="smile-outlined" size={24} color={mdColors.primary} />
      )}

      {!isMobile && (
        <Text variant="labelLarge" style={{ color: mdColors.onSurface }}>
          {user.username !== ""
            ? user.username
            : shortString(user.walletAddress, 4)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  containerStyle: {
    flexDirection: "row",
    gap: 12,
    alignContent: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
});
