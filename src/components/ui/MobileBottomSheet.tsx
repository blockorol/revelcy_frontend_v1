// MobileBottomSheet.tsx
import * as React from 'react';
import { View, Animated, PanResponder, Easing, Platform } from 'react-native';
import { Modal, Portal, useTheme, Surface, IconButton } from 'react-native-paper';

const CLOSE_DY = 90;       // сколько протянуть вниз, чтобы закрыть
const CLOSE_VY = 1.0;      // или достаточно быстрый "смах" вниз

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

  const translateY = React.useRef(new Animated.Value(0)).current;

  // анимация к целевому положению (0 — открыто; 100% — скрыто)
  const to = React.useCallback((y: number, cb?: () => void) => {
    Animated.timing(translateY, {
      toValue: y,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => cb && cb());
  }, [translateY]);

  // при открытии — сбрасываем позицию
  React.useEffect(() => {
    if (visible) {
      translateY.setValue(Platform.OS === 'ios' ? 16 : 0); // лёгкий “прыжок”
      requestAnimationFrame(() => to(0));
    } else {
      translateY.setValue(0);
    }
  }, [visible, to, translateY]);

  const pan = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 2, // тянем только вниз
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > CLOSE_DY || g.vy > CLOSE_VY) {
          // закрываем
          to(300, onDismiss);
        } else {
          // возвращаем на место
          to(0);
        }
      },
    })
  ).current;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}          // тап по фону/назад — закрывает
        dismissable
        contentContainerStyle={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          padding: 0,                 // всё внутри Surface
        }}
      >
        <Animated.View
          style={{
            transform: [{ translateY }],
          }}
          // Позволяем тянуть за любой пустой участок (включая ручку)
          {...pan.panHandlers}
        >
          <Surface
            elevation={4}
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingBottom: 16,
              paddingTop: 8,
              paddingHorizontal: 16,
            }}
          >
            {/* ручка + крестик */}
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 4,
                paddingBottom: 8,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: theme.colors.outlineVariant,
                }}
              />
            </View>

            {children}
          </Surface>
        </Animated.View>
      </Modal>
    </Portal>
  );
}
