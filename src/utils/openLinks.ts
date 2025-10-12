// openLinks.ts
import { Platform } from "react-native";
import * as Linking from "expo-linking";

async function openInBrowser(url: string) {
  if (Platform.OS === "web") {
    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    await Linking.openURL(url);
  }
}

async function openAppOrBrowser(browserUrl: string, appUrl?: string) {
    if (Platform.OS !== "web" && appUrl &&await Linking.canOpenURL(appUrl)){
        await Linking.openURL(appUrl)
        return
    }
    return openInBrowser(browserUrl);
}

export async function openMailto(email = "hello@revelcy.com") {
  const mailto = `mailto:${email}`;
  return openAppOrBrowser(mailto);
}

export async function openTelegram(username = "revelcy") {
  const appUrl = `tg://resolve?domain=${username}`;
  const webUrl = `https://t.me/${username}`;
  return openAppOrBrowser(webUrl, appUrl);
}

export async function openX(screenName = "revelcycom") {
  const appUrl = `twitter://user?screen_name=${screenName}`;
  const webUrl = `https://x.com/${screenName}`;
  return openAppOrBrowser(webUrl, appUrl);
}
