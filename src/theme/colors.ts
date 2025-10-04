// theme/colors.ts
import type { ExtendedMD3Colors } from "@theme/types";

const COROL_UNSETTED = "#5e2204"


const sharedOverrides = {
  pink: "#FF0095",
  yellow: "#FF9500",
  primary: "#00ff77",
  onPrimary: "#003915",
  secondary: "#00c3ff",
  onSecondary: "#003548",
  error: "#df3a3a",
  onError: "#571e1b",
};

export const darkColors: ExtendedMD3Colors = {
  ...sharedOverrides,
  outline: colorHexAndOpacity("#938f95", 0.4),
  surface: colorHexAndOpacity("#000000", 1),
  onSurface: colorHexAndOpacity("#ffffff", 1),
  background: colorHexAndOpacity("#000000", 1),

  onBackground: colorHexAndOpacity("#ffffff", 1),
  surfaceVariant: colorHexAndOpacity("#48464b", 1),
  onSurfaceVariant: colorHexAndOpacity("#c9c5cb", 1),
  inverseSurface: colorHexAndOpacity("#e5e2e1", 1),
  inverseOnSurface: colorHexAndOpacity("#313030", 1),
  shadow: colorHexAndOpacity("#0E0E0E", 0.9),
  outlineVariant: colorHexAndOpacity("#48464b", 0.4),
  scrim: colorHexAndOpacity(COROL_UNSETTED, 1),
  
  backdrop: colorHexAndOpacity("#0E0E0E", 0.9), // todo: check with designer

  elevation: {
    level0: "transparent",
    level1: "rgb(37, 35, 42)",
    level2: "rgb(44, 40, 49)",
    level3: "rgb(49, 44, 56)",
    level4: "rgb(51, 46, 58)",
    level5: "rgb(52, 49, 63)",
  },

  // 3)  (extentions:)
  surfaceDim: colorHexAndOpacity(COROL_UNSETTED, 1),
  surfaceBright: colorHexAndOpacity(COROL_UNSETTED, 1),
  surfaceContainerLowest: colorHexAndOpacity("#0E0E0E", 1),
  surfaceContainerLow: colorHexAndOpacity("#1C1B1C", 1),
  surfaceContainer: colorHexAndOpacity("#201F20", 1),
  surfaceContainerHigh: colorHexAndOpacity("#2B2A2A", 1),
  surfaceContainerHighest: colorHexAndOpacity("#353435", 1),
  
  surfaceDisabled: colorHexAndOpacity('#E6E0E9', 0.12),
  onSurfaceDisabled: colorHexAndOpacity('#FFFFFF', 1), 
  
  onPrimaryFixedVariant: colorHexAndOpacity(COROL_UNSETTED, 1),
  onSecondaryFixedVariant: colorHexAndOpacity(COROL_UNSETTED, 0.5),
  onTertiaryFixedVariant: colorHexAndOpacity(COROL_UNSETTED, 0.5),

  primaryFixed: colorHexAndOpacity(COROL_UNSETTED, 1),
  onPrimaryFixed: colorHexAndOpacity(COROL_UNSETTED, 0.5),
  primaryFixedDim: colorHexAndOpacity(COROL_UNSETTED, 1),

  secondaryFixed: colorHexAndOpacity(COROL_UNSETTED, 1),
  onSecondaryFixed: colorHexAndOpacity(COROL_UNSETTED, 0.5),
  secondaryFixedDim: colorHexAndOpacity(COROL_UNSETTED, 1),

  tertiaryFixed: colorHexAndOpacity(COROL_UNSETTED, 1),
  onTertiaryFixed: colorHexAndOpacity(COROL_UNSETTED, 0.5),
  tertiaryFixedDim: colorHexAndOpacity(COROL_UNSETTED, 1),
  primaryContainer: colorHexAndOpacity(COROL_UNSETTED, 1),
  secondaryContainer: colorHexAndOpacity(COROL_UNSETTED, 1),
  tertiary: colorHexAndOpacity(COROL_UNSETTED, 1),
  tertiaryContainer: colorHexAndOpacity(COROL_UNSETTED, 1),
  errorContainer: colorHexAndOpacity(COROL_UNSETTED, 1),
  onPrimaryContainer: colorHexAndOpacity(COROL_UNSETTED, 0.5),
  onSecondaryContainer: colorHexAndOpacity(COROL_UNSETTED, 0.5),
  onTertiary: colorHexAndOpacity(COROL_UNSETTED, 0.5),
  onTertiaryContainer: colorHexAndOpacity(COROL_UNSETTED, 0.5),
  onErrorContainer: colorHexAndOpacity(COROL_UNSETTED, 0.5),
  inversePrimary: colorHexAndOpacity(COROL_UNSETTED, 1),
};

function colorHexAndOpacity(hex: string, opacity: number): string {
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, "0");
  return `${hex}${alpha}`;
}
