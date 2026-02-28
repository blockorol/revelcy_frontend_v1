import ContinueButtonWithProgressBar from "@components/ContinueButtonWithProgressBar";
import { SvgIconButton } from "@components/base/SvgIcon";
import { Avatar } from "@components/ui/Avatar";
import TokenCreateFormHeader from "@components/token/create/TokenCreateFormHeader";
import { WhitelistData, WhitelistEntry } from "@components/token/create/interface";
import { useIsMobileWithDemention } from "@hooks/useIsMobile";
import { useShortUserInfoList } from "@hooks/useShortUserInfoList";
import { useNotification } from "@providers/NotificationContext";
import { ExtendedMD3Colors } from "@theme/types";
import shortString from "@utils/address_shorter";
import { isSolanaPublicKey } from "@utils/solana";
import React, { useEffect, useMemo, useState } from "react";
import { Text } from "@components/ui/Text";
import { Platform, ScrollView, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
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
  const pageSize = 10;
  const [enabled, setEnabled] = useState((presetData?.state ?? "disabled") === "enabled");
  const [entries, setEntries] = useState<WhitelistEntry[]>(presetData?.items ?? []);
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(entries.length / pageSize)), [entries.length]);
  const pagedEntries = useMemo(
    () => entries.slice(currentPage * pageSize, (currentPage + 1) * pageSize),
    [entries, currentPage]
  );
  const previewAddresses = useMemo(() => pagedEntries.map((entry) => entry.pubkey), [pagedEntries]);
  const { shortInfoMap } = useShortUserInfoList(previewAddresses);

  useEffect(() => {
    if (currentPage > totalPages - 1) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [currentPage, totalPages]);

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

  const onDeleteEntry = (pubkey: string) => {
    setEntries((prev) => prev.filter((entry) => entry.pubkey !== pubkey));
  };

  const getShortInfo = (pubkey: string) => shortInfoMap[pubkey] ?? { address: pubkey };

  const renderWhitelistEntry = (
    entry: WhitelistEntry,
    onDeleteEntryCb: (pubkey: string) => void
  ) => {
    const shortInfo = getShortInfo(entry.pubkey);
    const displayName = shortInfo.name || shortString(entry.pubkey, 4);
    const shortAddress = shortString(entry.pubkey, 4);
    const showAddress = shortInfo.name !== undefined && shortInfo.name !== "";

    return (
      <View
        key={entry.pubkey}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingVertical: 8,
        }}
      >
        <Avatar
          size={40}
          source={shortInfo.avatarUrl ?? null}
          walletAddress={entry.pubkey}
        />

        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="labelLarge" prominent style={{ color: colors.onSurface }}>
            {displayName}
          </Text>
          {showAddress && (
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
              {shortAddress}
            </Text>
          )}
        </View>

        <SvgIconButton
          name="x-base"
          size={16}
          color={colors.onSurfaceVariant}
          onPress={() => onDeleteEntryCb(entry.pubkey)}
          containerStyle={{
            width: 24,
            height: 24,
            borderRadius: 12,
          }}
        />
      </View>
    );
  };

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
                borderRadius: 14,
                backgroundColor: colors.surfaceContainerHigh,
                paddingVertical: 12,
                paddingHorizontal: 12,
              }}
            >
              <Text variant='labelLarge' prominent style={{ color: colors.onSurface }}>
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
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}>
              <Text variant='labelLarge' prominent style={{ color: colors.onSurface }}>
                Add people 
              </Text>
              <Text variant='labelLarge' prominent style={{ color: colors.onSurfaceVariant }}>
                {entries.length} 
              </Text>
              </View>
              
              <SvgIconButton
                name="clip"
                size={24}
                color={colors.onSurface}
                onPress={onAddPeopleFromFile}
                containerStyle={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: colors.outline,
                }}
              />
            </View>

            <View style={{ gap: 8 }}>
              <View style={{ gap: 4 }}>
                {pagedEntries.length === 0 ? (
                  <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                    No addresses added yet
                  </Text>
                ) : (
                  pagedEntries.map((entry) => renderWhitelistEntry(entry, onDeleteEntry))
                )}
              </View>
              {entries.length > pageSize && (
                <View
                  style={{
                    marginTop: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                  >
                    <Text
                      variant="bodySmall"
                      style={{
                        color: currentPage === 0 ? colors.outline : colors.primary,
                      }}
                    >
                      Prev
                    </Text>
                  </TouchableOpacity>

                  <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                    {currentPage + 1} / {totalPages}
                  </Text>

                  <TouchableOpacity
                    onPress={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage >= totalPages - 1}
                  >
                    <Text
                      variant="bodySmall"
                      style={{
                        color: currentPage >= totalPages - 1 ? colors.outline : colors.primary,
                      }}
                    >
                      Next
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
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
