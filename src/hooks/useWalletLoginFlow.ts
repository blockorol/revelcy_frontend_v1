// useWalletLoginFlow.ts
import * as React from "react";
import { useWallet } from "@storage/wallet-adapter";
import { startSession, confirmLogin } from "@api/auth";
import { useAuth } from "@providers/AuthContext";

type RunOptions = {
  /** Принудительно разорвать текущее подключение перед попыткой (для "Try Another Wallet") */
  forceReconnect?: boolean;
};

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
    disconnect?: () => void | Promise<void>; // <-- исправлено тут
  }
) {
  const { login } = useAuth();
  const { connected, publicKey, signMessage } = useWallet();

  // Refs, чтобы избежать гонок и лишних перезапусков
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
  const inflightRef = React.useRef<Promise<void> | null>(null);

  const resetFlow = React.useCallback(() => {
    sessionRef.current = null;
    signatureRef.current = null;
    finishingRef.current = false;
  }, []);

  const busy = inflightRef.current !== null;

  const run = React.useCallback(
    async ({ forceReconnect }: RunOptions = {}) => {
      if (inflightRef.current) return;

      let release!: () => void;
      inflightRef.current = new Promise<void>((res) => (release = res));

      try {
        if (finishingRef.current) return;

        if (forceReconnect && opts?.disconnect) {
          try {
            await opts.disconnect();
          } catch {}
        }

        // 1) Connect (без автоповторов, корректная обработка Cancel)
        if (!connectedRef.current) {
          const ok = await connectWallet().catch((e) => {
            if (isUserReject(e)) {
              resetFlow();
              return false;
            }
            throw e;
          });
          if (!ok) return; // пользователь нажал "Отмена" или коннект не удался
        }

        // 2) Проверки адаптера
        if (!publicKeyRef.current || !signMessageRef.current) return;

        // 3) Session
        if (!sessionRef.current) {
          const { nonce, jwt: jwtSession } = await startSession();
          sessionRef.current = { nonce, jwtSession };
        }

        // 4) Подпись (кешируем в рамках потока)
        if (!signatureRef.current) {
          const enc = new TextEncoder();
          const message = enc.encode(sessionRef.current.nonce);
          signatureRef.current = await signMessageRef.current(message, "utf8");
        }

        // 5) Подтверждение на бэке
        const confirmLoginResp = await confirmLogin({
          walletAddress: publicKeyRef.current.toString(),
          signature: signatureRef.current,
          jwt: sessionRef.current.jwtSession,
        });
        if (!confirmLoginResp) {
          // например, юзер сменил кошелёк в процессе
          return;
        }

        const { jwt, isNewUser } = confirmLoginResp;
        if (!finishingRef.current) {
          finishingRef.current = true;
          opts?.overrideSaveJwt ? opts.overrideSaveJwt(jwt, isNewUser) : login(jwt);
          resetFlow();
          opts?.onSuccess?.();
        }
      } catch (e) {
        // Любая ошибка — аккуратно завершаем поток
        console.error("Wallet login flow error:", e);
        resetFlow();
      } finally {
        release();
        inflightRef.current = null;
      }
    },
    [connectWallet, login, opts, resetFlow]
  );

  return { run, busy, resetFlow };
}
