import { API_HOST, IS_SITE_SNAPSHOT } from 'env';
import axios from 'axios';
import { mockServerError } from '@api/mock';

const API_URL_FILES = `${API_HOST}/files`;

export async function uploadImage(file: File, name: string): Promise<string> {
  if (IS_SITE_SNAPSHOT) mockServerError();

  const formData = new FormData();
  formData.append('file', file);

  await axios.post(`${API_URL_FILES}/upload/${encodeURIComponent(name)}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return `${API_URL_FILES}/image/${name}.png`
}

export function getImageUrl(name: string): string {
  return `${API_URL_FILES}/image/${encodeURIComponent(name)}`;
}
