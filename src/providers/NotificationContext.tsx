// providers/NotificationContext.tsx
import { SvgIcon } from "@components/base/SvgIcon";
import useIsMobile from "@hooks/useIsMobile";
import { ExtendedMD3Colors } from "@theme/types";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { Platform, ViewStyle, View } from "react-native";
import { Portal, Snackbar, useTheme, Text, Button } from "react-native-paper";

type NoticeType = "info" | "success" | "warning" | "error";
const MAX_TEXT_WIDTH = 340;
const MAX_WIDTH = 412;

export type NoticeOptions = {
  type?: NoticeType;
  suggest?: string;
  duration?: number; // ms, default 3000 ms
  action?: {
    label: string;
    onAction: () => void;
  };
};

type QueueItem = {
  id: number;
  message: string;
  options: NoticeOptions;
};

type NotificationContextValue = {
  show: (message: string, options?: NoticeOptions) => void;
  info: (message: string, options?: Omit<NoticeOptions, "type">) => void;
  success: (message: string, options?: Omit<NoticeOptions, "type">) => void;
  warning: (message: string, options?: Omit<NoticeOptions, "type">) => void;
  error: (message: string, options?: Omit<NoticeOptions, "type">) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(
  null
);

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotification must be used within <NotificationProvider>"
    );
  return ctx;
};

export const NotificationProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const theme = useTheme();
  const colors = theme.colors as ExtendedMD3Colors;
  const [current, setCurrent] = useState<QueueItem | null>(null);
  const queueRef = useRef<QueueItem[]>([]);
  const idRef = useRef(0);
  const isMobile = useIsMobile();

  const dequeue = useCallback(() => {
    const next = queueRef.current.shift() ?? null;
    setCurrent(next);
  }, []);

  const enqueue = useCallback(
    (message: string, options: NoticeOptions = {}) => {
      const item: QueueItem = { id: ++idRef.current, message, options };
      queueRef.current.push(item);
      if (!current) dequeue();
    },
    [current, dequeue]
  );

  const show = useCallback(
    (message: string, options?: NoticeOptions) => enqueue(message, options),
    [enqueue]
  );
  const info = useCallback(
    (m: string, o?: Omit<NoticeOptions, "type">) =>
      show(m, { ...o, type: "info" }),
    [show]
  );
  const success = useCallback(
    (m: string, o?: Omit<NoticeOptions, "type">) =>
      show(m, { ...o, type: "success" }),
    [show]
  );
  const warning = useCallback(
    (m: string, o?: Omit<NoticeOptions, "type">) =>
      show(m, { ...o, type: "warning" }),
    [show]
  );
  const error = useCallback(
    (m: string, o?: Omit<NoticeOptions, "type">) =>
      show(m, { ...o, type: "error" }),
    [show]
  );

  const value = useMemo(
    () => ({ show, info, success, warning, error }),
    [show, info, success, warning, error]
  );

  const onDismiss = useCallback(() => {
    setCurrent(null);
    // small timeout to close animation
    setTimeout(dequeue, 200);
  }, [dequeue]);

  const handleActionPress = useCallback(async () => {
    const fn = current?.options.action?.onAction;
    try {
      await Promise.resolve(fn?.());
    } finally {
      onDismiss();
    }
  }, [current, onDismiss]);

  const getIconColor = (t?: NoticeType) => {
    switch (t) {
      case "success":
        return colors.primary;
      case "warning":
        return colors.yellow;
      case "error":
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const containerStyle: ViewStyle =
    Platform.OS === "web" && !isMobile
      ? {
          position: "absolute",
          left: 16,
          bottom: 16,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
          maxWidth: MAX_WIDTH,
          alignSelf: "flex-start",
        }
      : {
          position: "absolute",
          bottom: 16,
          left: 16,
          right: 16,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
          alignSelf: "center",
        };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Portal>
        {current && (
          <Snackbar
            visible={!!current}
            onDismiss={onDismiss}
            duration={current?.options.duration ?? 3000}
            wrapperStyle={containerStyle}
            style={{
              backgroundColor: colors.surfaceContainerHigh,
              ...containerStyle,
            }}
          >
            <View
              style={{ flexDirection: "row", gap: 2, alignItems: "center" }}
            >
              <SvgIcon
                name="info-circle"
                size={24}
                color={getIconColor(current.options.type)}
              />
              <View
                style={{
                  flexDirection: "column",
                  paddingLeft: 14,
                  flex: 2,
                  gap: 8,
                }}
              >
                <Text
                  variant="bodyMedium"
                  style={{
                    maxWidth: MAX_TEXT_WIDTH,
                    color: colors.onSurfaceVariant,
                  }}
                >
                  {current.message}
                </Text>
                {!!current.options.suggest && (
                  <Text
                    variant="bodyMedium"
                    style={{
                      maxWidth: MAX_TEXT_WIDTH,
                      color: colors.onSurfaceVariant,
                    }}
                  >
                    {current.options.suggest}
                  </Text>
                )}
              </View>
              {current.options.action && (
                <View style={{ flexShrink: 0 }}>
                  <Button
                    mode="text"
                    onPress={handleActionPress}
                    labelStyle={{ flexShrink: 0, textAlign: "center" }}
                  >
                    {current.options.action.label}
                  </Button>
                </View>
              )}
            </View>
          </Snackbar>
        )}
      </Portal>
    </NotificationContext.Provider>
  );
};
