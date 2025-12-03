import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import nacl from 'tweetnacl';
import { MobileIntent, PendingAction, WalletContextValue, WalletReactContext, WalletState } from './WalletContext.mobile';
import { useNetwork } from '@providers/NetworkContext';

const MOBILE_UL_BASE = 'https://phantom.app/ul/v1';
const MOBILE_FLOW_TIMEOUT_MS = 60000;

function isPhantomExtensionAvailable() {
    return typeof window !== 'undefined' && !!(window as any).solana?.isPhantom;
}

function isMobile() {
    return typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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
    return nacl.box.before(phantomPubkey, dappSecretKey);
}

function b64ToU8(b64: string) {
    const standardB64 = b64.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(standardB64);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return u8;
}

function u8ToB64(u8: Uint8Array) {
    let bin = '';
    for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
    return btoa(bin);
}

function decryptPayload(sharedSecret: Uint8Array, nonceB58: string, dataB58: string) {
    const opened = nacl.box.open.after(bs58.decode(dataB58), bs58.decode(nonceB58), sharedSecret);
    if (!opened) throw new Error('Failed to decrypt Phantom response');
    return JSON.parse(new TextDecoder().decode(opened));
}

function encryptPayload(sharedSecret: Uint8Array, payload: any) {
    const nonce = nacl.randomBytes(24);
    const msg = new TextEncoder().encode(JSON.stringify(payload));
    const boxed = nacl.box.after(msg, nonce, sharedSecret);
    return { nonce: bs58.encode(nonce), data: bs58.encode(boxed) };
}

function makeRedirectUrl(intent: MobileIntent, id: string) {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('phantom_callback', '1');
    url.searchParams.set('intent', intent);
    url.searchParams.set('req_id', id);
    return url.toString();
}

