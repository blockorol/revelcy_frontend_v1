// UniversalOverlayProvider.tsx
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { View, Pressable } from 'react-native';
import { useTheme } from 'react-native-paper';

interface OverlayContextType {
  open: (content: ReactNode) => void;
  replace: (content: ReactNode) => void;
  close: () => void;
  isOpen: boolean;
}

const OverlayContext = createContext<OverlayContextType | null>(null);

export const useOverlay = (): OverlayContextType => {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error('useOverlay must be used within a UniversalOverlayProvider');
  return ctx;
};

type Props = {
  children: ReactNode;
  dismissOnBackdropPress?: boolean;
};

export const UniversalOverlayProvider: React.FC<Props> = ({
  children,
  dismissOnBackdropPress = true,
}) => {
  const theme = useTheme();
  const [content, setContent] = useState<ReactNode | null>(null);

  const open = useCallback((node: ReactNode) => setContent(node), []);
  const replace = useCallback((node: ReactNode) => setContent(node), []);
  const close = useCallback(() => setContent(null), []);

  const isOpen = !!content;

  return (
    <OverlayContext.Provider value={{ open, replace, close, isOpen }}>
      {children}

      {isOpen && (
        <View
          style={{
            position: "fixed" as any,
            inset: 0 as any,
            width: "100%",
            height: "100%",
            zIndex: 9999,
            backgroundColor: "transparent",
          }}
          pointerEvents="box-none"
        >
          {/* 1) Backdrop (фон) */}
          {dismissOnBackdropPress && (
            <Pressable
              style={{
                position: "absolute",
                inset: 0 as any,
                width: "100%",
                height: "100%",
                backgroundColor: theme.colors.shadow,
              }}
              onPress={close}
            />
          )}
          <View
            style={{
              position: "absolute",
              inset: 0 as any,
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
            pointerEvents="box-none"
          >
            {content}
          </View>
        </View>
      )}

    </OverlayContext.Provider>
  );
};
