// api/uploadTokenMetadataToIPFS.ts
import { API_HOST } from "env";
import { withRetry } from '@services/api/retry';

const PUMP_FUN_IPFS = `${API_HOST}/proxy/pump_ipfs`;

type TokenInfo = {
  name: string;
  symbol: string;
  description?: string;
  links: { telegram?: string; twitter?: string; website?: string };
};

export async function uploadTokenMetadataToIPFS({
  premarketPDA,
  avatar,
  tokenInfo,
}: {
  premarketPDA?: string;
  avatar: string; // dataURL: "data:image/png;base64,...."
  tokenInfo: TokenInfo;
}) {
  const attemptOnce = async () => {
    const dataURL = await normalizeAvatarToDataURL(avatar);

    // === recreate payload between retry ===
    const [head, b64] = dataURL.split(",");
    if (!head || !b64) throw new Error("Invalid avatar data URL");
    const mimeType = head.split(":")[1]?.split(";")[0] || "image/png";

    const byteCharacters = atob(b64);
    const byteArray = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) byteArray[i] = byteCharacters.charCodeAt(i);
    const blob = new Blob([byteArray], { type: mimeType });

    // Append Revelcy info after the description
    const revelcyText = premarketPDA
      ? `Premarket done with Revelcy; initial buy distributed to the community. More: https://beta.revelcy.com/${premarketPDA}`
      : `Premarket concept created with Revelcy.`;
    const descriptionUpdated = tokenInfo.description 
      ? `${tokenInfo.description}\n\n${revelcyText}`
      : revelcyText;

    const formData = new FormData();
    formData.append("file", blob, tokenInfo.name);
    formData.append("name", tokenInfo.name);
    formData.append("symbol", tokenInfo.symbol);
    formData.append("description", descriptionUpdated);
    if (tokenInfo.links.telegram) formData.append("telegram", tokenInfo.links.telegram);
    if (tokenInfo.links.twitter) formData.append("twitter", tokenInfo.links.twitter);
    if (tokenInfo.links.website) formData.append("website", tokenInfo.links.website);
    formData.append("showName", "true");

    const res = await fetch(PUMP_FUN_IPFS, { method: "POST", body: formData });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const err = new Error(`Upload failed: ${res.status} ${res.statusText} ${text}`);
      // @ts-ignore
      err.response = res;
      throw err;
    }

    const result = await res.json().catch(() => ({} as any));
    return result?.metadataUri
      ? { metadataUri: result.metadataUri, avatarUri: result?.metadata?.image }
      : null;
  };

  try {
    return await withRetry(attemptOnce, {
      retries: 4,        // total 5 try (1 + 4 retry)
      timeoutMs: 20000,   // default timeout - 20 sec
      minDelayMs: 400,
      maxDelayMs: 5000,
      factor: 3,
      jitter: true,
    });
  } catch (error) {
    console.error("Failed during upload image to Pump.fun IPFS:", error);
    return null;
  }
}

async function normalizeAvatarToDataURL(avatar: string): Promise<string> {
  if (avatar.startsWith("data:")) {
    return avatar;
  }

  const res = await fetch(avatar);
  if (!res.ok) throw new Error("Failed to fetch avatar URL");

  const blob = await res.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
