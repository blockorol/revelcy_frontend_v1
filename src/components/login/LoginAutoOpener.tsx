// components/login/LoginAutoOpener.tsx
import React, { useEffect, useRef } from "react";
import { useGlobalSearchParams } from "expo-router";
import { useLoginModal } from "@providers/LoginModalContext";

export default function LoginAutoOpener() {
  const params = useGlobalSearchParams<{
    with_flow?: string;
    invite_code?: string;
  }>();

  const { openLogin, isOpen } = useLoginModal();
  const openedOnceRef = useRef(false);

  useEffect(() => {
    if (params.with_flow !== "login") return;
    if (openedOnceRef.current) return;
    if (isOpen) return;

    openedOnceRef.current = true;

    openLogin({
      flow: "login",
      inviteCode: params.invite_code ?? null,
    });
  }, [params.with_flow, params.invite_code, isOpen, openLogin]);

  return null;
}
