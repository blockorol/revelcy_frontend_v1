import * as FileSystem from 'expo-file-system';

export default async function uriToStringData(uri: string): Promise<string> {
  return await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
}
