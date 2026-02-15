import ContinueButtonWithProgressBar from "@components/ContinueButtonWithProgressBar";
import { SvgIconButton } from "@components/base/SvgIcon";
import TokenCreateFormHeader from "@components/token/create/TokenCreateFormHeader";
import { WhitelistData, WhitelistEntry } from "@components/token/create/interface";
import { useIsMobileWithDemention } from "@hooks/useIsMobile";
import { useNotification } from "@providers/NotificationContext";
import { ExtendedMD3Colors } from "@theme/types";
import { isSolanaPublicKey } from "@utils/solana";
import React, { useMemo, useState } from "react";
import { Platform, ScrollView, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Switch } from "@components/ui/Switch";

export type EditWhitelistFormProps = {
  onNext: (data: WhitelistData) => void;
  onClose?: () => void;
  onBack?: () => void;
  step: number;
  totalSteps: number;
  presetData?: WhitelistData;
};

function parseWhitelistContent(raw: string): {
  valid: string[];
  invalidCount: number;
  totalParsed: number;
} {
  const tokens = raw
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);

  const unique = Array.from(new Set(tokens));
  const valid = unique.filter((pk) => isSolanaPublicKey(pk));
  const invalidCount = unique.length - valid.length;

  return {
    valid,
    invalidCount,
    totalParsed: unique.length,
  };
}

async function pickFileTextWeb(): Promise<string | null> {
  if (Platform.OS !== "web") return null;
  const doc = (globalThis as any).document;
  if (!doc) return null;

  return await new Promise<string | null>((resolve) => {
    const input = doc.createElement("input");
    input.type = "file";
    input.accept = ".txt,.csv";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      try {
        const text = await file.text();
        resolve(text);
      } catch {
        resolve(null);
      }
    };
    input.click();
  });
}

export default function EditWhitelistForm({
  onNext,
  onClose,
  onBack,
  step,
  totalSteps,
  presetData,
}: EditWhitelistFormProps) {
  const { isMobile } = useIsMobileWithDemention();
  const theme = useTheme();
  const colors = theme.colors as ExtendedMD3Colors;
  const notify = useNotification();
  const [enabled, setEnabled] = useState((presetData?.state ?? "disabled") === "enabled");
  const [entries, setEntries] = useState<WhitelistEntry[]>(presetData?.items ?? []);

  const previewTop10 = useMemo(() => entries.slice(0, 10), [entries]);

  const handleSubmit = () => {
    onNext({
      state: enabled ? "enabled" : "disabled",
      items: entries,
    });
  };

  const onAddPeopleFromFile = async () => {
    if (Platform.OS !== "web") {
      notify.error("File upload is currently supported on web only");
      return;
    }

    const content = await pickFileTextWeb();
    if (content === null) {
      notify.warning("File was not selected");
      return;
    }

    const parsed = parseWhitelistContent(content);
    const existingSet = new Set(entries.map((item) => item.pubkey));
    const newValid = parsed.valid.filter((pubkey) => !existingSet.has(pubkey));
    const nextEntries = [
      ...entries,
      ...newValid.map((pubkey) => ({
        pubkey,
        state: "enabled" as const,
      })),
    ];
    setEntries(nextEntries);

    notify.success(`Parsed ${parsed.totalParsed} keys`, {
      suggest: `Added: ${newValid.length}, Invalid: ${parsed.invalidCount}, Duplicates: ${parsed.valid.length - newValid.length}`,
      duration: 6000,
    });
  };

  const isFilledAll = () => true;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{
        backgroundColor: colors.surfaceContainerLowest,
        borderRadius: isMobile ? 0 : 16,
      }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View
        style={{
          backgroundColor: colors.surfaceContainerLowest,
          width: "100%",
          paddingHorizontal: isMobile ? 16 : 24,
          paddingVertical: isMobile ? 40 : 24,
          maxWidth: 500,
          flex: 1,
        }}
      >
        <View style={{ flex: 1 }}>
          <TokenCreateFormHeader title="Whitelist" theme={theme} onClose={onClose} />
          <View style={{ paddingTop: 24, gap: 24 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text variant="titleMedium" style={{ color: colors.onSurface }}>
                Whitelisting
              </Text>
              <Switch value={enabled} onValueChange={setEnabled} />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text variant="titleMedium" style={{ color: colors.onSurface }}>
                Add people {entries.length}
              </Text>
              <SvgIconButton
                name="plus"
                size={20}
                color={colors.primary}
                onPress={onAddPeopleFromFile}
                containerStyle={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.surfaceContainerHighest,
                }}
              />
            </View>

            <View style={{ gap: 8 }}>
              <Text variant="bodyMedium" style={{ color: colors.onSurface }}>
                Added addresses (top 10)
              </Text>
              <View style={{ gap: 4 }}>
                {previewTop10.length === 0 && (
                  <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                    No addresses added yet
                  </Text>
                )}
                {previewTop10.map((entry) => (
                  <Text key={entry.pubkey} variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                    {entry.pubkey}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 16, paddingBottom: isMobile ? 8 : 16 }}>
          <ContinueButtonWithProgressBar
            theme={theme}
            progress={{
              before: (step - 1) / totalSteps,
              after: step / totalSteps,
            }}
            handleSubmit={handleSubmit}
            isFilledAll={isFilledAll}
            onBack={onBack}
          />
        </View>
      </View>
    </ScrollView>
  );
}
