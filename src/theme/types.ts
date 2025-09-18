
// theme/types.ts
import type { MD3Theme} from "react-native-paper";
import { MD3Typescale } from "react-native-paper/lib/typescript/types";


// Базовый тип цветов берём из темы
export type BaseMD3Colors = MD3Theme["colors"];

export interface ExtendedMD3Colors extends BaseMD3Colors {
  pink: string;
  yellow: string;
  surfaceDim: string;
  surfaceBright: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  primaryFixed: string;
  onPrimaryFixed: string;
  primaryFixedDim: string;
  secondaryFixed: string;
  onSecondaryFixed: string;
  secondaryFixedDim: string;
  tertiaryFixed: string;
  onTertiaryFixed: string;
  tertiaryFixedDim: string;
  onPrimaryFixedVariant: string;
  onSecondaryFixedVariant: string;
  onTertiaryFixedVariant: string;
}

export type AppTheme = Omit<MD3Theme, "colors" | "fonts"> & {
  colors: ExtendedMD3Colors;
  fonts: MD3Typescale;          // обычные MD3 шрифты
  fontsProminent: MD3Typescale; // наши "усиленные" варианты
};
