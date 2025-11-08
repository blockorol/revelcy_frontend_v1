import { Platform, Linking } from "react-native";
import * as Clipboard from "expo-clipboard";

type EmailParams = {
  to?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject?: string;
  body?: string;
};

type OpenEmailResult = "copied" | "opened" | "failed";

const toList = (v?: string | string[]) =>
  Array.isArray(v) ? v.join(",") : (v ?? "");

export function buildMailto({ to, cc, bcc, subject, body }: EmailParams): string {
  const base = `mailto:${toList(to)}`;
  const q = new URLSearchParams();
  if (cc) q.set("cc", toList(cc));
  if (bcc) q.set("bcc", toList(bcc));
  if (subject) q.set("subject", subject);
  if (body) q.set("body", body);
  const qs = q.toString();
  return qs ? `${base}?${qs}` : base;
}

async function tryCopy(text: string): Promise<boolean> {
  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch {
    // Web fallback
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      if (typeof document !== "undefined") {
        const tmp = document.createElement("textarea");
        tmp.value = text;
        tmp.setAttribute("readonly", "true");
        tmp.style.position = "fixed";
        tmp.style.opacity = "0";
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand("copy");
        document.body.removeChild(tmp);
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }
}

/**
 * Открывает mailto и ВСЕГДА пытается скопировать адрес.
 * Возвращает:
 *  - "copied", если копирование удалось (даже если mailto сработал)
 *  - "opened", если mailto открылся, но скопировать не получилось
 *  - "failed", если ни mailto не открылся, ни скопировать не вышло
 */
export async function openEmail(
  params: EmailParams = { to: "hello@revelcy.com" }
): Promise<OpenEmailResult> {
  const url = buildMailto(params);
  const email = toList(params.to) || "hello@revelcy.com";

  // 1) Сначала пробуем КОПИРОВАНИЕ
  const copied = await tryCopy(email);

  // 2) Потом пытаемся открыть mailto
  let opened = false;
  try {
    if (Platform.OS === "web") {
      // Важно: копирование уже сделано — теперь редиректим
      window.location.href = url;
      opened = true;
    } else {
      const can = await Linking.canOpenURL(url);
      if (can) {
        await Linking.openURL(url);
        opened = true;
      }
    }
  } catch {
    opened = false;
  }

  if (copied) return "copied";
  return opened ? "opened" : "failed";
}
