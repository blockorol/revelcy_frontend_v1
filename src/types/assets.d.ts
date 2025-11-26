// src/types/assets.d.ts
declare module '*.svg' {
  import type { SvgProps } from 'react-native-svg';
  import * as React from 'react';
  const content: React.FC<SvgProps>;
  export default content;
}
