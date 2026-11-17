// components/NavigationItem.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { useRouter } from "@hooks/useSafeRouter";
import { usePathname } from 'expo-router';
import { SvgIcon, IconName } from '@components/base/SvgIcon';
import { useLoginModal } from '@providers/LoginModalContext';
import { IS_SITE_SNAPSHOT } from 'env';

interface NavigationItemProps {
  iconActive: IconName;
  iconNotActive: IconName;
  label: string;
  route: string;
  horizontal?: boolean;
  isMobile: boolean;
  disabled?: boolean;
}

export function NavigationItem({
  isMobile,
  iconActive,
  iconNotActive,
  label,
  route,
  horizontal = false,
  disabled = false,
}: NavigationItemProps) {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { openMaintenance } = useLoginModal();
  const isActive = pathname === route;
  

  return (
    <TouchableRipple
      onPress={() => {
        if (!isActive && !disabled) {
          if (IS_SITE_SNAPSHOT && route === "/token/create") openMaintenance();
          else router.push(route);
        }
      }}
      borderless
      disabled={isActive || disabled}
      style={[
        isMobile ? styles.containerMobile : styles.containerDesktop,
        horizontal && styles.horizontalContainer,
      ]}
    >
      <View
        style={[
          styles.item,
          horizontal ? styles.horizontalItem : styles.verticalItem,
          {
            backgroundColor: theme.colors.background,
            opacity: disabled || (!isActive && isMobile) || isActive ? 0.5 : 1,
          },
        ]}
      >
        <SvgIcon
          name={isActive ? iconActive : iconNotActive}
          size={24}
          color={theme.colors.onSurface}
        />
        <Text
          variant='labelMedium'
          style={{ color: theme.colors.onSurface }}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  containerDesktop: {
    flexGrow: 0,
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
  containerMobile: {
    flex: 1,
    // flexGrow: 1,
    // flexShrink: 1,
    alignSelf: 'stretch',
  },
  horizontalContainer: {
    alignSelf: 'flex-start',
  },
  item: {
    alignItems: 'center',
    gap: 4,
  },
  verticalItem: {
    flexDirection: 'column',
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 12,
  },
  horizontalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
});
