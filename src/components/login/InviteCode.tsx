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
  setInviteCodeToServer: (
    inviteCode: string
  ) => Promise<{ ok: boolean; reason?: string }>;
}

export default function InviteCode({
  height,
  width,
  toNext,
  setInviteCodeToServer,
}: InviteCodeProps) {
  const theme = useTheme();
  const colors = theme.colors as ExtendedMD3Colors;
  const [inviteCode, setInviteCode] = useState("");
  const [rawInviteCode, setRawInviteCode] = useState<string | undefined>("");
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
            label="Invite Code"
            value={rawInviteCode}
            placeholder="Enter your invite code"
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

              if (inviteCodeClean.length !== 20) {
                setError("Invite code must be exactly 20 characters long");
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
            if (inviteCode === "") {
              toNext();
              return;
            }
            
            try {
              const resp = await setInviteCodeToServer(inviteCode);
              if (!resp.ok) {
                  setError("This invite code is not valid!");
              } else {
                toNext();
              }
            } catch {
              setError("Something went wrong. Please, try again");
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
