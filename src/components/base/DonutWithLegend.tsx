import { TextProminent } from "@components/ui/Text";
import { round } from "@utils/numbers";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MD3Colors } from "react-native-paper/lib/typescript/types";
import PieChart from "react-native-pie-chart";

const widthAndHeight = 120;

export interface SliceBase {
  value: number;
  color: string;
  label?: string;
  additional?: string;
}
export interface Slice extends SliceBase {
  subSlices?: {
    restColor?: string;
    slices: SliceBase[];
  }
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

  const seriesInner = slices.flatMap((slice) => {
    const validSubs = getValidSubSlices(slice);
    if (!validSubs) {
      return [
        {
          value: slice.value,
          color: "transparent",
        },
      ];
    }

    const totalSub = validSubs.reduce((a, s) => a + s.value, 0);
    const innerSeries: { value: number; color: string }[] = [];

    validSubs.forEach((sub) => {
      innerSeries.push({
        value: sub.value,
        color: sub.color,
      });
    });

    const remainder = slice.value - totalSub;
    if (remainder > 0) {
      innerSeries.push({
        value: remainder,
        color: slice.subSlices?.restColor??"transparent",
      });
    }
    return innerSeries;
  });
  return (
    <View style={styles.container}>
      <View style={styles.legend}>
        {slices.map((v, idx) =>
          v.label ? (
            <LabelRow
              key={`slice-${idx}-${v.label ?? "nolabel"}`}
              idx={idx}
              colors={colors}
              slice={v}
            />
          ) : null
        )}
      </View>
      <View style={styles.chartWrapper}>
        <PieChart widthAndHeight={widthAndHeight} series={series} cover={0.5} />
        <View style={styles.innerChart}>
          <PieChart
            widthAndHeight={widthAndHeight}
            series={seriesInner}
            cover={0.88}
          />
        </View>
      </View>
    </View>
  );
};

function LabelRow({
  idx,
  colors,
  slice,
}: {
  idx: number;
  slice: Slice;
  colors: MD3Colors;
}) {
  if (!slice.subSlices)
    return <LabelRowBase idx={idx.toString()} colors={colors} slice={slice} />;

  const totalSubSlice = slice.subSlices.slices.reduce((sum, s) => sum + s.value, 0);

  return (
    <View>
      <LabelRowBase idx={idx.toString()} colors={colors} slice={slice} />
      <View style={{ paddingLeft: 18 }}>
        {slice.subSlices.slices.map((v, idx_2) => {
          return (
            <LabelRowBase
              idx={idx.toString() + "-" + idx_2.toString()}
              colors={colors}
              slice={v}
              baseColor={slice.color}
            />
          );
        })}
        {slice.subSlices?.restColor && 
            <LabelRowBase
              idx={idx.toString() + "-rest"}
              colors={colors}
              slice={{
                color: slice.subSlices.restColor,
                label: slice.label,
                value: round(slice.value - totalSubSlice, 1)
              }}
              baseColor={slice.color}
            />}
      </View>
    </View>
  );
}

function LabelRowBase({
  idx,
  slice,
  baseColor,
  colors,
}: {
  idx: string;
  slice: SliceBase;
  baseColor?: string;
  colors: MD3Colors;
}) {
  return (
    <View key={idx} style={styles.legendRow}>
      <View
        style={[
          styles.dot,
          baseColor
            ? { backgroundColor: baseColor }
            : { backgroundColor: slice.color },
        ]}
      >
        {baseColor && (
          <View
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: slice.color },
            ]}
          />
        )}
      </View>

      <View style={styles.legendText}>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          {slice.label}{" "}
        </Text>
        <TextProminent variant="labelMedium">{slice.value}%</TextProminent>
        {slice.additional && (
          <TextProminent
            variant="labelMedium"
            style={{ color: colors.onSurfaceVariant }}
          >
            {slice.additional}
          </TextProminent>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  legend: {
    marginRight: 0,
    alignContent: "center",
    flexDirection: "column",
    gap: 18,
  },
  legendText: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  chartWrapper: {
    width: widthAndHeight,
    height: widthAndHeight,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  innerChart: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});

function getValidSubSlices(slice: Slice): SliceBase[] | undefined {
  if (!slice.subSlices) return undefined;
  const total = slice.subSlices.slices.reduce((a, s) => a + s.value, 0);
  return total <= slice.value ? slice.subSlices.slices : undefined;
}
