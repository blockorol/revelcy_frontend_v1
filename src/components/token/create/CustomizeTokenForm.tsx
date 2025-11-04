// components/token/CustomizeTokenForm.tsx
import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import {
  useTheme,
  HelperText,
} from "react-native-paper";
import TextInput from '@components/ui/TextInput'
import { Text } from "@components/ui/Text";
import ContinueAndProgress from "@components/ContinueButtonWithProgressBar";
import TokenCreateFormHeader from "@components/token/create/TokenCreateFormHeader";
import { SvgIcon, SvgIconButton } from "@components/base/SvgIcon";
import { CustomizeTokenData, Link } from "@components/token/create/interface";
import normalizeUrl from "@utils/url";
import { useIsMobileWithDemention } from "@hooks/useIsMobile";
import { ExtendedMD3Colors } from "@theme/types";
import { round } from "@utils/numbers";
import TextInputMultiline from "@components/base/form/TextInputMutiline";
import { Button } from "@components/ui/Button";

const MAX_CALL_TO_ACTION = 5

type CustomizeTokenProps = {
  onNext: (data: CustomizeTokenData) => void;
  onClose?: () => void;
  onBack?: () => void;
  steps?: {
    current: number;
    total: number;
  };
  presetData?: {
    banner?: {
      data?: string;
      url?: string;
    };
    description?: string;
    links?: Link[];
  };
};

