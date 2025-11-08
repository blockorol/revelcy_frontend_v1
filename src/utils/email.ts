import { Platform, Linking } from "react-native";
import * as Clipboard from "expo-clipboard"; // <— если Expo (иначе можно navigator.clipboard)

type EmailParams = {
  to?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject?: string;
  body?: string;
};

const toList = (v?: string | string[]) =>
  Array.isArray(v) ? v.join(",") : (v ?? "");

const enc = (s?: string) => (s ? encodeURIComponent(s) : "");

export function buildMailto({
  to,
  cc,
  bcc,
  subject,
  body,
}: EmailParams): string {
  const base = `mailto:${toList(to)}`;
  const q = new URLSearchParams();
  if (cc) q.set("cc", toList(cc));
  if (bcc) q.set("bcc", toList(bcc));
  if (subject) q.set("subject", subject);
  if (body) q.set("body", body);
  const qs = q.toString();
  return qs ? `${base}?${qs}` : base;
}

export async function openEmail(params: EmailParams = { to: "hello@revelcy.com" }) {
  const url = buildMailto(params);
  const email = toList(params.to) || "hello@revelcy.com";

  try {
    if (Platform.OS === "web") {
      window.location.href = url;
      return;
    }

    const can = await Linking.canOpenURL(url);
    if (!can) throw new Error("No mail app");
    await Linking.openURL(url);
  } catch {
    try {
      await Clipboard.setStringAsync(email);
        return "copied";
    } catch {
      // если Clipboard API недоступен
      if (Platform.OS === "web") {
        // fallback через execCommand
        const tmp = document.createElement("textarea");
        tmp.value = email;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand("copy");
        document.body.removeChild(tmp);
        return "copy";
      } else {
        return "failed";
      }
    }
  }
}
