import "../src/polyfills";
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import CookiesModal from "@components/modals/CookiesModal";
import Head from "expo-router/head";
import { PaperProvider, Portal } from "react-native-paper";
import {
  View,
  StyleSheet,
  useColorScheme,
  StatusBar,
  Platform,
} from "react-native";
import { darkTheme } from "@theme/theme";
import { NavigationTop } from "@components/navigation/NavigationTop";
import { NetworkProvider } from "@providers/NetworkContext";
import { WalletProvider } from "@storage/wallet-adapter/index";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Inter_100Thin,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_900Black,
} from "@expo-google-fonts/inter";
import { en, registerTranslation } from "react-native-paper-dates";

registerTranslation("en", en);

import process from "process";
import { AuthProvider } from "@providers/AuthContext";
import { ContentAreaProvider, useContentArea } from "@hooks/useContentArea";
import { UserModalProvider } from "@storage/UserModalContext";
import { NotificationProvider } from "@providers/NotificationContext";
import { UniversalOverlayProvider } from "@storage/UniversalOverlayProvider";

if (typeof globalThis.process === "undefined") {
  globalThis.process = process;
}

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Inter_100Thin,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_900Black,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <>
      <Head>
        <title>Revelcy</title>
      </Head>
      <NetworkProvider>
        <AuthProvider>
          <WalletProvider>
            <ContentAreaProvider>
              <InnerLayout />
            </ContentAreaProvider>
          </WalletProvider>
        </AuthProvider>
      </NetworkProvider>
    </>
  );
}

function InnerLayout() {
  const scheme = useColorScheme();

  const theme = darkTheme;
  const { setTopHeight } = useContentArea();

  useEffect(() => {
    if (Platform.OS === "web") {
      const darkColor = darkTheme.colors.background;
      const currentColor = darkColor;

      const setMetaThemeColor = (color: string) => {
        let meta = document.querySelector(
          'meta[name="theme-color"]'
        ) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement("meta");
          meta.name = "theme-color";
          document.head.appendChild(meta);
        }
        meta.content = color;
      };

      setMetaThemeColor(currentColor);
    }
  }, [scheme]);

  return (
    <PaperProvider theme={theme}>
      <NotificationProvider>
        <UserModalProvider>
          <UniversalOverlayProvider>
            <Portal.Host>

              <StatusBar
                barStyle={scheme === "dark" ? "light-content" : "dark-content"}
                backgroundColor={theme.colors.background}
              />

              <View
                style={[
                  styles.container,
                  { backgroundColor: theme.colors.background },
                ]}
              >
                <View onLayout={(e) => setTopHeight(e.nativeEvent.layout.height)}>
                  <NavigationTop />
                </View>
                <Stack screenOptions={{ headerShown: false }} />
                {/* 
                <View onLayout={(e) => setBottomHeight(e.nativeEvent.layout.height)}>
                  <NavigationBottom />
                </View> 
              */}
                <CookiesModal />
              </View>

            </Portal.Host>
          </UniversalOverlayProvider>
        </UserModalProvider>
      </NotificationProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});
