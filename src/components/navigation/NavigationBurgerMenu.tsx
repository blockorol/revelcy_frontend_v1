import { IconName, SvgIcon, SvgIconButton } from "@components/base/SvgIcon";
import { View, Image, StyleSheet } from "react-native";
import { TouchableRipple, useTheme } from "react-native-paper";
import { Text } from "@components/ui/Text";
import { NavigationProfileWidget } from "@components/navigation/NavigationProfileWidget";
import { router, usePathname } from "expo-router";
import { navigationItems } from "@components/navigation/NavigationItems";
import { useOverlay } from "@storage/UniversalOverlayProvider";
import { openMailto, openTelegram, openX } from "@utils/openLinks";
import { useNetwork } from "@providers/NetworkContext";
import { openEmail } from "@utils/email";
import { useNotification } from "@providers/NotificationContext";

export default function NavigationBurgerMenu() {
  const { open, close } = useOverlay();
  const { colors } = useTheme();
  return (
    <SvgIconButton
      size={30}
      color={colors.onSurface}
      onPress={() => open(<NavigationBurgerMenuItemsList onClose={close}/>)}
      name="menu"
    />
  );
}
interface NavProps {
  onClose: () => void;
}
function NavigationBurgerMenuItemsList({ onClose }: NavProps) {
  const { colors } = useTheme();
  const pathname = usePathname();
  const {network} = useNetwork();
  const {success, warning}= useNotification();
  return (
    <View style={{ flexDirection:'column', width: '100%', height: '100%', justifyContent: 'flex-start', alignContent: 'flex-start', alignItems:'flex-start'}} >
      <View style={{ backgroundColor: colors.background, width: '100%',}}>
        <View
          id="main-menu-item"
          style={[
            styles.lineContainer,
            styles.lineMainMenu,
            { borderColor: colors.outlineVariant },
          ]}
        >
          <View style={{flexDirection:'row', alignItems: 'center'}}>
            <Image
              source={require("@assets/revelcy_logo_long.png")}
              style={{width: 96, height:24}}
              resizeMode="contain"
            />
            {network === 'devnet'&&<Text variant='labelSmall' prominent style={{marginBottom: 20, marginLeft: 5, paddingHorizontal: 5, color:colors.onSecondary, backgroundColor: colors.secondary, borderRadius: 5}}>DEV</Text>}
          </View>
          <View style={{justifyContent: 'center', }}>
          <SvgIconButton
            color={colors.onSurface}
            onPress={onClose}
            name="x-base"
            size={30}
          />
          </View>
        </View>
        {/* <NavigationBurgerMenuItemLine
          label="Home"
          icon="revelcy-r"
          action={() => {
            router.push("/");
            onClose();
          }}
        /> */}
        {navigationItems.map((navigationItem) => {
          return (
            <NavigationBurgerMenuItemLine
              key={`nav-${navigationItem.label}`}
              label={navigationItem.labelShort}
              icon={navigationItem.iconActive}
              action={() => {
                router.push(navigationItem.route);
                onClose();
              }}
              disabled={pathname === navigationItem.route}
            />
          );
        })}

        <View style={[styles.lineContainer]}>
          <NavigationProfileWidget style={styles.lineLogin} isMobile={false} />
        </View>

        <View style={[styles.lineContainer, styles.lineContact]}>
          <View style={{ flexDirection: "row" }}>
            <TouchableRipple
              onPress={() => {openX()}}
              style={{ padding: 16, paddingHorizontal: 40 }}
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
              onPress={() => {openTelegram()}}
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
              onPress={() => {
                openEmail({
                  to: "hello@revelcy.com",
                  subject: "Revelcy support",
                  body: "Hi!\n\nPlease, describe your question...",
                })
                  .then((res) => {
                    if (res === "copied") success("Email copied");
                    else if (res === "failed") warning("Please, copy the email: hello@revelcy.com");
                  })
                  .catch(() => warning("Please, copy the email: hello@revelcy.com"));

              }}
              accessibilityRole="link"
              accessibilityLabel="Write to hello@revelcy.com"
              style={{ padding: 16, paddingHorizontal: 40 }}
            >
              <SvgIcon name="mail" size={24} color={colors.onSurface} />
            </TouchableRipple>
          </View>
        </View>
      </View>
    </View>
  );
}

interface MenuItemLineProps {
  icon: IconName;
  label: string;
  action: () => void;
  disabled?: boolean;
}
function NavigationBurgerMenuItemLine({
  icon,
  label,
  action,
  disabled = false,
}: MenuItemLineProps) {
  const { colors } = useTheme();
  return (
    <TouchableRipple 
      onPress={() => {
        if (!disabled) {
          action();
        }
      }}
      disabled={disabled}
    >
      <View style={[
        styles.lineContainer, 
        styles.lineNavigationItem,
        { opacity: disabled ? 0.5 : 1 }
      ]}>
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
    height: 57,
    paddingHorizontal: 16,
    justifyContent: "space-between",
    borderBottomWidth: 1,
    // marginBottom: 8,
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
