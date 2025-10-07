import * as React from 'react';
import { View } from 'react-native';
import { Modal, Portal, useTheme, Surface } from 'react-native-paper';

export function MobileBottomSheet({
  visible,
  onDismiss,
  children,
}: {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
}) {
  const theme = useTheme();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: theme.colors.surface,
          padding: 16,
        }}
      >
        <Surface
          elevation={4}
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 24,
          }}
        >
          <View
            style={{
              alignSelf: 'center',
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: theme.colors.outlineVariant,
              marginBottom: 16,
            }}
          />
          {children}
        </Surface>
      </Modal>
    </Portal>
  );
}
