# Revelcy Frontend

This is the frontend for **Revelcy**, a cross-platform (Web, Android, iOS) client built using **React Native** and **Expo SDK 52**, with integration to Solana blockchain and decentralized storage via IPFS.

---

## 🚀 How to Run the Project

### ✅ Prerequisites
- Node.js >= 18.x
- Expo CLI (`npm install -g expo-cli`)
- Android Studio or Xcode (for native emulators)
- A real device or web browser

### 1. Install dependencies  
```bash
npm install
```

### 2. Prepare `.env`
Create a `.env` file in the project root with the following variables:

```env
HOST_BACKEND=<Your Backend Base URL> # Example: https://api.revelcy.com
PINATA_API_KEY=<Your Pinata API Key>
PINATA_SECRET_KEY=<Your Pinata Secret Key>
PINATA_JWT=<Your Pinata JWT Token>
HELIUS_KEY=<Your Helius api key>
NETWORK=<devnet | main-beta>
```

> **Note:**  
> `PINATA_*` variables are used for uploading files to IPFS via the Pinata service.  
> `HOST_BACKEND` should point to your deployed backend server or local development API.

---

### 3. Run the App

#### 🖥️ Web
```bash
expo start --web
```

#### 📱 Android
```bash
npm run android
```

#### 🍏 iOS
```bash
npm run ios
```

Or use:
```bash
npx expo start
```
Then follow the terminal instructions to run on the desired platform.

---

## ⚙️ Technologies Used

- **React Native** (0.76)
- **Expo SDK 52**
- **TypeScript** (5.x)
- **React Native Paper** (Material Design 3)
- **Expo Router** (for navigation)
- **@solana/web3.js** (Solana integration, web only)
- **@solana/wallet-adapter-phantom**
- **react-native-svg** + **react-native-svg-transformer** (for SVG icons)

---

## 📦 Project Structure Aliases

| Alias        | Path                |
|--------------|---------------------|
| `@assets`    | `./assets`          |
| `@components`| `./src/components`  |
| `@hooks`     | `./src/hooks`       |
| `@screens`   | `./src/screens`     |
| `@services`  | `./src/services`    |
| `@storage`   | `./src/storage`     |
| `@theme`     | `./src/theme`       |

---

## 🧑‍💻 Related Repositories

- **Smart Contracts**: [blockorol/solana-program](https://github.com/blockorol/solana-program)
- **Backend API**: [blockorol/revelcy-backend](https://github.com/blockorol/revelcy-backend-v1)
