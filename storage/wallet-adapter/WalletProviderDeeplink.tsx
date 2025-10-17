import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { MobileIntent, PendingAction, WalletContextValue, WalletReactContext, WalletState } from './WalletContext';
import { useNetwork } from '@providers/NetworkContext';
import { PublicKey } from '@solana/web3.js';

const MOBILE_UL_BASE = 'https://phantom.app/ul/v1';
const MOBILE_FLOW_TIMEOUT_MS = 60000; // 60s

function isPhantomExtensionAvailable() {
  return typeof window !== 'undefined' && !!(window as any).solana?.isPhantom;
}

function createEphemeralKeypair() {
  const kp = nacl.box.keyPair();
  return { dappSecretKey: kp.secretKey, dappPublicKey: kp.publicKey } as {
    dappSecretKey: Uint8Array;
    dappPublicKey: Uint8Array;
    sharedSecret?: Uint8Array;
  };
}
function deriveSharedSecret(dappSecretKey: Uint8Array, phantomPubkeyB58: string) {
  const phantomPubkey = bs58.decode(phantomPubkeyB58);
  return nacl.scalarMult(dappSecretKey.subarray(0, 32), phantomPubkey);
}
function b64ToU8(b64: string) {
  const bin = atob(b64); const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return u8;
}
function u8ToB64(u8: Uint8Array) {
  let bin = ''; for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
  return btoa(bin);
}
function decryptPayload(sharedSecret: Uint8Array, nonceB64: string, dataB64: string) {
  const opened = nacl.box.open.after(b64ToU8(dataB64), b64ToU8(nonceB64), sharedSecret);
  if (!opened) throw new Error('Failed to decrypt Phantom response');
  return JSON.parse(new TextDecoder().decode(opened));
}
function encryptPayload(sharedSecret: Uint8Array, payload: any) {
  const nonce = nacl.randomBytes(24);
  const msg = new TextEncoder().encode(JSON.stringify(payload));
  const boxed = nacl.box.after(msg, nonce, sharedSecret);
  return { nonce: u8ToB64(nonce), data: u8ToB64(boxed) };
}
function makeRedirectUrl(intent: MobileIntent, id: string) {
  const url = new URL(window.location.href);
  url.searchParams.set('phantom_callback', '1');
  url.searchParams.set('intent', intent);
  url.searchParams.set('req_id', id);
  return url.toString();
}
function toBase58(u8: Uint8Array) { return bs58.encode(u8); }
function getFromHash(url: URL, key: string) {
  const m = (url.hash || '').match(new RegExp(`${key}=([^&]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export const WalletProviderDeeplink: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { network } = useNetwork();
  const [state, setState] = useState<WalletState>(() => ({
    connected: false,
    isExtensionAvailable: isPhantomExtensionAvailable(),
    isMobileFallbackActive: true,
    pending: null,
  }));

  const sessionRef = useRef<{
    dappSecretKey: Uint8Array;
    dappPublicKey: Uint8Array;
    sharedSecret?: Uint8Array;
  } | null>(null);

  const ensureSession = useCallback(() => {
    if (!sessionRef.current) sessionRef.current = createEphemeralKeypair();
    return sessionRef.current!;
  }, []);

  const savePending = useCallback((p: PendingAction) => {
    setState(prev => ({ ...prev, pending: p, isMobileFallbackActive: true }));
    localStorage.setItem('wallet_pending', JSON.stringify(p));
  }, []);
  const clearPending = useCallback(() => {
    setState(prev => ({ ...prev, pending: null }));
    localStorage.removeItem('wallet_pending');
  }, []);

  const startMobileConnect = useCallback(async () => {
    const sess = ensureSession();
    const reqId = crypto.randomUUID();
    const params = new URLSearchParams({
      dapp_encryption_public_key: toBase58(sess.dappPublicKey),
      cluster: network,
      app_url: window.location.origin,
      redirect_link: makeRedirectUrl('connect', reqId),
    });
    savePending({ id: reqId, type: 'connect' });

    window.location.href = `${MOBILE_UL_BASE}/connect?${params.toString()}`;

    return new Promise<void>((resolve, reject) => {
      const tm = setTimeout(() => reject(new Error('Connect timeout')), MOBILE_FLOW_TIMEOUT_MS);
      const handler = () => {
        clearTimeout(tm);
        window.removeEventListener('wallet:connected', handler as any);
        resolve();
      };
      window.addEventListener('wallet:connected', handler as any, { once: true });
    });
  }, [ensureSession, network, savePending]);

  const startMobileSignMessage = useCallback(async (message: Uint8Array) => {
    const sess = ensureSession();
    const reqId = crypto.randomUUID();
    if (!sess.sharedSecret || !state.publicKeyBase58) {
      throw new Error('Wallet not connected (mobile). Call connect() first.');
    }
    const enc = encryptPayload(sess.sharedSecret, { message: Array.from(message) });
    const params = new URLSearchParams({
      dapp_encryption_public_key: toBase58(sess.dappPublicKey),
      app_url: window.location.origin,
      redirect_link: makeRedirectUrl('signMessage', reqId),
      nonce: enc.nonce,
      data: enc.data,
    });
    savePending({ id: reqId, type: 'signMessage', message });

    window.location.href = `${MOBILE_UL_BASE}/signMessage?${params.toString()}`;
    

    return new Promise<Uint8Array>((resolve, reject) => {
      const tm = setTimeout(() => reject(new Error('signMessage timeout')), MOBILE_FLOW_TIMEOUT_MS);
      const handler = (ev: any) => {
        if (!ev?.detail) return;
        clearTimeout(tm);
        window.removeEventListener('wallet:signed', handler as any);
        resolve(ev.detail as Uint8Array);
      };
      window.addEventListener('wallet:signed', handler as any);
    });
  }, [ensureSession, savePending, state.publicKeyBase58]);

  const connect = useCallback(async () => startMobileConnect(), [startMobileConnect]);
  const signMessage = useCallback(async (m: Uint8Array) => startMobileSignMessage(m), [startMobileSignMessage]);
  const resetLastSignature = useCallback(() => setState(prev => ({ ...prev, lastSignature: undefined })), []);
  const disconnect = useCallback(() => {
    sessionRef.current = null;
    setState(prev => ({
      ...prev,
      connected: false,
      publicKeyBase58: undefined,
      lastSignature: undefined,
      isMobileFallbackActive: true,
    }));
    localStorage.removeItem('wallet_pending');
  }, []);

  // обработчик редиректа
useEffect(() => {
  const processReturn = () => {
    const href = window.location.href;
    const url = new URL(href);

    // 1) наши (необязательные) маркеры
    const phantomCallback = url.searchParams.get('phantom_callback');
    const intentQP = url.searchParams.get('intent') as MobileIntent | null;
    const reqIdQP = url.searchParams.get('req_id');

    // 2) реальные ключевые параметры от Phantom (могут быть в query или в hash)
    const getFromHash = (key: string) => {
      const m = (url.hash || '').match(new RegExp(`${key}=([^&]+)`));
      return m ? decodeURIComponent(m[1]) : null;
    };
    const phantomPubB58 =
      url.searchParams.get('phantom_encryption_public_key') || getFromHash('phantom_encryption_public_key');
    const data = url.searchParams.get('data') || getFromHash('data');
    const nonce = url.searchParams.get('nonce') || getFromHash('nonce');
    const errorCode = url.searchParams.get('errorCode') || getFromHash('errorCode');

    // Если нет основных полей — выходим тихо
    if (!phantomPubB58 || !data || !nonce) return;

    // Считаем pending из localStorage и определяем intent из него, если наш маркер отсутствует
    const pendingStr = localStorage.getItem('wallet_pending');
    if (!pendingStr) return;
    const pending: PendingAction = JSON.parse(pendingStr);

    // Если Phantom вернул ошибку — очищаем и выходим
    if (errorCode) {
      clearPending();
      console.error('Phantom returned errorCode:', errorCode);
      return;
    }

    const sess = ensureSession();

    // Если это connect (по нашему pending.type)
    if (pending.type === 'connect') {
      const sharedSecret = deriveSharedSecret(sess.dappSecretKey, phantomPubB58);
      sess.sharedSecret = sharedSecret;

      try {
        const parsed = decryptPayload(sharedSecret, nonce, data);
        const walletPubBase58: string = parsed?.public_key;
        if (!walletPubBase58) throw new Error('Connect response missing public_key');

        sessionRef.current = sess;
        setState(prev => ({
          ...prev,
          connected: true,
          publicKeyBase58: walletPubBase58,
          publicKey: new PublicKey(walletPubBase58),
          isMobileFallbackActive: true,
        }));
        clearPending();

        // Сообщаем ожидающему промису
        window.dispatchEvent(new CustomEvent('wallet:connected'));
      } catch (e) {
        clearPending();
        console.error('Failed to handle connect response:', e);
      }
      return;
    }

    // Если это signMessage
    if (pending.type === 'signMessage') {
      if (!sess.sharedSecret) {
        clearPending();
        console.error('No shared secret for signMessage');
        return;
      }
      try {
        const parsed = decryptPayload(sess.sharedSecret, nonce, data);
        const sigB58: string = parsed?.signature;
        if (!sigB58) throw new Error('signMessage response missing signature');
        const signature = bs58.decode(sigB58);

        setState(prev => ({ ...prev, lastSignature: signature }));
        clearPending();

        // Сообщаем ожидающему промису
        window.dispatchEvent(new CustomEvent('wallet:signed', { detail: signature }));
      } catch (e) {
        clearPending();
        console.error('Failed to handle signMessage response:', e);
      }
      return;
    }
  };

  // Обработка при монтировании (после возвращения со страницы Phantom произойдёт reload/SPA-навиг.)
  processReturn();

  // На случай, если роутер SPA меняет адрес без перезагрузки
  const onPop = () => processReturn();
  window.addEventListener('popstate', onPop);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') processReturn();
  });

  return () => {
    window.removeEventListener('popstate', onPop);
  };
}, [clearPending, ensureSession, setState]);


  const value: WalletContextValue = useMemo(() => ({
    ...state,
    connect,
    signMessage,
    disconnect,
    resetLastSignature,
    wallet: { name: 'Phantom' },
    select: async (_name: string) => { /* no-op */ },
  }), [state, connect, signMessage, disconnect, resetLastSignature]);

  return (
    <WalletReactContext.Provider value={value}>
      {children}
    </WalletReactContext.Provider>
  );
};
