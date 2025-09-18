import { MD3DarkTheme } from 'react-native-paper';
import { fontConfig, fontProminentConfig } from '@theme/fonts'
import {darkColors } from '@theme/colors'
import { AppTheme } from '@theme/types';

export const darkTheme: AppTheme = {
  ...MD3DarkTheme,
  colors: darkColors,
  fonts: fontConfig,
  fontsProminent: fontProminentConfig,
};


