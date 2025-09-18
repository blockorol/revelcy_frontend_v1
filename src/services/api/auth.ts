import axios from 'axios';
import base64js from 'base64-js';
import { API_HOST } from 'env';

export const API_AUTH_URL = `${API_HOST}/auth`;
export const API_USER_URL = `${API_HOST}/user`;


export async function updateUsername({
  username,
  jwt
}: {
  username: string;
  jwt: string;
}) {
  const res = await axios.post(`${API_USER_URL}/update_username`, {
    username: username,
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    }} 
);
  return res.data as { jwt: string };
}

export async function updateAvatar({
  file,
  jwt
}: {
  file: File,
  jwt: string;
}) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${API_USER_URL}/update_avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${jwt}`
    }} 
);
  return res.data as { jwt: string };
}



export async function startSession() {
  const res = await axios.get(`${API_AUTH_URL}/start_session`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return res.data as { nonce: string; jwt: string };
}

export async function confirmLogin({
  walletAddress,
  signature,
  jwt
}: {
  walletAddress: string;
  signature: Uint8Array;
  jwt: string;
}) {
  const res = await axios.post(`${API_AUTH_URL}/confirm_login`, {
    wallet_address: walletAddress,
    signature: base64js.fromByteArray(signature),
    jwt: jwt
  });
  return {
    jwt: res.data.jwt,
    isNewUser: res.data.is_new_user
  };
}
