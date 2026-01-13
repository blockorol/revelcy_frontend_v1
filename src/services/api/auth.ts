// api/auth.ts
import axios from 'axios';
import base64js from 'base64-js';
import { API_HOST } from 'env';

export const API_AUTH_URL = `${API_HOST}/auth`;
export const API_USER_URL = `${API_HOST}/user`;

import { extractApiError } from "@api/apiError";

export type SetInviteCodeError =
  | { kind: "invite_code_not_found"; message?: string }
  | { kind: "invite_code_already_applied"; message?: string }
  | { kind: "validation_error"; message?: string; field?: string }
  | { kind: "unauthorized"; message?: string }
  | { kind: "network_error"; message?: string }
  | { kind: "unknown_error"; message?: string };

export type SetInviteCodeResult =
  | { ok: true; jwt: string }
  | { ok: false; error: SetInviteCodeError };

export async function setInviteCode({
  inviteCode,
  jwt
}: {
  inviteCode: string;
  jwt: string;
}): Promise<SetInviteCodeResult> {
  try {
    const data = await axios.post(`${API_USER_URL}/set_invite_code`, {
      invite_code: inviteCode,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      }} 
    ) as {ok: boolean, jwt: string};


    return { ok: true, jwt: data.jwt };
  } catch (err) {
    const apiErr = extractApiError(err);
    if (apiErr) {
      switch (apiErr.code) {
        case "invite_code_not_found":
          console.log("invite_code_not_found")
          return { ok: false, error: { kind: "invite_code_not_found", message: apiErr.message ?? undefined } };

        case "invite_code_already_applied":
          return { ok: false, error: { kind: "invite_code_already_applied", message: apiErr.message ?? undefined } };

        case "validation_error":
          return {
            ok: false,
            error: {
              kind: "validation_error",
              message: apiErr.message ?? apiErr.errors?.[0]?.message ?? undefined,
              field: apiErr.field ?? apiErr.errors?.[0]?.field ?? undefined,
            },
          };

        default:
          return { ok: false, error: { kind: "unknown_error", message: apiErr.message ?? undefined } };
      }
    }

    const e = err as any;
    if (typeof e?.status === "number" && e.status === 401) {
      return { ok: false, error: { kind: "unauthorized" } };
    }

    if (e?.name === "AbortError") {
      return { ok: false, error: { kind: "network_error", message: "request aborted" } };
    }

    return { ok: false, error: { kind: "network_error", message: e?.message } };
  }
}

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
  if (res.status === 401) {
    return null;
  }
  return {
    jwt: res.data.jwt,
    isNewUser: res.data.is_new_user
  };
}
