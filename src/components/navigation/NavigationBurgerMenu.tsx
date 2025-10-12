import { IconName, SvgIcon, SvgIconButton } from "@components/base/SvgIcon";
import { View, Image, StyleSheet } from "react-native";
import { TouchableRipple, useTheme } from "react-native-paper";
import { Text } from "@components/ui/Text";
import { NavigationProfileWidget } from "@components/navigation/NavigationProfileWidget";
import { router } from "expo-router";
import { navigationItems } from "@components/navigation/NavigationItems";
import { useOverlay } from "@storage/UniversalOverlayProvider";

export default function NavigationBurgerMenu() {
  const { open, close } = useOverlay();
  const { colors } = useTheme();
  return (
    <SvgIconButton
      size={30}
      color={colors.onSurface}
      onPress={() => open(<NavigationBurgerMenuItemsList onClose={close} />)}
      name="menu"
    />
  );
}
interface NavProps {
  onClose: () => void;
}
function NavigationBurgerMenuItemsList({ onClose }: NavProps) {
  const { colors } = useTheme();
  return (
    <TouchableRipple
      onPress={onClose}
      style={{ backgroundColor: undefined, width: "100%", height: "100%" }}
    >
      <View style={{ backgroundColor: colors.background }}>
        
        <View
          style={[
            styles.lineContainer,
            styles.lineMainMenu,
            { borderColor: colors.outlineVariant },
          ]}
        >
          <Image
            source={require("@assets/revelcy_logo_long.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <SvgIconButton
            color={colors.onSurface}
            onPress={onClose}
            name="x-base"
            size={30}
          />
        </View>
        <NavigationBurgerMenuItemLine
          label="Home"
          icon="revelcy-r"
          action={() => {
            router.push("/");
            onClose();
          }}
        />
        {navigationItems.map((navigationItem) => {
          return (
            <NavigationBurgerMenuItemLine
              label={navigationItem.label}
              icon={navigationItem.iconActive}
              action={() => {
                router.push(navigationItem.route);
                onClose();
              }}
            />
          );
        })}

        <View style={styles.lineContainer}>
          <NavigationProfileWidget style={styles.lineLogin} isMobile={false} />
        </View>

        <View style={[styles.lineContainer, styles.lineContact]}>
          <View style={{ flexDirection: "row" }}>
            <TouchableRipple
              onPress={() => {}}
              style={{ padding: 16, paddingRight: 40 }}
            >
              <SvgIcon name="x-logo" size={24} color={colors.onSurface} />
            </TouchableRipple>
            <View
              style={{
                alignSelf: "center",
                width: 1,
                height: 24,
                backgroundColor: colors.outlineVariant,
              }}
            />
            <TouchableRipple
              onPress={() => {}}
              style={{ padding: 16, paddingHorizontal: 40 }}
            >
              <SvgIcon name="tg-logo" size={24} color={colors.onSurface} />
            </TouchableRipple>
            <View
              style={{
                alignSelf: "center",
                width: 1,
                height: 24,
                backgroundColor: colors.outlineVariant,
              }}
            />
            <TouchableRipple
              onPress={() => {}}
              style={{ padding: 16, paddingLeft: 40 }}
            >
              <SvgIcon name="mail" size={24} color={colors.onSurface} />
            </TouchableRipple>
          </View>
        </View>
      </View>
    </TouchableRipple>
  );
}

interface MenuItemLineProps {
  icon: IconName;
  label: string;
  action: () => void;
}
function NavigationBurgerMenuItemLine({
  icon,
  label,
  action,
}: MenuItemLineProps) {
  const { colors } = useTheme();
  return (
    <TouchableRipple onPress={action}>
      <View style={[styles.lineContainer, styles.lineNavigationItem]}>
        <SvgIcon name={icon} color={colors.onSurface} size={24} />
        <Text variant="labelMedium" style={{ color: colors.onSurface }}>
          {label}
        </Text>
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  lineContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  lineLogin: {
    padding: 16,
    width: "100%",
  },
  lineMainMenu: {
    padding: 16,
    justifyContent: "space-between",
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  lineContact: {
    justifyContent: "center",
    alignItems: "center",
  },
  lineNavigationItem: {
    justifyContent: "flex-start",
    gap: 12,
    padding: 16,
  },
  logo: {
    width: 96,
    height: 24,
  },
});
