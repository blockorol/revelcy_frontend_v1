// useWalletLoginFlow.ts
import * as React from "react";
import { useWallet } from "@storage/wallet-adapter";
import { startSession, confirmLogin } from "@api/auth";
import { useAuth } from "@providers/AuthContext";

type RunOptions = { forceReconnect?: boolean };

function isUserReject(e: unknown) {
  const any = e as any;
  const code = any?.code;
  const msg = (any?.message ?? "").toString().toLowerCase();
  const name = (any?.name ?? "").toString().toLowerCase();
  return code === 4001 || msg.includes("reject") || msg.includes("cancel") || name.includes("reject");
}

export function useWalletLoginFlow(
  connectWallet: () => Promise<boolean>,
  opts?: {
    onSuccess?: () => void;
    overrideSaveJwt?: (jwt: string, isNewUser: boolean) => void;
    disconnect?: () => void | Promise<void>;
  }
) {
  const { login } = useAuth();
  const { connected, publicKey, signMessage, lastSignature, resetLastSignature } = useWallet();

  const connectedRef = React.useRef(connected);
  const publicKeyRef = React.useRef(publicKey);
  const signMessageRef = React.useRef(signMessage);

  React.useEffect(() => {
    connectedRef.current = connected;
    publicKeyRef.current = publicKey;
    signMessageRef.current = signMessage;
  }, [connected, publicKey, signMessage]);

  const sessionRef = React.useRef<{ nonce: string; jwtSession: string } | null>(null);
  const signatureRef = React.useRef<Uint8Array | null>(null);
  const finishingRef = React.useRef(false);

  // 🔧 вот это – источник правды для UI
  const [busy, setBusy] = React.useState(false);
  // 🔒 замок от повторного запуска
  const inflightRef = React.useRef(false);

  const resetFlow = React.useCallback(() => {
    sessionRef.current = null;
    signatureRef.current = null;
    finishingRef.current = false;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('wallet_login_session');
      localStorage.removeItem('wallet_pending');
      localStorage.removeItem('wallet_auth_success');
    }
    try {
      sessionStorage.removeItem('wallet_pending');
      sessionStorage.removeItem('wallet_auth_success');
    } catch (e) {
      // ignore sessionStorage errors
    }
  }, []);

  // flow after redirect -> (Mobile)
  React.useEffect(() => {
    const resumeLogin = async () => {
      if (!lastSignature || !connected || !publicKey || finishingRef.current || inflightRef.current) {
        return;
      }

      const storedSessionStr = typeof localStorage !== 'undefined' ? localStorage.getItem('wallet_login_session') : null;
      if (!storedSessionStr) {
        return;
      }

      try {
        console.log('[useWalletLoginFlow] Resuming login flow');
        inflightRef.current = true;
        setBusy(true);
        const session = JSON.parse(storedSessionStr);

        const confirmLoginResp = await confirmLogin({
          walletAddress: publicKey.toString(),
          signature: lastSignature,
          jwt: session.jwtSession,
        });

        if (confirmLoginResp) {
          const { jwt, isNewUser } = confirmLoginResp;
          console.log('[useWalletLoginFlow] Login confirmed, isNewUser:', isNewUser);
          finishingRef.current = true;

          if (opts?.overrideSaveJwt) {
            opts.overrideSaveJwt(jwt, isNewUser);
            if (isNewUser) {
              setTimeout(() => {
                opts?.onSuccess?.();
              }, 100);
            }
          } else {
            login(jwt);
            setTimeout(() => {
              opts?.onSuccess?.();
            }, 100);
          }
        }
      } catch (e) {
        console.error("[useWalletLoginFlow] Resume login error:", e);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('wallet:auth-error', { detail: e }));
        }
      } finally {
        resetFlow();
        if (resetLastSignature) resetLastSignature();
        inflightRef.current = false;
        setBusy(false);
      }
    };

    resumeLogin();
  }, [lastSignature, connected, publicKey, login, opts, resetFlow, resetLastSignature]);

  const run = React.useCallback(
    async ({ forceReconnect }: RunOptions = {}) => {
      if (inflightRef.current) return;
      inflightRef.current = true;
      setBusy(true);
      try {
        if (finishingRef.current) return;

        if (forceReconnect && opts?.disconnect) {
          try {
            await opts.disconnect();
          } catch { }
        }

        if (!connectedRef.current) {
          if (typeof localStorage !== 'undefined') localStorage.setItem('wallet_auto_login', 'true');
          const ok = await connectWallet().catch((e) => {
            if (isUserReject(e)) {
              resetFlow();
              return false;
            }
            throw e;
          });
          if (typeof localStorage !== 'undefined') localStorage.removeItem('wallet_auto_login');

          if (!ok) return;
        }

        if (!publicKeyRef.current || !signMessageRef.current) return;

        // 3) Session
        if (!sessionRef.current) {
          const { nonce, jwt: jwtSession } = await startSession();
          sessionRef.current = { nonce, jwtSession };
          // persist session for mobile redirect flow
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('wallet_login_session', JSON.stringify(sessionRef.current));
          }
        }

        if (!signatureRef.current) {
          const enc = new TextEncoder();
          const message = enc.encode(sessionRef.current.nonce);
          signatureRef.current = await signMessageRef.current(message, "utf8");
        }

        const confirmLoginResp = await confirmLogin({
          walletAddress: publicKeyRef.current.toString(),
          signature: signatureRef.current,
          jwt: sessionRef.current.jwtSession,
        });
        if (!confirmLoginResp) return;

        const { jwt, isNewUser } = confirmLoginResp;
        if (!finishingRef.current) {
          finishingRef.current = true;

          if (opts?.overrideSaveJwt) {
            opts.overrideSaveJwt(jwt, isNewUser);
            if (isNewUser) {
              opts?.onSuccess?.();
            }
          } else {
            login(jwt);
            opts?.onSuccess?.();
          }

          resetFlow();
        }
      } catch (e) {
        console.error("Wallet login flow error:", e);
        // notificationon UI that authentication failed
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('wallet:auth-error', { detail: e }));
        }
        resetFlow();
      } finally {
        inflightRef.current = false;
        setBusy(false);
      }
    },
    [connectWallet, login, opts, resetFlow]
  );

  // auto-continue flow after connect redirect -> (Mobile)
  React.useEffect(() => {
    const checkAutoLogin = () => {
      const autoLogin = typeof localStorage !== 'undefined' ? localStorage.getItem('wallet_auto_login') : null;
      if (autoLogin && connected && !busy && !inflightRef.current && !finishingRef.current) {
        console.log('[useWalletLoginFlow] Auto-continuing login flow after connect');
        if (typeof localStorage !== 'undefined') localStorage.removeItem('wallet_auto_login');
        run();
      }
    };
    checkAutoLogin();
  }, [connected, run, busy]);

  return { run, busy, resetFlow };
}
