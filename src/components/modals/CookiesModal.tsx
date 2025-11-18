import * as React from "react";
import { Platform, StyleSheet, View } from "react-native";
import {
  Modal,
  Portal,
  useTheme,
  Switch,
  Divider,
  TouchableRipple,
} from "react-native-paper";
import type { AppTheme } from "@theme/types";
import useIsMobile from "@hooks/useIsMobile";
import { Button } from "@components/ui/Button";
import { Text } from "@components/ui/Text";
import { useNotification } from "@providers/NotificationContext";

/** компактный баннер */
const BANNER_H = 120;
const PAD_V = 12;
const PAD_H = 16;
const FRAME_W = 1100;
const GAP = 24;

type ConsentPrefs = {
  necessary: boolean;
  analytics: boolean;
  personalization: boolean;
  marketing: boolean;
};

const LS_KEY = "cookie-consent-v1";
const hasWindow = () => typeof window !== "undefined";

function loadPrefsOnce(): { accepted: boolean; prefs: ConsentPrefs } {
  try {
    const raw =
      Platform.OS === "web" && hasWindow()
        ? window.localStorage.getItem(LS_KEY)
        : null;
    if (!raw) {
      // по умолчанию только necessary = true, остальные false
      return {
        accepted: false,
        prefs: {
          necessary: true,
          analytics: false,
          personalization: false,
          marketing: false,
        },
      };
    }
    return JSON.parse(raw) as { accepted: boolean; prefs: ConsentPrefs };
  } catch (e) {
    console.error("CookiesModal: failed to load prefs", e);
    return {
      accepted: false,
      prefs: {
        necessary: true,
        analytics: false,
        personalization: false,
        marketing: false,
      },
    };
  }
}

function savePrefs(accepted: boolean, prefs: ConsentPrefs): boolean {
  if (Platform.OS === "web" && hasWindow()) {
    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify({ accepted, prefs }));
      return true;
    } catch (e) {
      console.error("CookiesModal: failed to save prefs", e);
      return false;
    }
  }
  return true;
}

