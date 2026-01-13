// components/LoginPopup.tsx
import React, { useState } from "react";
import { View, StyleSheet, DimensionValue } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { ExtendedMD3Colors } from "@theme/types";
import TextInput from "@components/ui/TextInput";
import GreenButton from "@components/login/buttons/GreenButton";
interface InviteCodeProps {
  height: DimensionValue;
  width: number;
  toNext: () => void;
  inviteCodeOverride?: string;
  setInviteCodeToServer: (
    inviteCode: string
  ) => Promise<{ ok: boolean; reason?: string }>;
}

export default function InviteCode({
  height,
  width,
  toNext,
  inviteCodeOverride,
  setInviteCodeToServer,
}: InviteCodeProps) {
  const theme = useTheme();
  const colors = theme.colors as ExtendedMD3Colors;
  const [inviteCode, setInviteCode] = useState(inviteCodeOverride??"");
  const [rawInviteCode, setRawInviteCode] = useState<string | undefined>(inviteCodeOverride);
  const [error, setError] = useState<string|undefined>(undefined);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "space-between",
        height: height,
        width: width,
      }}
    >
      <View style={[styles.headerContainer, { gap: 80 }]}>
        <Text
          variant="titleMedium"
          style={{ color: colors.onBackground }}
        >
          Do you have an invite?
        </Text>
        <View style={{ width: "100%" }}>
          <TextInput
            maxLength={20}
            alwaysLabelOnTop
            disableRemoveBtn
            label="Invite code"
            value={rawInviteCode}
            placeholder="Enter invite code"
            autoFocus={true}
            mode="flat"
            dense={true}
            style={{
              flex: 1,
              backgroundColor: colors.surfaceContainerLow,
            }}
            backgroundColor={colors.surfaceContainerLow}
            onChangeText={(text) => {
              const cleanText = text.replace(/[^a-zA-Z0-9-_]/g, "");

              if (cleanText.length === 0) {
                setError(undefined);
                setInviteCode("");
                setRawInviteCode("");
                return;
              }
              setRawInviteCode(cleanText);
              const inviteCodeClean = cleanText.trimEnd();

              if (inviteCodeClean.length < 5) {
                setError("invite code must be at least 5 characters long");
                setInviteCode("");
                return;
              }
              if (inviteCodeClean.length > 20) {
                setError("Invite code can't exceed 20 characters");
                setInviteCode("");
                return;
              }
              setError(undefined);
              setInviteCode(inviteCodeClean);
            }}
            errorValue={error}
          />
        </View>
      </View>

      <View style={[styles.headerContainer, { gap: 40 }]}>
        <GreenButton
          buttonText="Continue"
          onClick={async () => {
            // skip if no invite code
            if (inviteCode === "") {
              toNext();
              return;
            }

            const resp = await setInviteCodeToServer(inviteCode);

            if (resp.ok) {
              toNext();
              return;
            }

            switch (resp.reason) {
              case "NOT_FOUND":
                setError("Invite code not found");
                return;

              case "ALREADY_APPLIED":
                // second click - skip the code to avoid blocker
                if (error === 'Invite code was already applied earlier') {
                  toNext();
                  return;
                }
                setError("Invite code was already applied earlier");
                return;
              default:
                setError("Something went wrong. Please, try again");
                return;
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
});