function toBase58(u8: Uint8Array) {
    return bs58.encode(u8);
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { network } = useNetwork();
    const [state, setState] = useState<WalletState>(() => {
        // check for stored connection state
        const storedPubkey = typeof localStorage !== 'undefined' ? localStorage.getItem('wallet_public_key') : null;
        const storedSessionToken = typeof localStorage !== 'undefined' ? localStorage.getItem('wallet_session_token') : null;

        const isMobileDevice = isMobile();
        const isConnected = isMobileDevice ? !!storedPubkey && !!storedSessionToken : !!storedPubkey;

        return {
            connected: isConnected,
            publicKeyBase58: storedPubkey || undefined,
            publicKey: storedPubkey ? new PublicKey(storedPubkey) : undefined,
            sessionToken: storedSessionToken || undefined,
            isExtensionAvailable: isPhantomExtensionAvailable(),
            isMobileFallbackActive: true,
            isMobileDevice: isMobileDevice,
            pending: null,
        };
    });

    const sessionRef = useRef<{
        dappSecretKey: Uint8Array;
        dappPublicKey: Uint8Array;
        sharedSecret?: Uint8Array;
    } | null>(null);

    const ensureSession = useCallback(() => {
        if (sessionRef.current) return sessionRef.current;

        const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('wallet_deeplink_session') : null;
        if (stored) {
            try {
                const { secret, public: pub } = JSON.parse(stored);
                const restored = {
                    dappSecretKey: b64ToU8(secret),
                    dappPublicKey: b64ToU8(pub),
                } as {
                    dappSecretKey: Uint8Array;
                    dappPublicKey: Uint8Array;
                    sharedSecret?: Uint8Array;
                };

                // try to restore shared secret if we have the Phantom key
                const phantomKey = typeof localStorage !== 'undefined' ? localStorage.getItem('wallet_phantom_key') : null;
                if (phantomKey) {
                    try {
                        restored.sharedSecret = deriveSharedSecret(restored.dappSecretKey, phantomKey);
                        console.log('[WalletProvider] Restored shared secret from storage');
                    } catch (e) {
                        console.error('[WalletProvider] Failed to derive shared secret from stored key:', e);
                    }
                }

                sessionRef.current = restored;
                console.log('[WalletProvider] Restored session keys from storage');
                return restored;
            } catch (e) {
                console.error('[WalletProvider] Failed to restore session keys:', e);
            }
        }

        const newSess = createEphemeralKeypair();
        sessionRef.current = newSess;
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(
                'wallet_deeplink_session',
                JSON.stringify({
                    secret: u8ToB64(newSess.dappSecretKey),
                    public: u8ToB64(newSess.dappPublicKey),
                })
            );
        }
        console.log('[WalletProvider] Created new session keys');
        return newSess;
    }, []);

    const savePending = useCallback((p: PendingAction) => {
        setState((prev) => ({ ...prev, pending: p, isMobileFallbackActive: true }));
        const serialized = { ...p };
        if (serialized.type === 'signMessage' && serialized.message instanceof Uint8Array) {
            // @ts-ignore
            serialized.message = Array.from(serialized.message);
        }
        const json = JSON.stringify(serialized);
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('wallet_pending', json);
        }
        try {
            sessionStorage.setItem('wallet_pending', json);
        } catch (e) {
        }
    }, []);

    const clearPending = useCallback(() => {
        setState((prev) => ({ ...prev, pending: null }));
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('wallet_pending');
        }
        try {
            sessionStorage.removeItem('wallet_pending');
        } catch (e) {
        }
    }, []);

    const startMobileConnect = useCallback(async () => {
        console.log('[WalletProvider] Starting mobile connect');
        const sess = ensureSession();
        const reqId = generateUUID();
        const params = new URLSearchParams({
            dapp_encryption_public_key: toBase58(sess.dappPublicKey),
            cluster: network,
            app_url: window.location.origin,
            redirect_link: makeRedirectUrl('connect', reqId),
        });
        savePending({ id: reqId, type: 'connect' });

        const url = `${MOBILE_UL_BASE}/connect?${params.toString()}`;
        console.log('[WalletProvider] Redirecting to:', url);

        setTimeout(() => {
            window.location.href = url;
        }, 100);

        return new Promise<void>((resolve, reject) => {
            const tm = setTimeout(() => reject(new Error('Connect timeout')), MOBILE_FLOW_TIMEOUT_MS);
            const handler = () => {
                clearTimeout(tm);
                window.removeEventListener('wallet:connected', handler as any);
                resolve();
            };
            window.addEventListener('wallet:connected', handler as any, { once: true });
        });
    }, [ensureSession, savePending, network]);

    const startMobileSignMessage = useCallback(
        async (message: Uint8Array, display: 'utf8' | 'hex' = 'utf8') => {
            const sess = ensureSession();
            const reqId = generateUUID();

            if (!sess.sharedSecret || !state.publicKeyBase58) {
                disconnect();
                throw new Error('Wallet connection invalid. Please connect again.');
            }

            // geting session token from state or localStorage
            let sessionToken = state.sessionToken;
            if (!sessionToken) {
                sessionToken = (typeof localStorage !== 'undefined' ? localStorage.getItem('wallet_session_token') : null) || undefined;
            }

            if (!sessionToken) {
                throw new Error('Session token not found. Please reconnect your wallet.');
            }

            // build and encrypt payload
            const payload = {
                session: sessionToken,
                message: toBase58(message),
                display: display,
            };

            const enc = encryptPayload(sess.sharedSecret, payload);
            const params = new URLSearchParams({
                dapp_encryption_public_key: toBase58(sess.dappPublicKey),
                cluster: network,
                app_url: window.location.origin,
                redirect_link: makeRedirectUrl('signMessage', reqId),
                nonce: enc.nonce,
                payload: enc.data,
            });

            savePending({ id: reqId, type: 'signMessage', message });

            const url = `${MOBILE_UL_BASE}/signMessage?${params.toString()}`;
            console.log('[WalletProvider] Redirecting to Phantom for signing');

            setTimeout(() => {
                window.location.href = url;
            }, 200);

            return new Promise<Uint8Array>(() => { });
        },
        [ensureSession, savePending, state.publicKeyBase58, state.sessionToken]
    );

    const connect = useCallback(async () => {
        console.log('[WalletProvider] connect() called');

        if (!isMobile()) {
            throw new Error('not mobile');
        }

        return startMobileConnect();
    }, [startMobileConnect]);

    const signMessage = useCallback(
        async (m: Uint8Array, display: 'utf8' | 'hex' = 'utf8') => {
            if (!isMobile()) {
                throw new Error('not mobile');
            }

            return startMobileSignMessage(m, display);
        },
        [startMobileSignMessage]
    );

    const resetLastSignature = useCallback(() => {
        setState((prev) => ({ ...prev, lastSignature: undefined }));
    }, []);

    const disconnect = useCallback(() => {
        sessionRef.current = null;
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('wallet_deeplink_session');
            localStorage.removeItem('wallet_session_token');
            localStorage.removeItem('wallet_phantom_key');
            localStorage.removeItem('wallet_public_key');
        }
        setState((prev) => ({
            ...prev,
            connected: false,
            publicKeyBase58: undefined,
            lastSignature: undefined,
            sessionToken: undefined,
            isMobileFallbackActive: true,
        }));
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('wallet_pending');
            localStorage.removeItem('wallet_auth_success');
        }
        try {
            sessionStorage.removeItem('wallet_pending');
            sessionStorage.removeItem('wallet_auth_success');
        } catch (e) {
            // ignore
        }
    }, []);

    // handle redirect from Phantom ->
    useEffect(() => {
        const processReturn = () => {
            const url = new URL(window.location.href);
            const intentQP = url.searchParams.get('intent') as MobileIntent | null;

            const getFromHash = (key: string) => {
                const hash = url.hash || '';
                const m = hash.match(new RegExp(`${key}=([^&]+)`));
                return m ? decodeURIComponent(m[1]) : null;
            };

            // android deeplinks often arrive with params in the hash after a '?'
            const getFromHashQuery = (key: string) => {
                const hash = url.hash || '';
                if (!hash.includes('?')) return null;

                const queryPart = hash.split('?')[1];
                if (!queryPart) return null;

                const params = new URLSearchParams(queryPart);
                return params.get(key);
            };

            const phantomPubB58 =
                url.searchParams.get('phantom_encryption_public_key') ||
                getFromHash('phantom_encryption_public_key') ||
                getFromHashQuery('phantom_encryption_public_key');
            const data = url.searchParams.get('data') || getFromHash('data') || getFromHashQuery('data');
            const nonce = url.searchParams.get('nonce') || getFromHash('nonce') || getFromHashQuery('nonce');
            const errorCode = url.searchParams.get('errorCode') || getFromHash('errorCode') || getFromHashQuery('errorCode');
            const errorMessage =
                url.searchParams.get('errorMessage') || getFromHash('errorMessage') || getFromHashQuery('errorMessage');

            let pendingStr = typeof localStorage !== 'undefined' ? localStorage.getItem('wallet_pending') : null;
            if (!pendingStr) {
                pendingStr = sessionStorage.getItem('wallet_pending');
            }

            let pending: PendingAction | null = null;
            if (pendingStr) {
                try {
                    const parsed = JSON.parse(pendingStr);
                    if (parsed.type === 'signMessage' && Array.isArray(parsed.message)) {
                        parsed.message = new Uint8Array(parsed.message);
                    }
                    pending = parsed;
                } catch (e) {
                    console.error('[WalletProvider] Failed to parse wallet_pending:', e);
                }
            }

            const sess = ensureSession();

            const isSignMessageIntent = pending?.type === 'signMessage' || intentQP === 'signMessage';
            const isConnectIntent = pending?.type === 'connect' || intentQP === 'connect';

            const hasSignMessageParams = isSignMessageIntent && !!data && !!nonce && !!sess.sharedSecret;

            const hasConnectParams = isConnectIntent && !!data && !!nonce && !!phantomPubB58;

            if (!hasSignMessageParams && !hasConnectParams) {
                return;
            }

            if (!pending && !intentQP) {
                return;
            }

            if (errorCode) {
                clearPending();
                console.error('[WalletProvider] Phantom error:', errorCode, errorMessage);

                // cleanup URL
                const cleanUrl = new URL(window.location.href);
                cleanUrl.searchParams.delete('phantom_callback');
                cleanUrl.searchParams.delete('intent');
                cleanUrl.searchParams.delete('req_id');
                cleanUrl.searchParams.delete('phantom_encryption_public_key');
                cleanUrl.searchParams.delete('nonce');
                cleanUrl.searchParams.delete('data');
                cleanUrl.searchParams.delete('errorCode');
                cleanUrl.searchParams.delete('errorMessage');
                cleanUrl.hash = '';
                window.history.replaceState({}, '', cleanUrl.toString());

                if (errorCode === '4001' && phantomPubB58 && data && nonce) {
                } else if (errorCode === '-32603') {
                    disconnect();
                    return;
                } else {
                    return;
                }
            }

            if (pending?.type === 'connect' || intentQP === 'connect') {
                console.log('[WalletProvider] Processing connect response');

                try {
                    if (!phantomPubB58) throw new Error('Missing phantomPubB58 for connect response');
                    const sharedSecret = deriveSharedSecret(sess.dappSecretKey, phantomPubB58);
                    sess.sharedSecret = sharedSecret;

                    const parsed = decryptPayload(sharedSecret, nonce, data);
                    const walletPubBase58: string = parsed?.public_key;
                    const sessionToken: string = parsed?.session;

                    if (!walletPubBase58) throw new Error('Connect response missing public_key');
                    if (!sessionToken) console.warn('[WalletProvider] No session token in connect response');

                    sessionRef.current = sess;
                    const newState = {
                        connected: true,
                        publicKeyBase58: walletPubBase58,
                        publicKey: new PublicKey(walletPubBase58),
                        isMobileFallbackActive: true,
                        sessionToken: sessionToken,
                    };
                    setState((prev) => ({
                        ...prev,
                        ...newState,
                    }));
                    clearPending();

                    // store session data
                    if (sessionToken && typeof localStorage !== 'undefined') {
                        localStorage.setItem('wallet_session_token', sessionToken);
                    }
                    if (phantomPubB58 && typeof localStorage !== 'undefined') {
                        localStorage.setItem('wallet_phantom_key', phantomPubB58);
                    }
                    if (walletPubBase58 && typeof localStorage !== 'undefined') {
                        localStorage.setItem('wallet_public_key', walletPubBase58);
                    }

                    // Clean up URL
                    const cleanUrl = new URL(window.location.href);
                    cleanUrl.searchParams.delete('phantom_callback');
                    cleanUrl.searchParams.delete('intent');
                    cleanUrl.searchParams.delete('req_id');
                    cleanUrl.searchParams.delete('phantom_encryption_public_key');
                    cleanUrl.searchParams.delete('nonce');
                    cleanUrl.searchParams.delete('data');
                    cleanUrl.searchParams.delete('errorCode');
                    cleanUrl.searchParams.delete('errorMessage');
                    cleanUrl.hash = '';
                    window.history.replaceState({}, '', cleanUrl.toString());

                    console.log('[WalletProvider] ✅ Wallet connected:', walletPubBase58);

                    window.dispatchEvent(new CustomEvent('wallet:connected'));
                } catch (e) {
                    clearPending();
                    console.error('[WalletProvider] Connect failed:', e);
                }
                return;
            }

            if (pending?.type === 'signMessage' || intentQP === 'signMessage') {
                console.log('[WalletProvider] Processing signMessage response');

                if (!sess.sharedSecret) {
                    clearPending();
                    console.error('[WalletProvider] No shared secret for signMessage');
                    return;
                }
                try {
                    const parsed = decryptPayload(sess.sharedSecret, nonce, data);
                    const sigB58: string = parsed?.signature;
                    if (!sigB58) throw new Error('signMessage response missing signature');
                    const signature = bs58.decode(sigB58);

                    setState((prev) => ({ ...prev, lastSignature: signature }));

                    // Store authentication success flag
                    try {
                        if (typeof localStorage !== 'undefined') localStorage.setItem('wallet_auth_success', 'true');
                        sessionStorage.setItem('wallet_auth_success', 'true');
                    } catch (e) {
                        console.warn('[WalletProvider] Failed to store auth success flag', e);
                    }

                    // clean up
                    const cleanUrl = new URL(window.location.href);
                    cleanUrl.searchParams.delete('phantom_callback');
                    cleanUrl.searchParams.delete('intent');
                    cleanUrl.searchParams.delete('req_id');
                    cleanUrl.searchParams.delete('phantom_encryption_public_key');
                    cleanUrl.searchParams.delete('nonce');
                    cleanUrl.searchParams.delete('data');
                    cleanUrl.searchParams.delete('errorCode');
                    cleanUrl.searchParams.delete('errorMessage');
                    cleanUrl.hash = '';
                    window.history.replaceState({}, '', cleanUrl.toString());

                    window.dispatchEvent(new CustomEvent('wallet:signed', { detail: signature }));
                    console.log('[WalletProvider] ✅ Message signed successfully');
                } catch (e) {
                    clearPending();
                    console.error('[WalletProvider] SignMessage failed:', e);
                }
                return;
            }
        };

        processReturn();

        const onPop = () => processReturn();
        window.addEventListener('popstate', onPop);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') processReturn();
        });

        return () => {
            window.removeEventListener('popstate', onPop);
        };
    }, [clearPending, ensureSession, setState, disconnect]);

    const value: WalletContextValue = useMemo(
        () => ({
            ...state,
            connect,
            signMessage,
            disconnect,
            resetLastSignature,
            wallet: { name: 'Phantom' },
            select: async (_name: string) => {
            },
        }),
        [state, connect, signMessage, disconnect, resetLastSignature]
    );

    return <WalletReactContext.Provider value={value}>{children}</WalletReactContext.Provider>;
};
