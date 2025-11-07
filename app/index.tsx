// app/framer.tsx
import { ActivityIndicator, Platform, View } from "react-native";
import { useTheme } from "react-native-paper";
import { WebView } from "react-native-webview";

const FRAMER_URL = "https://revelcy.com/";

export default function FramerScreen() {
  const theme = useTheme();
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
            src={FRAMER_URL}
            title="Framer"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            style={{
              border: "none",
              width: "100%",
              height: "100%",
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 18,
              height: "100%",
              backgroundColor: theme.colors.background,
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
