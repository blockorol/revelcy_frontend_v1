import ContinueButtonWithProgressBar from "@components/ContinueButtonWithProgressBar";
import { SvgIconButton } from "@components/base/SvgIcon";
import { SvgIcon } from "@components/base/SvgIcon";
import { Avatar } from "@components/ui/Avatar";
import { Button } from "@components/ui/Button";
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
import { makeTransparent } from "@utils/colors";

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
  invalid: string[];
  invalidCount: number;
  totalParsed: number;
} {
  const tokens = raw
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);

  const unique = Array.from(new Set(tokens));
  const valid = unique.filter((pk) => isSolanaPublicKey(pk));
  const invalid = unique.filter((pk) => !isSolanaPublicKey(pk));
  const invalidCount = unique.length - valid.length;

  return {
    valid,
    invalid,
    invalidCount,
    totalParsed: unique.length,
  };
}

type ParseResultModalData = {
  totalParsed: number;
  addCount: number;
  invalidCount: number;
  invalidPreview: string;
  nextEntries: WhitelistEntry[];
};

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
  const [parseResultModal, setParseResultModal] = useState<ParseResultModalData | null>(null);
  const [removeAllModalOpen, setRemoveAllModalOpen] = useState(false);

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
    const invalidPreview = parsed.invalid
      .slice(0, 4)
      .map((value) => shortString(value, 4))
      .join(", ");
    const invalidTail = parsed.invalid.length > 4 ? ", etc." : "";

    setParseResultModal({
      totalParsed: parsed.totalParsed,
      addCount: newValid.length,
      invalidCount: parsed.invalidCount,
      invalidPreview: `${invalidPreview}${invalidTail}`,
      nextEntries,
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

              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                {entries.length > 0 && (
                  <Button
                    mode="outlined"
                    variant="error"
                    size="small"
                    onPress={() => setRemoveAllModalOpen(true)}
                  >
                    Remove all
                  </Button>
                )}
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
      {parseResultModal && (
        <View
          style={{
            position: "fixed" as any,
            inset: 0 as any,
            width: "100%",
            height: "100%",
            backgroundColor: makeTransparent(colors.surfaceContainerLowest, 0.08),
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 9999,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 420,
              borderRadius: 24,
              backgroundColor: colors.surfaceContainerLow,
              paddingHorizontal: 24,
              paddingVertical: 24,
              gap: 8,
            }}
          >
            <Text variant="titleLarge" prominent style={{ color: colors.onSurface, textAlign: "center" }}>
              {parseResultModal.addCount}/{parseResultModal.totalParsed} wallets uploaded
            </Text>

            {parseResultModal.invalidCount > 0 && (
              <View style={{ gap: 16, alignItems: "center" }}>
                <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
                  <SvgIcon name='info-circle' size={24} color={colors.error} />
                  <Text variant="titleMedium" prominent style={{ color: colors.error }}>
                    {parseResultModal.invalidCount} wallets not valid
                  </Text>
                </View>
                {!!parseResultModal.invalidPreview && (
                  <Text
                    variant="bodyMedium"
                    style={{ color: colors.onSurfaceVariant, textAlign: "center" }}
                  >
                    {parseResultModal.invalidPreview}
                  </Text>
                )}
              </View>
            )}

            <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
              <Button
                mode="outlined"
                variant="error"
                style={{ flex: 1 }}
                onPress={() => setParseResultModal(null)}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                style={{ flex: 1 }}
                disabled={parseResultModal.addCount === 0}
                onPress={() => {
                  setEnabled(true);
                  setEntries(parseResultModal.nextEntries);
                  setParseResultModal(null);
                  notify.success(`Added ${parseResultModal.addCount} wallets`);
                }}
              >
                {`Add ${parseResultModal.addCount}`}
              </Button>
            </View>
          </View>
        </View>
      )}
      {removeAllModalOpen && (
        <View
          style={{
            position: "fixed" as any,
            inset: 0 as any,
            width: "100%",
            height: "100%",
            backgroundColor: makeTransparent(colors.surfaceContainerLowest, 0.08),
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 10000,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 420,
              borderRadius: 24,
              backgroundColor: colors.surfaceContainerLow,
              paddingHorizontal: 24,
              paddingVertical: 24,
              gap: 0,
            }}
          >
            <Text variant="titleMedium" prominent style={{ color: colors.onSurface, textAlign: "center" }}>
              Are you sure you want
            </Text>
            <Text variant="titleMedium" prominent style={{ color: colors.onSurface, textAlign: "center" }}>
              to remove all wallets from whitelist?
            </Text>

            <View style={{ flexDirection: "row", gap: 12, marginTop: 28, alignItems: "center", justifyContent: "center" }}>
              <Button
                mode="outlined"
                variant="secondary"
                size="small"
                style={{width: 84 }}
                onPress={() => setRemoveAllModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                size="small"
                variant="error"
                style={{ width: 84 }}
                onPress={() => {
                  setEntries([]);
                  setCurrentPage(0);
                  setRemoveAllModalOpen(false);
                }}
              >
                Remove
              </Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
