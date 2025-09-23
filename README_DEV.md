# Project Developer Setup Guide (Expo SDK 52)

This document summarizes the key configuration and best practices for working with this React Native + Expo (SDK 52) project, tailored for Web and Native support.

---

## 🔧 Tooling & Environment
- **Expo SDK**: 52.x
- **React Native**: 0.76
- **TypeScript**: 5.x
- **UI**: `react-native-paper` (Material Design)
- **Routing**: `expo-router`revelcy_icon (manual setup)
- **Solana Integration (Web only)**: `@solana/wallet-adapter-phantom`, `@solana/wallet-adapter-react`
- **SVG Support**: `react-native-svg` + `react-native-svg-transformer`

---

## 📦 Aliases
Defined in both `babel.config.js` and `tsconfig.json` for full IDE and bundler support.

```json
@assets     => ./assets
@components => ./src/components
@hooks      => ./src/hooks
@providers   => ./src/providers
@screens    => ./src/screens
@services   => ./src/services
@storage    => ./storage
@theme      => ./theme
```

---

## 📁 File Resolution Strategy
### Platform-specific files
Use `.web.ts(x)` and `.native.ts(x)` for cross-platform logic separation.

Example:
```ts
// automatically resolved
import { useWallet } from '@storage/wallet-adapter';
```
Metro will choose:
- Web: `useWallet.web.ts`
- Native: `useWallet.native.ts`

---

## 🛠 VS Code Settings
File: `.vscode/settings.json`
```json
{
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "javascript.preferences.importModuleSpecifier": "non-relative",
  "path-intellisense.mappings": {
    "@assets": "${workspaceRoot}/assets",
    "@components": "${workspaceRoot}/src/components",
    "@hooks": "${workspaceRoot}/src/hooks",
    "@screens": "${workspaceRoot}/screens",
    "@services": "${workspaceRoot}/services",
    "@storage": "${workspaceRoot}/storage",
    "@theme": "${workspaceRoot}/theme"
  },
  "path-intellisense.extensionOnImport": true,
  "path-intellisense.autoSlashAfterDirectory": true
}
```

---

## 📘 `tsconfig.json`
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@assets/*": ["assets/*"],
      "@components/*": ["src/components/*"],
      "@hooks/*": ["src/hooks/*"],
      "@screens/*": ["screens/*"],
      "@services/*": ["services/*"],
      "@storage/*": ["storage/*"],
      "@theme/*": ["theme/*"]
    },
    "moduleSuffixes": [".native", ".web", ""]
  }
}
```

---

## 🚇 `metro.config.js`
```js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.unstable_disablePackageExports = true;
module.exports = config;
```
> You previously used `extraNodeModules` for `@ledgerhq` mocks — they are no longer needed.

---

## 📦 `babel.config.js`
```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          alias: {
            '@assets': './assets',
            '@components': './components',
            '@hooks': './hooks',
            '@screens': './screens',
            '@services': './services',
            '@storage': './storage',
            '@theme': './theme'
          }
        }
      ]
    ]
  };
};
```

---

## 🧼 Cleanups applied
- Removed `@solana/wallet-adapter-wallets` to avoid `@ledgerhq` conflicts
- Removed unused `webpack.config.js` and `shimEmpty.js`
- Removed `/// <reference types="nativewind/types" />` from `global.d.ts`

---

## 🧪 Recommendation for teammates
- Use VS Code with TypeScript support and [Path Intellisense](https://marketplace.visualstudio.com/items?itemName=christian-kohler.path-intellisense)
- Always use platform-specific files for platform-bound logic
- Use non-relative imports via aliases for consistency and maintainability




## 🧩 Adding Custom SVG Icons

This project uses custom SVG icons loaded via [`react-native-svg-transformer`](https://github.com/kristerkari/react-native-svg-transformer) and rendered through a reusable `<SvgIcon />` component.

---

### 📂 Folder Structure

All icons are stored in:

```
assets/basic_icon/
```

Use **kebab-case** for filenames:
- ✅ `star.svg`
- ✅ `heart-outlined.svg`
- ❌ `HeartOutlined.svg`

---

### ➕ How to Add a New Icon

1. **Place your SVG file** into `assets/basic_icon/`.

2. **Open** `SvgIcon.tsx`.

3. **Import the new icon**:
   ```ts
   import MyIcon from '@assets/basic_icon/my-icon.svg';
   ```

4. **Register the icon in the `icons` map**:
   ```ts
   const icons = {
     ...
     'my-icon': MyIcon,
   };
   ```

5. **Use the icon** in your UI code:
   ```tsx
   <SvgIcon name="my-icon" size={24} color={theme.colors.onSurface} />
   ```

---

### 🛠 Available Props

| Prop         | Type      | Description                          |
|--------------|-----------|--------------------------------------|
| `name`       | string    | Icon name (as defined in `icons`)    |
| `size`       | number    | Width and height (default: `24`)     |
| `color`      | string    | Sets the `fill` color                |
| `style`      | object    | Custom style object (optional)       |
| `elementRef` | `Ref`     | Ref access to the native SVG element |

---

> 💡 All icons must be valid SVGs compatible with `react-native-svg`. You can use [SVGOMG](https://jakearchibald.github.io/svgomg/) to optimize them before adding.
