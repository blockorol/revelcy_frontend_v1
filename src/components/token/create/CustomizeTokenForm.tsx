// components/token/CustomizeTokenForm.tsx
import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { TextInput, useTheme, Text, IconButton } from "react-native-paper";
import ContinueAndProgress from "@components/ContinueButtonWithProgressBar";
import TokenCreateFormHeader from "@components/token/create/TokenCreateFormHeader";
import { SvgIcon, SvgIconButton } from "@components/base/SvgIcon";
import { CustomizeTokenData, Link } from "@components/token/create/interface";
import normalizeUrl from "@utils/url";
import useIsMobile from "@hooks/useIsMobile";
import { ExtendedMD3Colors } from "@theme/types";

type CustomizeTokenProps = {
  onNext: (data: CustomizeTokenData) => void;
  onClose?: () => void;
  onBack?: () => void;
  steps?: {
    current: number;
    total: number;
  }
  presetData?: {
    banner?: {
      data?: string;
      url?: string;
    };
    description?: string;
    links?: Link[]
  }
};

export default function CustomizeTokenForm({
  onNext,
  onClose,
  onBack,
  steps,
  presetData
}: CustomizeTokenProps) {
  const isMobile = useIsMobile()
  
  const theme = useTheme();
  const colors = theme.colors as ExtendedMD3Colors;
  const [banner, setBanner] = useState<string | undefined>(presetData?.banner?.data);
  const [description, setDescription] = useState<string>(presetData?.description??"");

  const [links, setLinks] = useState<Link[]>(presetData?.links??[]);

  const addTelegramLink = () => {
    setLinks((prev) => [...prev, { text: "", url: "", type: "tg" }]);
  };
  const addXLink = () => {
    setLinks((prev) => [...prev, { text: "", url: "", type: "x" }]);
  };

  const addOtherLink = () => {
    setLinks((prev) => [...prev, { text: "", url: "", type: "other" }]);
  };

  const updateLink = (index: number, field: "text" | "url", value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const removeLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const pickBanner = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    if (!result.canceled) {
      setBanner(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    onNext({ 
      description, 
      banner: {
        data: banner,
        url:presetData?.banner?.url
      }, 
      links:links });
  };

  const isFilledAll = (): boolean => {
    const noFilledLinks = links.find((val) => {
      return val.text === "" || val.url === "";
    });
    return noFilledLinks === undefined;
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: colors.surfaceContainerLowest, borderRadius: 16 }}
    >
      <View
        style={{
          padding: 24,
          backgroundColor: colors.surfaceContainerLowest,
          borderRadius:  isMobile?0:16,
          justifyContent: "space-between",
          alignItems: "stretch",
          width: "100%",
          height: "100%",
          maxWidth: 500,
          maxHeight: 1000,
        }}
      >
        <View style={{ gap: 30 }}>
          <TokenCreateFormHeader
            title={"About Community"}
            theme={theme}
            onClose={onClose}
          />

          {/* Banner Upload */}
          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              width: "100%",
            }}
          >
            <View
              style={{
                flexDirection: "column",
                gap: 4,
                justifyContent: "center",
                alignItems: "baseline",
              }}
            >
              <Text
                style={{
                  ...theme.fonts.bodyLarge,
                  textAlign: "left",
                  color: colors.onSurface,
                }}
              >
                Community Banner
              </Text>
              <Text
                style={{
                  ...theme.fonts.bodySmall,
                  textAlign: "left",
                  color: colors.onSurfaceVariant,
                }}
              >
                {`This banner will be shown on your About Community’s section `}
              </Text>
            </View>

            <TouchableOpacity
              onPress={pickBanner}
              style={{ alignSelf: "center" }}
            >
              <View
                style={{
                  height: 120,
                  width: 380,
                  borderRadius: 24,
                  backgroundColor: colors.surfaceContainerHighest,
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {(banner || presetData?.banner?.url) ? (
                  <Image
                    source={{ uri: banner??presetData?.banner?.url}}
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <>
                    <Text
                      style={{ fontSize: 24, color: theme.colors.onSurface }}
                    >
                      +
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>

          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            maxLength={150}
            multiline
            placeholder="Describe your community..."
            mode="outlined"
            style={{ borderWidth: 0, backgroundColor: "transparent" }}
            theme={{ colors: {...colors, 
      outline: 'transparent', 
      outlineVariant: 'transparent', // RN Paper 5+
    },  }}
          />

          {/* links */}
          <View>
            <Text variant="bodyLarge">CTA Buttons</Text>
            <Text variant="bodySmall">
              Add call-to-action buttons to help your community engage, explore,
              or take action easily
            </Text>
            {links.map((link, index) => (
              <View key={index} style={styles.linkBlock}>
                <View style={styles.headerRow}>
                  <TextInput
                    label={`Button ${index + 1}`}
                    placeholder="e.g. Subscribe to..."
                    value={link.text}
                    onChangeText={(val) => updateLink(index, "text", val)}
                    mode="flat"
                    underlineColor="transparent"
                    theme={{ colors: { outline: "transparent" } }}
                    style={{ flex: 30, backgroundColor: "transparent" }}
                  />
                  <View
                    style={{
                      flexDirection: "column",
                      flex: 1,
                      alignSelf: "flex-start",
                      alignItems: "center",
                    }}
                  >
                    <IconButton
                      icon="close"
                      size={20}
                      onPress={() => removeLink(index)}
                      style={{ flex: 1 }}
                    />
                    <View style={{ flex: 10 }} />
                  </View>
                </View>
                <View style={{ flexDirection: "row", gap: "20" }}>
                  <SvgIcon
                    name={
                      link.type === "x"
                        ? "x-logo"
                        : link.type === "tg"
                        ? "tg-logo"
                        : "world-outlined"
                    }
                    size={24}
                    color={colors.onSurface}
                  />
                  <TextInput
                    placeholder={
                      link.type === "x"
                        ? "t.me/"
                        : link.type === "tg"
                        ? "t.me/"
                        : "example.com/"
                    }
                    label="URL"
                    value={link.url}
                    onChangeText={(val) =>
                      updateLink(index, "url", normalizeUrl(val))
                    }
                    mode="flat"
                    underlineColor="transparent"
                    theme={{ colors: { outline: "transparent" } }}
                    style={{ backgroundColor: "transparent", flex: 1 }}
                  />
                </View>
              </View>
            ))}

            {/* Social Icons Actions */}
            {
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  width: "100%",
                  paddingTop: 34,
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
                    onPress={() => addTelegramLink()}
                  />
                  <SvgIconButton
                    name="x-logo"
                    color={theme.colors.onSurface}
                    onPress={() => addXLink()}
                  />
                  <SvgIconButton
                    name="world-outlined"
                    color={theme.colors.onSurface}
                    onPress={() => addOtherLink()}
                  />
                </View>
              </View>
            }
          </View>
        </View>
        <ContinueAndProgress
          theme={theme}
          progress={steps?{
            before:(steps.current-1)/steps.total,
            after:(steps.current)/steps.total
          }:undefined}
          handleSubmit={handleSubmit}
          isFilledAll={isFilledAll}
          onBack={onBack}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  linkBlock: {
    backgroundColor: "transparent",
    borderRadius: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
});
