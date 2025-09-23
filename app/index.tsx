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
        <iframe
          src={FRAMER_URL}
          style={{ border: "none", width: "100%", height: "100%" }}
          title="Framer"
        />
      ) : (
        <WebView
          source={{ uri: FRAMER_URL }}
          startInLoadingState
          renderLoading={() => (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator />
            </View>
          )}
          pullToRefreshEnabled
          onScroll={() => {}}
          originWhitelist={["*"]}
          allowsInlineMediaPlayback
          javaScriptEnabled
          domStorageEnabled
        />
      )}
    </View>
  );
}
