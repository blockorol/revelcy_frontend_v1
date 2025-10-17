// components/NavigationItem.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { usePathname, useRouter } from 'expo-router';
import { SvgIcon, IconName } from '@components/base/SvgIcon';

interface NavigationItemProps {
  iconActive: IconName;
  iconNotActive: IconName;
  label: string;
  route: string;
  horizontal?: boolean;
  isMobile: boolean;
}

export function NavigationItem({
  isMobile,
  iconActive,
  iconNotActive,
  label,
  route,
  horizontal = false,
}: NavigationItemProps) {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const isActive = pathname === route;
  
  // Check if Create Premarket button should be disabled
  const isCreatePremarketDisabled = label === "Create Premarket" && pathname === "/token/create";

  return (
    <TouchableRipple
      onPress={() => {
        if (!isCreatePremarketDisabled) {
          router.push(route);
        }
      }}
      borderless
      disabled={isCreatePremarketDisabled}
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
            opacity: (!isActive && isMobile) || isCreatePremarketDisabled ? 0.5 : 1,
          },
        ]}
      >
        <SvgIcon
          name={isActive ? iconActive : iconNotActive}
          size={24}
          color={theme.colors.onSurface}
        />
        <Text
          variant='labelLarge'
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
