// components/token/CustomizeTokenForm.tsx
import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
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
            onBack={onBack} 
          />

          {/* Banner Upload — ИСПРАВЛЕНО */}
          <View
            style={{
              flexDirection: "column",
              gap: 16,
              width: "100%",
            }}
          >
            <View
              style={{
                flexDirection: "column",
                gap: 4,
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
              style={{ alignSelf: "stretch" }} // тянем на 100% контейнера
            >
              <View
                style={styles.bannerContainer}
              >
                {(banner || presetData?.banner?.url) ? (
                  <Image
                    source={{ uri: banner??presetData?.banner?.url}}
                    style={styles.bannerImage}
                    resizeMode="cover" // cover как в макете
                  />
                ) : (
                  <View style={styles.bannerPlaceholder}>
                    <Text style={{ fontSize: 24, color: theme.colors.onSurface }}>+</Text>
                    <Text style={{ color: colors.onSurfaceVariant, marginTop: 6 }}>
                      Upload image or GIF
                    </Text>
                    <Text style={{ color: colors.onSurfaceVariant, opacity: 0.7 }}>
                      Recommended 1500×500px
                    </Text>
                  </View>
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
      outlineVariant: 'transparent',
    },  }}
          />

          {/* CTA cards */}
          <View style={{ gap: 24 }}>
            <Text variant="bodyLarge">CTA Buttons</Text>
            <Text variant="bodySmall">
              Add call-to-action buttons to help your community engage, explore,
              or take action easily
            </Text>

            {links.map((link, index) => {
              const pillText = link.text?.trim() ? link.text : "Button preview";
              const iconName =
                link.type === "x" ? "x-logo" : link.type === "tg" ? "tg-logo" : "world-outlined";

              return (
                <View key={index} style={styles.ctaCard}>
                  {/* delete */}
                  <IconButton
                    icon="close"
                    size={18}
                    onPress={() => removeLink(index)}
                    style={styles.ctaDelete}
                  />

                  {/* pill preview */}
                  <View style={styles.pill}>
                    <SvgIcon name={iconName} size={16} color={"#FFFFFF"} />
                    <Text style={styles.pillText}>{pillText}</Text>
                  </View>

                  {/* text input */}
                  <TextInput
                    placeholder="Call to Action text"
                    value={link.text}
                    onChangeText={(val) => updateLink(index, "text", val)}
                    mode="flat"
                    underlineColor="transparent"
                    theme={{ colors: { outline: "transparent" } }}
                    style={styles.ctaInput}
                  />

                  {/* url input */}
                  <TextInput
                    placeholder="URL"
                    value={link.url}
                    onChangeText={(val) =>
                      updateLink(index, "url", normalizeUrl(val))
                    }
                    mode="flat"
                    underlineColor="transparent"
                    theme={{ colors: { outline: "transparent" } }}
                    style={styles.ctaInput}
                  />
                </View>
              );
            })}

            {/* Social Icons Actions */}
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
                  onPress={addTelegramLink}
                />
                <SvgIconButton
                  name="x-logo"
                  color={theme.colors.onSurface}
                  onPress={addXLink}
                />
                <SvgIconButton
                  name="world-outlined"
                  color={theme.colors.onSurface}
                  onPress={addOtherLink}
                />
              </View>
            </View>
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
        />
      </View>
    </ScrollView>
  );
}

const CARD_BG = "#1C1B1C";
const PILL_BG = "#000000";

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

  // --- Только баннер ---
  bannerContainer: {
    width: "100%",
    height: 150,           // как в фигме
    borderRadius: 24,      // как в фигме
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",    // обрезаем по радиусу
  },
  bannerPlaceholder: {
    width: "100%",
    height: "100%",
    paddingTop: 38,        // паддинги для пустого состояния
    paddingRight: 39,
    paddingBottom: 38,
    paddingLeft: 39,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    ...(Platform.OS === "web" ? { objectFit: "cover" as any } : {}),
  },

  // --- CTA Card (как в фигме) ---
ctaCard: {
  position: "relative",
  backgroundColor: CARD_BG,
  borderRadius: 20,
  padding: 16,
  gap: 12,
},
ctaDelete: {
  position: "absolute",
  top: 4,
  right: 4,
  margin: 0,
},

// pill preview
pill: {
  alignSelf: "flex-start",
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#1C1B1C", // фон как в фигме
  borderWidth: 1,
  borderColor: "#FFFFFF", // белая обводка
  borderRadius: 999,
  height: 32,
  paddingHorizontal: 14,
  gap: 8,
},
pillText: {
  color: "#FFFFFF",
  fontSize: 12,
  fontWeight: "500",
},


  // inputs
  ctaInput: {
    backgroundColor: "transparent",
  },
});
