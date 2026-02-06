import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme, Text } from "react-native-paper";

import Slider from "@react-native-assets/slider";
import { MarkerProps } from "@react-native-community/slider";
import { TextProminent } from "@components/ui/Text";
import { round } from "@utils/numbers";
import { convertSolToPercentOnStart } from "@services/pumpfun/adds";
import { linearOffset, linearOffsetReverse } from "@utils/math";

interface CustomSliderProps {
  initValue?: number;
  min?: number;
  max?: number;
  onValueChange: (value: number) => void;
  labels?: number[]; // e.g., [20, 40, 60, 79.3]
  points?: number[]; // e.g., [20, 40, 60, 79.3]
  isMobile: boolean;
  step?: number;
  bubbleWidth?: number;
  formatBubbleText?: (value: number) => string;
  formatLabel?: (label: number, index: number) => string;
  edgeLabelInset?: number; // px, move first/last label toward center
}

export const CustomSlider: React.FC<CustomSliderProps> = ({
  initValue,
  min = 20,
  max = 80,
  onValueChange,
  labels = [20, 40, 60, 79],
  points = [20, 30, 40, 50, 60, 70, 79],
  isMobile,
  step = 0.1,
  bubbleWidth = 110,
  formatBubbleText,
  formatLabel,
  edgeLabelInset = 0,
}) => {
  const theme = useTheme();
  const [sliderWidth, setSliderWidth] = useState(0);
  const [sliderValue, setSliderValue] = useState(initValue ?? min);
  const treangleSize = 8;
  const maxOffset = (bubbleWidth-treangleSize-20)/2;

  return (
    <View style={{ marginVertical: 32 }}>
      <View
        onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
        style={styles.sliderContainer}
      >
        <Slider
          style={{ width: "100%", height: 40 }}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={sliderValue}
          onValueChange={(val: number) => {
            setSliderValue(val);
            onValueChange(val);
          }}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.onSurfaceVariant}
          thumbTintColor={theme.colors.onBackground}
          StepMarker={(props: MarkerProps) => {
            if (!props.stepMarked) {
              return null
            }
            const value = props.currentValue ?? 0;
            const percent = round(convertSolToPercentOnStart(value), 0)
            const settingsFirst = {
              min: min,
              max: 0.3*(max-min)+min,
              maxOffset: maxOffset
            }
            const settingsLast = {
              min: 0.6*(max-min)+min,
              max: max,
              maxOffset: maxOffset
            }


            let offsetX = 
              value < 0.3*(max-min)+min ?
              linearOffset(value, settingsFirst.min, settingsFirst.max, settingsFirst.maxOffset)  :  // first 30%    a->0 при сдвиге от c до e
              value < 0.6*(max-min)+min ? 0   // second 30%
              : -linearOffsetReverse(value, settingsLast.min, settingsLast.max, settingsLast.maxOffset); // last 30%

            return (
              <View
                style={{
                  height: 32,
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                {/* ====== Bubble ====== */}
                {props.stepMarked && (
                  <View>
                    <View
                      style={{
                        position: "absolute",
                        top: -30,
                        alignSelf: "center",
                        backgroundColor: theme.colors.primary,
                        width: bubbleWidth,
                        height: 25,
                        paddingHorizontal: 2,
                        borderRadius: 8,
                        justifyContent: "center",
                        alignItems: "center",
                        transform: [{ translateX: offsetX }],
                      }}
                    >
                      <TextProminent
                        ellipsizeMode="tail"
                        numberOfLines={1}
                        variant="labelMedium"
                        style={{ color: theme.colors.onPrimary }}
                      >
                        {formatBubbleText ? formatBubbleText(value) : `${percent}% ${value.toFixed(1)} SOL`}
                      </TextProminent>
                    </View>

                    {/* Triangle */}
                    <View
                      style={{
                        width: 0,
                        height: 0,
                        borderLeftWidth: 8,
                        borderRightWidth: 8,
                        borderTopWidth: 10,
                        borderLeftColor: "transparent",
                        borderRightColor: "transparent",
                        borderTopColor: theme.colors.primary,
                        marginTop: -6,
                      }}
                    />
                  </View>
                )}
              </View>
            );
          }}
        />

        {/* Vertical lines */}
        {points.map((point) => {
          const left = ((point - min) / (max - min)) * sliderWidth;
          return (
            <View
              key={`tick-${point}`}
              style={{
                position: "absolute",
                zIndex: -1,
                left,
                top: 25,
                width: 1,
                height: 6,
                backgroundColor: theme.colors.onSurfaceVariant,
              }}
            />
          );
        })}

        {/* Labels */}
        {labels.map((label, idx) => {
          const leftBase = ((label - min) / (max - min)) * sliderWidth;

          const left =
            idx === 0
              ? leftBase + edgeLabelInset
              : idx === labels.length - 1
              ? leftBase - edgeLabelInset
              : leftBase;

          const labelText = formatLabel ? formatLabel(label, idx) : String(label);

          return (
            <View
              key={`label-${label}-${idx}`}
              style={{
                position: "absolute",
                top: 33,
                left,
                transform: [{ translateX: -5 }],
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 10, color: theme.colors.onSurfaceVariant }}>
                {labelText}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sliderContainer: {
    position: "relative",
    width: "100%",
    alignSelf: "center",
  },
  bubble: {
    position: "absolute",
    bottom: 36,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    zIndex: 10,
  },
  bubbleText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 12,
  },
  labelsRow: {
    position: "absolute",
    top: 32,
    left: 0,
    right: 0,
    flexDirection: "row",
  },
  labelContainer: {
    position: "absolute",
  },
  labelText: {
    paddingTop: 4,
    fontSize: 10,
  },
  vLine: {
    height: 4,
    width: 1,
  },
  thumbCircle: {
    position: "absolute",
    bottom: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  thumbText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
    lineHeight: 12,
  },
  thumbSubText: {
    fontSize: 8,
    color: "#000",
  },
});
