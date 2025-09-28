import { API_HOST } from "env";

const PUMP_FUN_IPFS = `${API_HOST}/api/pump_ipfs`;

export async function uploadTokenMetadataToIPFS({avatar, tokenInfo}:
  {
    avatar: string;
    tokenInfo: {
      name: string;
      symbol: string;
      description?:string; 
      links: {
        telegram?:string; 
        twitter?:string; 
        website?:string; 
      }
    }
  }) {
  try {
    const byteCharacters = atob(avatar.split(',')[1]);
    const mimeType = avatar.split(',')[0].split(':')[1].split(';')[0];
    const byteNumbers = new Array(byteCharacters.length)
      .fill(0)
      .map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    const formData = new FormData();
    formData.append('file', blob, tokenInfo.name);

    formData.append('name', tokenInfo.name);
    formData.append('symbol', tokenInfo.symbol);
    formData.append('description', tokenInfo.description??"");
    if (tokenInfo.links.telegram) formData.append('telegram', tokenInfo.links.telegram);
    if (tokenInfo.links.twitter) formData.append('twitter', tokenInfo.links.twitter);
    if (tokenInfo.links.website) formData.append('website', tokenInfo.links.website);
    formData.append('showName', `true`);

    const response = await fetch(PUMP_FUN_IPFS, {
      method: 'POST',
      body: formData,
    });
    console.log("resp:",response)

    const result = await response.json();
    console.log("result:",result)
    return result?.metadataUri ? {
        metadataUri: result.metadataUri,
        avatarUri: "null",
    }: null
  } catch (error) {
    console.error('Failed during upload image to Pump.fun IPFS:', error);
    return null;
  }
}
