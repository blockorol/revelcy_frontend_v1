// useWalletLoginFlow.ts
import * as React from "react";
import { useWallet } from "@storage/wallet-adapter";
import { startSession, confirmLogin } from "@api/auth";
import { useAuth } from "@providers/AuthContext";
import { userSetAdditionalInfo } from "@services/fingerprint/sender";

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
  const { connected, publicKey, signMessage } = useWallet();

  const connectedRef = React.useRef(connected);
  const publicKeyRef = React.useRef(publicKey);
  const signMessageRef = React.useRef(signMessage);

  React.useEffect(() => {
    connectedRef.current = connected;
    publicKeyRef.current = publicKey;
    signMessageRef.current = signMessage;
  }, [connected, publicKey, signMessage]);

  const sessionRef = React.useRef<{ nonce: string; jwtSession: string } | null>(null);
  const signatureRef = React.useRef<Uint8Array<ArrayBufferLike> | null>(null);
  const finishingRef = React.useRef(false);

  const [busy, setBusy] = React.useState(false);
  const inflightRef = React.useRef(false);

  const resetFlow = React.useCallback(() => {
    sessionRef.current = null;
    signatureRef.current = null;
    finishingRef.current = false;
  }, []);

  const run = React.useCallback(
    async ({ forceReconnect }: RunOptions = {}) => {
      let isNewUser: any = undefined;

      if (inflightRef.current) return;
      inflightRef.current = true;
      setBusy(true);
      try {
        if (finishingRef.current) return;

        if (forceReconnect && opts?.disconnect) {
          try {
            await opts.disconnect();
          } catch {}
        }

        if (!connectedRef.current) {
          const ok = await connectWallet().catch((e) => {
            if (isUserReject(e)) {
              resetFlow();
              return false;
            }
            throw e;
          });
          if (!ok) return;
        }

        if (!publicKeyRef.current || !signMessageRef.current) return;

        // 3) Session
        if (!sessionRef.current) {
          const { nonce, jwt: jwtSession } = await startSession();
          sessionRef.current = { nonce, jwtSession };
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

        const { jwt, isNewUser:isNewUserSetted } = confirmLoginResp;
        isNewUser = isNewUserSetted
        if (!finishingRef.current) {
          finishingRef.current = true;
          opts?.overrideSaveJwt ? opts.overrideSaveJwt(jwt, isNewUserSetted) : login(jwt);
          resetFlow();
          opts?.onSuccess?.();
        }
      } catch (e) {
        console.error("Wallet login flow error:", e);
        resetFlow();
      } finally {
        userSetAdditionalInfo({
          userId: publicKeyRef.current? publicKeyRef.current.toString(): undefined,
          eventType: isNewUser ? 'register' : 'login' 
        });
        inflightRef.current = false;
        setBusy(false);
      }
    },
    [connectWallet, login, opts, resetFlow]
  );

  return { run, busy, resetFlow };
}
