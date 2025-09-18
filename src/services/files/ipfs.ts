const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';
const PINATA_FILE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
const PINATA_JSON_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
import Constants from 'expo-constants';

const PINATA_JWT = Constants.expoConfig?.extra?.PINATA_JWT || '';

export async function uploadBase64Image(base64Data: string, fileName: string): Promise<string | null> {
  try {

    const byteCharacters = atob(base64Data.split(',')[1]);
    const mimeType = base64Data.split(',')[0].split(':')[1].split(';')[0];
    const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    const formData = new FormData();
    formData.append('file', blob, fileName);
    console.log("PINATA_JWT", PINATA_JWT)

    const response = await fetch(PINATA_FILE_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${PINATA_JWT}` },
      body: formData,
    });

    const result = await response.json();
    return result?.IpfsHash ? `${PINATA_GATEWAY}${result.IpfsHash}` : null;
  } catch (error) {
    console.error('Failed during upload image to IPFS:', error);
    return null;
  }
}

export async function uploadJsonMetadata(metadata: Record<string, any>): Promise<string | null> {
  try {

    const response = await fetch(PINATA_JSON_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    const result = await response.json();
    return result?.IpfsHash ? `${PINATA_GATEWAY}${result.IpfsHash}` : null;
  } catch (error) {
    console.error('Failed during upload JSON to IPFS:', error);
    return null;
  }
}
