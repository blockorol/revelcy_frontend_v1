import * as React from "react";
import { Platform, StyleSheet, View, useWindowDimensions } from "react-native";
import {
    Button,
    Modal,
    Portal,
    Text,
    useTheme,
    Switch,
    Divider,
    TouchableRipple,
} from "react-native-paper";
import type { AppTheme } from "@theme/types";


const BANNER_H = 120;     
const PAD_V = 12;        
const PAD_H = 16;      
const FRAME_W = 1100;    
const GAP = 24;         
const BTN_W = 88;        
const BTN_H = 24;         
const BTN_RADIUS = 10;
const SECONDARY = "#00C3FF";

// компактная типографика
const TITLE_FS = 16;
const TITLE_LH = 22;
const BODY_FS = 12;
const BODY_LH = 16;

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
            return {
                accepted: false,
                prefs: { necessary: true, analytics: true, personalization: true, marketing: false },
            };
        }
        return JSON.parse(raw);
    } catch {
        return {
            accepted: false,
            prefs: { necessary: true, analytics: true, personalization: true, marketing: false },
        };
    }
}

function savePrefs(accepted: boolean, prefs: ConsentPrefs) {
    if (Platform.OS === "web" && hasWindow()) {
        try {
            window.localStorage.setItem(LS_KEY, JSON.stringify({ accepted, prefs }));
        } catch { }
    }
}

export default function CookiesModal() {
    const theme = useTheme<AppTheme>();
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    const initialRef = React.useRef(loadPrefsOnce());
    const [visible, setVisible] = React.useState<boolean>(!initialRef.current.accepted);
    const [prefsVisible, setPrefsVisible] = React.useState(false);
    const [prefs, setPrefs] = React.useState<ConsentPrefs>(initialRef.current.prefs);

    const acceptAll = React.useCallback(() => {
        const next = { necessary: true, analytics: true, personalization: true, marketing: true };
        savePrefs(true, next);
        setPrefs(next);
        setVisible(false);
        setPrefsVisible(false);
    }, []);

    const rejectAll = React.useCallback(() => {
        const next = { necessary: true, analytics: false, personalization: false, marketing: false };
        savePrefs(true, next);
        setPrefs(next);
        setVisible(false);
        setPrefsVisible(false);
    }, []);

    const saveSelection = React.useCallback(() => {
        savePrefs(true, prefs);
        setVisible(false);
        setPrefsVisible(false);
    }, [prefs]);

    const openManage = React.useCallback(() => setPrefsVisible(true), []);
    const closeManage = React.useCallback(() => setPrefsVisible(false), []);

    const showBanner = visible && !prefsVisible;
    if (!visible && !prefsVisible) return null;

    return (
        <>
            {/* ===== BANNER (компактный) ===== */}
            {showBanner && (
                <Portal>
                    <View
                        style={[
                            styles.banner,
                            {
                                backgroundColor: theme.colors.surfaceContainerHigh,
                                borderColor: theme.colors.outlineVariant,
                                height: isMobile ? "auto" : BANNER_H,
                                paddingHorizontal: isMobile ? 12 : PAD_H,
                                paddingVertical: isMobile ? 12 : PAD_V,
                            },
                        ]}
                        pointerEvents="auto"
                    >
                        <View
                            style={[
                                styles.frame,
                                {
                                    width: isMobile ? "100%" : FRAME_W,
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
                                    variant="bodyLarge"
                                    style={{
                                        color: theme.colors.onBackground,
                                        fontSize: TITLE_FS,
                                        lineHeight: TITLE_LH,
                                        fontWeight: "600",
                                    }}
                                    {...(!isMobile ? { numberOfLines: 1 } : {})}
                                >
                                    Cookies Policy
                                </Text>

                                <Text
                                    variant="bodyMedium"
                                    style={{
                                        color: theme.colors.onSurfaceVariant,
                                        marginTop: 4,
                                        fontSize: BODY_FS,
                                        lineHeight: BODY_LH,
                                    }}
                                    {...(!isMobile ? { numberOfLines: 3 } : {})}
                                >
                                    We use cookies to improve your experience, analyze site traffic, and personalize content.{"\n"}
                                    By continuing to browse, you agree to our use of cookies.

                                </Text>

                                <View style={styles.linksRow}>
                                    <Text
                                        variant="bodyMedium"
                                        style={[styles.linkText, Platform.OS === "web" ? { cursor: "pointer" } : null]}
                                        onPress={() => {
                                            if (Platform.OS === "web" && hasWindow()) window.open("/terms", "_blank");
                                        }}
                                        accessibilityRole="link"
                                    >
                                        Terms of Service
                                    </Text>
                                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, opacity: 0.7, marginHorizontal: 4 }}>
                                        and
                                    </Text>
                                    <Text
                                        variant="bodyMedium"
                                        style={[styles.linkText, Platform.OS === "web" ? { cursor: "pointer" } : null]}
                                        onPress={() => {
                                            if (Platform.OS === "web" && hasWindow()) window.open("/privacy", "_blank");
                                        }}
                                        accessibilityRole="link"
                                    >
                                        Privacy Policy
                                    </Text>

                                </View>
                            </View>

                            {/* Кнопки */}
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
                                    mode="outlined"
                                    onPress={openManage}
                                    style={[styles.btn, { minWidth: BTN_W, borderRadius: BTN_RADIUS }]}
                                    contentStyle={[
                                        styles.btnContent,
                                        { height: BTN_H, paddingHorizontal: isMobile ? 6 : 0 },
                                    ]}

                                    labelStyle={[styles.btnLabel, { color: "#fff" }]}
                                >
                                    Manage
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={acceptAll}
                                    buttonColor={SECONDARY}
                                    style={[styles.btn, { minWidth: BTN_W, borderRadius: BTN_RADIUS }]}
                                    contentStyle={[
                                        styles.btnContent,
                                        { height: BTN_H, paddingHorizontal: isMobile ? 6 : 0 },
                                    ]}

                                    labelStyle={styles.btnLabel}
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
                    contentContainerStyle={[styles.modal, { backgroundColor: useTheme().colors.surface }]}
                >
                    <Text variant="titleLarge" style={{ marginBottom: 8 }}>
                        Cookie Preferences
                    </Text>
                    <Text variant="bodyMedium" style={{ marginBottom: 16, color: useTheme().colors.onSurfaceVariant }}>
                        Select which cookies you want to allow. You can change these settings at any time.
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
                    <Text variant="titleMedium" style={{ color: theme.colors.onSurface, opacity: disabled ? 0.5 : 1 }}>
                        {title}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
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
        height: BANNER_H,
        paddingHorizontal: PAD_H,
        paddingVertical: PAD_V,
        borderTopWidth: StyleSheet.hairlineWidth,
        zIndex: 9999,
        elevation: 40,
        pointerEvents: "auto",
        overflow: "visible",
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

    linkBtn: { minWidth: 0, paddingHorizontal: 0 },
    linkBtnContent: { paddingHorizontal: 0 },

    linkText: {
        color: SECONDARY,
        textDecorationLine: "none",
        paddingHorizontal: 0,
    },

    actions: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
    },

    btn: { borderRadius: BTN_RADIUS },
    btnContent: { height: BTN_H, paddingHorizontal: 0 },
    btnLabel: { textTransform: "none", fontSize: 12 },

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
