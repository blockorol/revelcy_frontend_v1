import React, { createContext, useContext, useMemo, useState } from "react";
import { Portal, Modal } from "react-native-paper";
import OneScreenContainer from "@components/base/container/OneScreenContainer";
import LoginFlow, { LoginState } from "@components/login/LoginFlow";
import MaintenanceNotice from "@components/maintenance/MaintenanceNotice";
import { IS_SITE_SNAPSHOT } from "env";

type LoginOpenOptions = {
  flow?: "login";
  inviteCode?: string | null;
};

type LoginModalCtx = {
  openLogin: (opts?: LoginOpenOptions) => void;
  openMaintenance: () => void;
  closeLogin: () => void;
  isOpen: boolean;
};

const Ctx = createContext<LoginModalCtx | null>(null);

export function useLoginModal() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLoginModal must be used within LoginModalProvider");
  return v;
}

export function LoginModalProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [opts, setOpts] = useState<LoginOpenOptions>({});

  const api = useMemo<LoginModalCtx>(() => ({
    openLogin: (o) => {
      if (!IS_SITE_SNAPSHOT) setOpts(o ?? {});
      setVisible(true);
    },
    openMaintenance: () => setVisible(true),
    closeLogin: () => setVisible(false),
    isOpen: visible,
  }), [visible]);

  return (
    <Ctx.Provider value={api}>
      {children}
      {IS_SITE_SNAPSHOT ? (
        <MaintenanceNotice visible={visible} onClose={api.closeLogin} />
      ) : (
        <Portal>
          <Modal
            visible={visible}
            onDismiss={api.closeLogin}
            style={{ alignItems: "center", justifyContent: "center" }}
          >
            <OneScreenContainer>
              <LoginFlow
                onCloseButton={api.closeLogin}
                inviteCodeOverride={opts.inviteCode ?? undefined}
                loginFlowStateOverride={LoginState.FIRST}
              />
            </OneScreenContainer>
          </Modal>
        </Portal>
      )}
    </Ctx.Provider>
  );
}
