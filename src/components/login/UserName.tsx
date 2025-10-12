// components/LoginPopup.tsx
import React, { useState } from "react";
import { View, StyleSheet, DimensionValue } from "react-native";
import { HelperText, Text, TextInput, useTheme } from "react-native-paper";
import GreenButton from "@components/login/buttons/GreenButton";
import { SvgIcon, SvgIconButton } from "@components/base/SvgIcon";
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
  const [userName, setUserName] = useState("");
  const [rawUserName, setRawUserName] = useState<string | undefined>("");
  const [error, setError] = useState<string>("");

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
          style={{ color: theme.colors.onBackground }}
        >
          Choose username
        </Text>
        <View style={{ width: "100%" }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              alignContent: "center",
            }}
          >
            <TextInput
              label="Username"
              value={rawUserName}
              autoFocus={true}
              mode="flat"
              dense={true}
              style={{
                flex: 1,
                backgroundColor: "transparent",
              }}
              onChangeText={(text) => {
                const cleanText = text.replace(/[^a-zA-Z0-9-_]/g, "");

                if (cleanText.length === 0) {
                  setError("");
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
                setError("");
                setUserName(userNameClean);
              }}
              error={!!error}
              right={
                error !== "" && (
                  <TextInput.Icon
                    icon={() => (
                      <SvgIcon
                        name="info-circle"
                        size={24}
                        color={theme.colors.error}
                      />
                    )}
                    onPress={() => console.log("Icon pressed")}
                  />
                )
              }
            />
            <View style={{alignContent: 'center', justifyContent:'center', alignSelf:'center'}}>
              <SvgIconButton
                onPress={() => {
                  setRawUserName("");
                  setError("");
                  setUserName("");
                }}
                name="x-circle-outlined"
                size={24}
                color={theme.colors.onSurface}
              />
            </View>
          </View>
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
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
