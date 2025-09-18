import React, { useState, useMemo } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { Avatar, Text, useTheme, Surface, Menu } from 'react-native-paper';
import Login from '@components/login/LoginButton';
import { SvgIcon } from '@components/base/SvgIcon';
import { useAuth } from '@storage/AuthContext';
import shortString from '@utils/address_shorter';
import { useUserModal } from '@storage/UserModalContext';
import type { AppTheme, ExtendedMD3Colors } from '@theme/types';

export function NavigationProfileWidget() {
  const { user, logout } = useAuth();
  const { roundness, colors, fonts} = useTheme() as AppTheme;
  const mdColors = colors as ExtendedMD3Colors;
  const { openUserModal } = useUserModal();
  const [menuVisible, setMenuVisible] = useState(false);

  if (!user) {
    return (
      <Surface style={[styles.surface, { backgroundColor: 'transparent' }]}>
        <Login />
      </Surface>
    );
  }

  return (
    <Menu
      mode='flat'
      visible={menuVisible}
      onDismiss={() => setMenuVisible(false)}
      anchor={
        <Pressable
          onPress={() => setMenuVisible(true)}   
          onHoverIn={() => setMenuVisible(true)}        
          onLongPress={() => setMenuVisible(true)}    
          accessibilityRole="button"
        >
          <Surface
            elevation={2}
            style={[
              styles.surface,
              {
                backgroundColor: mdColors.surface,
                borderRadius: roundness,
                paddingHorizontal: 12,
                paddingVertical: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              },
            ]}
          >
            {user.avatarUrl ? (
              <Avatar.Image
                size={36}
                source={{ uri: user.avatarUrl }}
                style={{
                  backgroundColor: mdColors.elevation.level1,
                  borderColor: mdColors.primary,
                  borderWidth: 1,
                }}
              />
            ) : (
              <SvgIcon name="smile-outlined" size={36} color={mdColors.primary} />
            )}

            <Text variant="labelLarge" style={{ color: mdColors.onSurface }}>
              {user.username !== '' ? user.username : shortString(user.walletAddress, 4)}
            </Text>
          </Surface>
        </Pressable>
      }
      contentStyle={{
        marginTop:42,
        backgroundColor: mdColors.surfaceContainerLow,
        borderRadius: roundness,
      }}
    >
      <Menu.Item
        onPress={() => {
          setMenuVisible(false);
          openUserModal(user);
        }}
        title="My Profile"
        titleStyle={fonts.labelMedium}
      />
      <Menu.Item
        onPress={() => {
          setMenuVisible(false);
          logout();
        }}
        title="Logout"
        titleStyle={fonts.labelMedium}
        leadingIcon="logout"
      />
    </Menu>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderRadius: 100,
    justifyContent: 'center',
  },
});
