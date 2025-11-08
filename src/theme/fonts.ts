// theme/fonts.ts
import type { MD3Theme } from "react-native-paper";
type MD3Typescale = MD3Theme["fonts"];

// имена семейств из @expo-google-fonts/inter (как ты уже грузишь)
const INTER_100 = "Inter_100Thin";
const INTER_200 = "Inter_200ExtraLight";
const INTER_300 = "Inter_300Light";
const INTER_400 = "Inter_400Regular";
const INTER_500 = "Inter_500Medium";
const INTER_600 = "Inter_600SemiBold";
const INTER_700 = "Inter_700Bold";
const INTER_800 = "Inter_800ExtraBold";
const INTER_900 = "Inter_900Black";

type W = 100|200|300|400|500|600|700|800|900;

const familyByWeight: Record<W, string> = {
  100: INTER_700, 200: INTER_700, 300: INTER_700,
  400: INTER_700, 500: INTER_700, 600: INTER_700,
  700: INTER_700, 800: INTER_700, 900: INTER_700,
};

// ---------- ТВОЙ БАЗОВЫЙ КОНФИГ (как мы выровняли ранее) ----------
export const fontConfig: MD3Typescale = {
  default:      { fontFamily: INTER_400, fontWeight: "400", letterSpacing: 0.25 },

  // Display (700)
  displayLarge:  { fontFamily: INTER_700, fontWeight: "700", fontSize: 57, lineHeight: 64, letterSpacing: -0.25 },
  displayMedium: { fontFamily: INTER_700, fontWeight: "700", fontSize: 45, lineHeight: 52, letterSpacing: 0 },
  displaySmall:  { fontFamily: INTER_700, fontWeight: "700", fontSize: 36, lineHeight: 44, letterSpacing: 0 },

  // Headline (700)
  headlineLarge:  { fontFamily: INTER_700, fontWeight: "700", fontSize: 32, lineHeight: 40, letterSpacing: 0 },
  headlineMedium: { fontFamily: INTER_700, fontWeight: "700", fontSize: 28, lineHeight: 36, letterSpacing: 0 },
  headlineSmall:  { fontFamily: INTER_700, fontWeight: "700", fontSize: 24, lineHeight: 32, letterSpacing: 0 },

  // Title (700)
  titleLarge:  { fontFamily: INTER_700, fontWeight: "700", fontSize: 20, lineHeight: 28, letterSpacing: 0 },
  titleMedium: { fontFamily: INTER_700, fontWeight: "700", fontSize: 16, lineHeight: 24, letterSpacing: 0.15 },
  titleSmall:  { fontFamily: INTER_700, fontWeight: "700", fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },

  // Label (500)
  labelLarge:  { fontFamily: INTER_500, fontWeight: "500", fontSize: 16, lineHeight: 20, letterSpacing: 0.3 },
  labelMedium: { fontFamily: INTER_500, fontWeight: "500", fontSize: 12, lineHeight: 16, letterSpacing: 0.3 },
  labelSmall:  { fontFamily: INTER_500, fontWeight: "500", fontSize: 11, lineHeight: 16, letterSpacing: 0 },

  // Body (400)
  bodyLarge:  { fontFamily: INTER_400, fontWeight: "400", fontSize: 16, lineHeight: 24, letterSpacing: 0.5 },
  bodyMedium: { fontFamily: INTER_400, fontWeight: "400", fontSize: 14, lineHeight: 21, letterSpacing: 0.25 }, // 150% от 14
  bodySmall:  { fontFamily: INTER_400, fontWeight: "400", fontSize: 12, lineHeight: 16, letterSpacing: 0.4 },
};

// ---------- АВТО-ГЕНЕРАЦИЯ PROMINENT (+2 шага веса, clamp до 900) ----------
function toNumWeight(w?: string | number): W {
  const n = typeof w === "number" ? w : parseInt(String(w ?? 400), 10);
  const snap = (Math.round(n / 100) * 100) as W; // 410→400 и т.п.
  return (Math.min(900, Math.max(100, snap)) as W);
}

function bump2(w: W): W {
  const order: W[] = [100,200,300,400,500,600,700,800,900];
  const i = Math.max(0, order.indexOf(w));
  return order[Math.min(order.length - 1, i + 2)];
}

export const fontProminentConfig: MD3Typescale = Object.fromEntries(
  (Object.entries(fontConfig) as [keyof MD3Typescale, any][])
    .map(([k, v]) => {
      const baseW = toNumWeight(v?.fontWeight ?? 400);
      const newW  = bump2(baseW);
      return [k, {
        ...v,
        fontFamily: familyByWeight[newW],
        fontWeight: String(newW),
      }];
    })
) as MD3Typescale;
