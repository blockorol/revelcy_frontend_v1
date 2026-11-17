import { NETWORK } from "env";

export function getTokenShortLink(shortLinkPrefix: string | undefined): string | undefined {
  if (!shortLinkPrefix) return undefined;
  const subdomain = NETWORK === "mainnet-beta" ? "beta" : "dev";
  return `https://${subdomain}.revelcy.com/token/${shortLinkPrefix}`;
}

