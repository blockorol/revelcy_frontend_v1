// components/LoginPopup.tsx
import React, { useState } from "react";
import { View, StyleSheet, DimensionValue } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { ExtendedMD3Colors } from "@theme/types";
import TextInput from "@components/ui/TextInput";
import GreenButton from "@components/login/buttons/GreenButton";
interface WalletConnectionCheckerProps {
  height: DimensionValue;
  width: number;
  toNext: () => void;
  setUsernameToServer: (
    username: string
  ) => Promise<{ ok: boolean; reason?: string }>;
}

export default function UserName({
  height,
  width,
  toNext,
  setUsernameToServer,
}: WalletConnectionCheckerProps) {
  const theme = useTheme();
  const colors = theme.colors as ExtendedMD3Colors;
  const [userName, setUserName] = useState("");
  const [rawUserName, setRawUserName] = useState<string | undefined>("");
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
          Choose username
        </Text>
        <View style={{ width: "100%" }}>
          <TextInput
            alwaysLabelOnTop
            disableRemoveBtn
            label="Username"
            value={rawUserName}
            placeholder="Enter your username"
            autoFocus={true}
            mode="flat"
            dense={true}
            style={{
              flex: 1,
              backgroundColor: colors.surfaceContainerLow,
            }}
            labelBackgroundColor={colors.surfaceContainerLow}
            errorBackgroundColor={colors.surfaceContainerLow}
            onChangeText={(text) => {
              const cleanText = text.replace(/[^a-zA-Z0-9-_]/g, "");

              if (cleanText.length === 0) {
                setError(undefined);
                setUserName("");
                setRawUserName("");
                return;
              }
              setRawUserName(cleanText);
              const userNameClean = cleanText.trimEnd();

              if (userNameClean.length < 5) {
                setError("Username must be at least 5 characters long");
                setUserName("");
                return;
              }
              if (userNameClean.length > 20) {
                setError("Username can't exceed 20 characters");
                setUserName("");
                return;
              }
              setError(undefined);
              setUserName(userNameClean);
            }}
            errorValue={error}
          />
        </View>
      </View>

      <View style={[styles.headerContainer, { gap: 40 }]}>
        <GreenButton
          buttonText="Continue"
          disabled={userName === ""}
          onClick={async () => {
            try {
              const resp = await setUsernameToServer(userName);
              if (!resp.ok) {
                const reason = resp.reason ?? "";
                if (reason === "already exist") {
                  setError("This username is already taken!");
                  console.log("error: This username is already taken");
                } else {
                  throw Error(`not ok with unexpected reason: ${reason}`);
                }
              } else {
                toNext();
              }
            } catch {
              console.log("error: Some error");
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
