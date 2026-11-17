export default {
  expo: {
    extra: {
      REVELCY_WEB_MODE: process.env.REVELCY_WEB_MODE,
      ...(process.env.REVELCY_WEB_MODE === "live" && {
        PINATA_JWT: process.env.PINATA_JWT,
        PINATA_API_KEY: process.env.PINATA_API_KEY,
        PINATA_SECRET_KEY: process.env.PINATA_SECRET_KEY,
        HOST_BACKEND: process.env.HOST_BACKEND,
        HELIUS_KEY: process.env.HELIUS_KEY,
        TRITON_URL: process.env.TRITON_URL,
      }),
      NETWORK: process.env.NETWORK,
      IS_DISCOVERY_FILTER_ENABLED: process.env.IS_DISCOVERY_FILTER_ENABLED,
      IS_VESTING_ENABLE: process.env.IS_VESTING_ENABLE
    }
  }
};