export default function CustomizeTokenForm({
  onNext,
  onClose,
  onBack,
  steps,
  presetData,
}: CustomizeTokenProps) {
  const { isMobile, height } = useIsMobileWithDemention();

  const theme = useTheme();
  const colors = theme.colors as ExtendedMD3Colors;

  const [banner, setBanner] = useState<string | undefined>(
    presetData?.banner?.data
  );
  const [bannerError, setBannerError] = useState<string | undefined>(undefined);

  const [description, setDescription] = useState<string>(
    presetData?.description ?? ""
  );

  const [links, setLinks] = useState<Link[]>(presetData?.links ?? []);
  const addLink = (type: 'tg' | "x" | "other") => {
    if (links.length >= MAX_CALL_TO_ACTION)
      return
    setLinks((prev) => [...prev, { text: "", url: "", type: type }]);
  }

  const updateLink = (index: number, field: "text" | "url", value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const removeLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const pickBanner = async () => {
    try {
      const url = await pickImageWithLimited({ max_bytes: 5000 * 1024 });
      if (!!!url) return;
      setBanner(url);
      setBannerError(undefined);
    } catch (e) {
      setBannerError(e as string);
    }
  };

  const handleSubmit = () => {
    onNext({
      description,
      banner: {
        data: banner,
        url: presetData?.banner?.url,
      },
      links: links,
    });
  };

  const isFilledAll = (): boolean => {
    const noFilledLinks = links.find((val) => {
      return val.text === "" || val.url === "";
    });
    return noFilledLinks === undefined;
  };

  const convertLinkIcon = (type: string) => {
    return type === "x"
      ? "x-logo"
      : type === "tg"
        ? "tg-logo"
        : "world-outlined";
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
        <View style={{ gap: 24, flex: 1 }}>
          <TokenCreateFormHeader
            title={"About Community"}
            theme={theme}
            onClose={onClose}
          />
          <View style={{ flexDirection: "row", gap: 16, alignItems: "flex-start" }}>
            <SvgIcon name="info-circle" color={colors.primary} size={24} />
            <View style={{ gap: 8, flex: 1, minWidth: 0 }}>
              <Text
                variant="bodyMedium"
                style={{ color: colors.onSurfaceVariant }}
              >
                Early Community is the key to Token’s success.
              </Text>
              <Text
                variant="bodyMedium"
                style={{ color: colors.onSurfaceVariant }}
              >
                Explain what your Community is about, add calls to action for
                people to participate
              </Text>
            </View>
          </View>

          <View
            style={{
              gap: 56,
            }}
          >
            {/* Banner Upload */}
            <View
              style={{
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                width: "100%",
              }}
            >
              <Text
                variant="labelLarge"
                prominent
                style={{
                  color: colors.onSurface,
                  alignSelf: "flex-start",
                }}
              >
                Community Banner
              </Text>

              <View
                style={{
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <TouchableOpacity
                  onPress={pickBanner}
                  style={{ alignSelf: "center", width: "100%" }}
                >
                  <View
                    style={{
                      width: "100%",
                      aspectRatio: 3,           
                      borderRadius: 24,
                      borderWidth: 1,          
                      borderColor: colors.outlineVariant,
                      backgroundColor: colors.surfaceContainerHighest,
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    {banner || presetData?.banner?.url ? (
                      <Image
                        source={{ uri: banner ?? presetData?.banner?.url }}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />
                    ) : (
                      <>
                        <SvgIcon
                          name="plus"
                          color={colors.onSurface}
                          size={24}
                        />
                        <View style={{ opacity: 0.7, alignItems: "center" }}>
                          <Text
                            variant="labelMedium"
                            style={{ color: colors.onSurfaceVariant }}
                          >
                            Upload image or GIF
                          </Text>
                          <Text
                            variant="labelSmall"
                            style={{ color: colors.onSurfaceVariant }}
                          >
                            Recommended 1500x500px
                          </Text>
                          <Text
                            variant="labelSmall"
                            style={{ color: colors.onSurfaceVariant }}
                          >
                            Max 5 Mb
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
                {bannerError && (
                  <HelperText type="error">{bannerError}</HelperText>
                )}
              </View>
            </View>

            {/* Community Description  */}
            <View style={{ gap: 20, alignContent: "flex-start" }}>
              <Text variant="labelLarge" prominent>
                Community Description
              </Text>

              <TextInputMultiline
                maxLength={20000}
                value={description}
                onChangeValue={setDescription}
                placeholder="Describe your community..."
              />
            </View>

            {/* links */}
            <View style={{ gap: 20 }}>
              <Text variant="labelLarge" prominent>
                Community Calls to Action
              </Text>
              <View style={{ flexDirection: "column", gap: 16 }}>
                {links.map((link, index) => (
                  <View
                    key={index}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 20,
                      backgroundColor: colors.surfaceContainerLow,
                    }}
                  >
                    <View style={styles.headerRow}>
                      <View
                        style={{ gap: 12, alignItems: "flex-start", flex: 1 }}
                      >
                        <Button
                          mode="outlined"
                          leftSvgIconName={convertLinkIcon(link.type)}
                          size="small"
                          style={{ borderRadius: 999, alignSelf: "flex-start" }}
                        >
                          {link.text || "Button preview"}
                        </Button>

                        <TextInput
                          disableRemoveBtn
                          label="Call to Action text"
                          placeholder="e.g. Subcribe to..."
                          maxLength={25}
                          value={link.text}
                          onChangeText={(val) => updateLink(index, "text", val)}
                          mode="flat"
                          backgroundColor={colors.surfaceContainerLow}
                        />
                        <TextInput
                          disableRemoveBtn
                          label={"URL"}
                          placeholder="e.g. https://example.com/..."
                          value={link.url}
                          onChangeText={(val) =>
                            updateLink(index, "url", normalizeUrl(val))
                          }
                          mode="flat"
                          backgroundColor={colors.surfaceContainerLow}
                        />
                      </View>
                      <View
                        style={{
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <SvgIconButton
                          name="x-circle-outlined"
                          size={24}
                          color={colors.onSurface}
                          onPress={() => removeLink(index)}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Add link */}
              {links.length < MAX_CALL_TO_ACTION &&
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    width: "100%",
                  }}
                >
                  <View style={{ flexDirection: "row", gap: 16, height: 24 }}>
                    <SvgIcon
                      name="add-circle-outlined"
                      color={theme.colors.onSurfaceVariant}
                    />

                    <SvgIconButton
                      name="tg-logo"
                      color={theme.colors.onSurface}
                      onPress={() => addLink('tg')}
                    />
                    <SvgIconButton
                      name="x-logo"
                      color={theme.colors.onSurface}
                      onPress={() => addLink('x')}
                    />
                    <SvgIconButton
                      name="world-outlined"
                      color={theme.colors.onSurface}
                      onPress={() => addLink('other')}
                    />
                  </View>
                </View>
              }
            </View>
          </View>
        </View>
        <View style={{ marginTop: 24 }}>
          <ContinueAndProgress
            theme={theme}
            progress={
              steps
                ? {
                  before: (steps.current - 1) / steps.total,
                  after: steps.current / steps.total,
                }
                : undefined
            }
            handleSubmit={handleSubmit}
            isFilledAll={isFilledAll}
            onBack={onBack}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16
  },
});

export async function pickImageWithLimited(args?: {
  max_bytes?: number;
  max_widht?: number;
  max_height?: number;
  aspect?: number;
}) {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "images",
    allowsEditing: true,
    quality: 0.6,
  });
  if (res.canceled) throw "No image was selected";

  let asset = res.assets[0];
  let uri = asset.uri;
  if (!args) return uri;

  if (args.max_widht && asset.width > args.max_widht)
    throw `width too long, limit ${args.max_widht} px`;
  if (args.max_height && asset.height > args.max_height)
    throw `height too long, limit ${args.max_height} px`;
  if (args.aspect && round(asset.width / asset.height, 1) !== args.aspect)
    throw `aspect should be ${args.aspect}`;

  if (args.max_bytes) {
    let size = await getFileSize(uri);
    if (size > args.max_bytes)
      throw `image too high, limit ${(args.max_bytes / 1024).toFixed(0)} Kb`;
  }

  return uri;
}

async function getFileSize(uri: string): Promise<number> {
  try {
    if (uri.startsWith("file://") || uri.startsWith("/")) {
      const info = await FileSystem.getInfoAsync(uri);

      if (!info.exists) {
        return 0;
      }
      return info.size;
    }

    const blob = await fetch(uri).then((r) => r.blob());
    return blob.size;
  } catch {
    return 0;
  }
}