export default function CookiesModal() {
  const theme = useTheme<AppTheme>();
  const isMobile = useIsMobile();
  const { error } = useNotification();

  const initialRef = React.useRef(loadPrefsOnce());
  const [visible, setVisible] = React.useState<boolean>(
    !initialRef.current.accepted
  );
  const [prefsVisible, setPrefsVisible] = React.useState(false);
  const [prefs, setPrefs] = React.useState<ConsentPrefs>(
    initialRef.current.prefs
  );

  const acceptAll = React.useCallback(() => {
    const next: ConsentPrefs = {
      necessary: true,
      analytics: true,
      personalization: true,
      marketing: true,
    };
    const ok = savePrefs(true, next);
    if (!ok) {
      error("Failed to save cookie preferences. Please try again.");
      return;
    }
    setPrefs(next);
    setVisible(false);
    setPrefsVisible(false);
  }, [error]);

  const rejectAll = React.useCallback(() => {
    const next: ConsentPrefs = {
      necessary: true,
      analytics: false,
      personalization: false,
      marketing: false,
    };
    const ok = savePrefs(true, next);
    if (!ok) {
      error("Failed to save cookie preferences. Please try again.");
      return;
    }
    setPrefs(next);
    setVisible(false);
    setPrefsVisible(false);
  }, [error]);

  const saveSelection = React.useCallback(() => {
    const ok = savePrefs(true, prefs);
    if (!ok) {
      error("Failed to save cookie preferences. Please try again.");
      return;
    }
    setVisible(false);
    setPrefsVisible(false);
  }, [prefs, error]);

  const openManage = React.useCallback(() => setPrefsVisible(true), []);
  const closeManage = React.useCallback(() => setPrefsVisible(false), []);

  const showBanner = visible && !prefsVisible;
  if (!visible && !prefsVisible) return null;

  return (
    <>
      {/* ===== Banner ===== */}
      {showBanner && (
        <Portal>
          <View
            style={[
              styles.banner,
              {
                backgroundColor: theme.colors.surfaceContainerHigh,
                borderColor: theme.colors.outlineVariant,
                paddingHorizontal: isMobile ? 12 : PAD_H,
                paddingVertical: isMobile ? 12 : PAD_V,
                ...(isMobile ? {} : { minHeight: BANNER_H }),
              },
            ]}
            pointerEvents="auto"
          >
            <View
              style={[
                styles.frame,
                {
                  width: "100%",
                  maxWidth: FRAME_W,
                  flexDirection: isMobile ? "column" : "row",
                  alignItems: isMobile ? "flex-start" : "center",
                  justifyContent: isMobile ? "flex-start" : "space-between",
                  rowGap: isMobile ? 10 : GAP,
                  columnGap: isMobile ? 10 : GAP,
                },
              ]}
            >
              {/* Текст */}
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  variant="titleSmall"
                  prominent
                  style={{
                    color: theme.colors.onBackground,
                  }} 
                >
                  Cookies Policy
                </Text>

                <Text
                  variant="bodyMedium"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    marginTop: 4,
                  }}
                >
                  We use cookies to improve your experience, analyze site traffic,
                  and personalize content. By continuing to browse, you agree to
                  our use of cookies.
                </Text>

                <View style={styles.linksRow}>
                  <Text
                    variant="bodyMedium"
                    style={[
                      styles.linkText,
                      Platform.OS === "web" ? { cursor: "pointer" } : null,
                      { color: theme.colors.secondary },
                    ]}
                    onPress={() => {
                      if (Platform.OS === "web" && hasWindow())
                        window.open("/terms", "_blank");
                    }}
                    accessibilityRole="link"
                  >
                    Terms of Service
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: theme.colors.onSurfaceVariant,
                      opacity: 0.7,
                      marginHorizontal: 4,
                    }}
                  >
                    and
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={[
                      styles.linkText,
                      Platform.OS === "web" ? { cursor: "pointer" } : null,
                      { color: theme.colors.secondary },
                    ]}
                    onPress={() => {
                      if (Platform.OS === "web" && hasWindow())
                        window.open("/privacy", "_blank");
                    }}
                    accessibilityRole="link"
                  >
                    Privacy Policy
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View
                style={[
                  styles.actions,
                  {
                    alignSelf: isMobile ? "stretch" : "auto",
                    justifyContent: isMobile ? "flex-start" : "flex-end",
                    gap: isMobile ? 8 : 10,
                    flexWrap: isMobile ? "wrap" : "nowrap",
                    marginTop: isMobile ? 12 : 60,
                    marginRight: 0,
                  },
                ]}
              >
                <Button
                  variant="secondary"
                  mode="outlined"
                  size="small"
                  onPress={openManage}
                >
                  Manage
                </Button>
                <Button
                  variant="secondary"
                  mode="contained"
                  size="small"
                  onPress={acceptAll}
                >
                  Accept All
                </Button>
              </View>
            </View>
          </View>
        </Portal>
      )}

      {/* ===== MODAL: Manage ===== */}
      <Portal>
        <Modal
          visible={prefsVisible}
          onDismiss={closeManage}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text variant="titleLarge" style={{ marginBottom: 8 }}>
            Cookie Preferences
          </Text>
          <Text
            variant="bodyMedium"
            style={{ marginBottom: 16, color: theme.colors.onSurfaceVariant }}
          >
            Select which cookies you want to allow. You can change these settings
            at any time.
          </Text>

          <PrefRow
            title="Necessary"
            description="Required for basic site functionality."
            value={true}
            disabled
            onToggle={() => { }}
          />
          <Divider />
          <PrefRow
            title="Analytics"
            description="Helps us understand how the site is used."
            value={prefs.analytics}
            onToggle={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
          />
          <Divider />
          <PrefRow
            title="Personalization"
            description="Remembers your choices and customizes content."
            value={prefs.personalization}
            onToggle={(v) => setPrefs((p) => ({ ...p, personalization: v }))}
          />
          <Divider />
          <PrefRow
            title="Marketing"
            description="Used to deliver and measure advertisements."
            value={prefs.marketing}
            onToggle={(v) => setPrefs((p) => ({ ...p, marketing: v }))}
          />

          <View style={styles.modalActions}>
            <Button mode="text" onPress={rejectAll}>
              Reject All
            </Button>
            <View style={{ flex: 1 }} />
            <Button mode="outlined" onPress={closeManage} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button mode="contained" onPress={saveSelection}>
              Save
            </Button>
          </View>
        </Modal>
      </Portal>
    </>
  );
}

function PrefRow({
  title,
  description,
  value,
  onToggle,
  disabled,
}: {
  title: string;
  description: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  disabled?: boolean;
}) {
  const theme = useTheme<AppTheme>();
  return (
    <TouchableRipple
      onPress={() => {
        if (disabled) return;
        onToggle(!value);
      }}
      disabled={disabled}
    >
      <View style={styles.prefRow}>
        <View style={{ flex: 1 }}>
          <Text
            variant="titleMedium"
            style={{ color: theme.colors.onSurface, opacity: disabled ? 0.5 : 1 }}
          >
            {title}
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {description}
          </Text>
        </View>
        <Switch value={value} onValueChange={onToggle} disabled={disabled} />
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: Platform.OS === "web" ? ("fixed" as any) : "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: PAD_H,
    paddingVertical: PAD_V,
    borderTopWidth: StyleSheet.hairlineWidth,
    zIndex: 9999,
    elevation: 40,
    pointerEvents: "box-none",
  },
  frame: {
    alignSelf: "center",
    justifyContent: "space-between",
    alignItems: "center",
  },
  linksRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: Platform.OS === "web" ? 12 : 16,
  },
  linkText: {
    textDecorationLine: "none",
    paddingHorizontal: 0,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  modal: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    maxWidth: 720,
    alignSelf: "center",
  },
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
  },
  modalActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
});
