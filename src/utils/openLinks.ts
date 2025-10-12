// openLinks.ts
import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

async function openInBrowser(url: string) {
  if (Platform.OS === "web") {
    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    await WebBrowser.openBrowserAsync(url);
  }
}

export async function openMailto(email = "hello@revelcy.com") {
  const mailto = `mailto:${email}`;
  const supported = await Linking.canOpenURL(mailto);
  if (supported) return Linking.openURL(mailto);
}

export async function openTelegram(username = "revelcy") {
  const appUrl = `tg://resolve?domain=${username}`;
  const webUrl = `https://t.me/${username}`;
  if (await Linking.canOpenURL(appUrl)) return Linking.openURL(appUrl);
  return openInBrowser(webUrl);
}

export async function openX(screenName = "revelcycom") {
  const appUrl = `twitter://user?screen_name=${screenName}`;
  const webUrl = `https://x.com/${screenName}`;
  if (await Linking.canOpenURL(appUrl)) return Linking.openURL(appUrl);
  return openInBrowser(webUrl);
}
