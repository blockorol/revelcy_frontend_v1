import { TextProminent } from "@components/ui/Text";
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import PieChart from "react-native-pie-chart";

const widthAndHeight = 120;

export interface Slice {
  value: number;
  color: string;
  label?: string;
  additional?: string;
}

export interface DonutWithLegendProp {
  slices: Slice[];
}

export const DonutWithLegend = ({ slices }: DonutWithLegendProp) => {
  const { colors } = useTheme();
  const series = slices.map((val) => {
    return {
      value: val.value,
      color: val.color,
    };
  });
  return (
    <View style={styles.container}>
      <View style={styles.legend}>
        {slices.map((v, idx) =>
          v.label ? (
            <View key={idx} style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: v.color }]} />
              <View style={styles.legendText}>
              <Text
                variant="bodySmall"
                style={{ color: colors.onSurfaceVariant }}
              >
                {v.label}{" "}
              </Text>{" "}
              <TextProminent variant="labelMedium">{v.value}%</TextProminent>{" "}
              {v.additional && (
                <TextProminent
                  variant="labelMedium"
                  style={{ color: colors.onSurfaceVariant }}
                >
                  {v.additional}
                </TextProminent>
              )}
              </View>
            </View>
          ) : null
        )}
      </View>

      <PieChart widthAndHeight={widthAndHeight} series={series} cover={0.6} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  legend: {
    marginRight: 16,
  },
  legendText: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
});
