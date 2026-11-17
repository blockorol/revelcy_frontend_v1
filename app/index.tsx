import { useEffect, useRef } from "react";
import { useIsMobileWithDemention } from "@hooks/useIsMobile";
import { ActivityIndicator, Platform, View } from "react-native";
import { useTheme } from "react-native-paper";
import { WebView } from "react-native-webview";
import { useLoginModal } from "@providers/LoginModalContext";
import { IS_SITE_SNAPSHOT } from "env";

const FRAMER_URL = "https://revelcy.com/";

export default function FramerScreen() {
  const theme = useTheme();
  const { openMaintenance } = useLoginModal();
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!IS_SITE_SNAPSHOT) return;
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.source === frame.current?.contentWindow &&
        event.data === "revelcy:contact"
      ) {
        openMaintenance();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [openMaintenance]);
  
  const {width, isMobile} = useIsMobileWithDemention();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {Platform.OS === "web" ? (
        <View
          style={{
            flex: 1,
            position: "relative",
            backgroundColor: theme.colors.background,
            overflow: "hidden",
          }}
        >
          <iframe
            ref={frame}
            src={IS_SITE_SNAPSHOT ? "/about-snapshot/home.html" : FRAMER_URL}
            title="About Revelcy"
            sandbox={IS_SITE_SNAPSHOT
              ? "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              : "allow-scripts allow-same-origin allow-popups allow-forms"}
            style={{
              border: "none",
              width: width + (isMobile ? 0 : 15),
              height: "100%",
            }}
          />
        </View>
      ) : (
        <WebView
          source={{ uri: FRAMER_URL }}
          startInLoadingState
          renderLoading={() => (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator />
            </View>
          )}
          pullToRefreshEnabled
          onScroll={() => {}}
          originWhitelist={["*"]}
          allowsInlineMediaPlayback
          javaScriptEnabled
          domStorageEnabled
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  );
}
