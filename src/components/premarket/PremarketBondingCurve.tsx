import React, { useEffect, useState } from 'react';
import { DimensionValue, View, Image as RNImage } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Svg, Path, Circle, Line, Image as SvgImage, Text as SvgText, Defs, ClipPath } from 'react-native-svg';
import { BN } from '@coral-xyz/anchor';
import { AppTheme } from '@theme/types';
import {
  convertLamportToSmallCount,
  convertSmallCountToLamport,
  convertSolToPercentOnStart,
  PremarketState,
} from '@utils/premarket';
import { MD3Colors, MD3Typescale } from 'react-native-paper/lib/typescript/types';

interface BondingCurvePoint { sol_lamp: BN; persent: number }
interface BondingCurvePointWithCoordinate extends BondingCurvePoint { x: number; y: number }
interface GenerateBondingCurvePointsArgs {
  from: number; to: number; stepSol: number
}

export function generateBondingCurvePointsFromZero(args: GenerateBondingCurvePointsArgs): BondingCurvePoint[] {
  const { from, to, stepSol } = args;

  if (stepSol <= 0) throw new Error("step must be positive integer");
  if (from < 0 || to > 200 || from > to) throw new Error("solana must satisfy 0 ≤ from ≤ to ≤ 200");

  const result: BondingCurvePoint[] = [];



  for (let p = 0; p < to; p += stepSol) {
    const persent = convertSolToPercentOnStart(p)
    const currentSolana = convertSmallCountToLamport(p)
    result.push({ persent: persent, sol_lamp: currentSolana });
  }
  return result;
}


const bondingCurvePoints = generateBondingCurvePointsFromZero({
  from: 0,
  to: 120,
  stepSol: 0.1,
});

export interface Joiner {
  id: string;
  user_url?: string;
  amount_sol_lamp: BN;
  amount_sol_cumulative_lamp: BN;
}


const imgOkCache = new Map<string, boolean>();
function useImageExists(url?: string): boolean {
  const [ok, setOk] = useState<boolean>(false);

  useEffect(() => {
    if (!url) { setOk(false); return; }
    const cached = imgOkCache.get(url);
    if (cached !== undefined) { setOk(cached); return; }

    let cancelled = false;
    RNImage.getSize(
      url,
      () => { if (!cancelled) { imgOkCache.set(url, true); setOk(true); } },
      () => { if (!cancelled) { imgOkCache.set(url, false); setOk(false); } },
    );

    return () => { cancelled = true; };
  }, [url]);

  return ok;
}

const JoinerMarker: React.FC<{
  url?: string;
  x: number;
  y: number;
  color: string;
  background: string;
}> = ({ url, x, y, color, background }) => {
  const exists = useImageExists(url);

  if (url && exists) {
    return (
      <>
        <Circle
          cx={x}
          cy={y}
          r={8}
          stroke={color}
          strokeWidth={1}
          fill={color}
        />
        {/* само фото */}
        <SvgImage
          href={{ uri: url }}
          width={16}
          height={16}
          x={x - 8}
          y={y - 8}
          clipPath={`url(#clip-${x}-${y})`}
        />
        <ClipPath id={`clip-${x}-${y}`}>
          <Circle cx={x} cy={y} r={8} />
        </ClipPath>
      </>
    );
  }

  return (
    <Circle
      cx={x}
      cy={y}
      r={6}
      fill={color}
      stroke={background}
      strokeWidth={1}
    />
  );
};



interface PremarketBondingCurveProps {
  state: PremarketState;

  goalPercent: number;
  nowPercent: number;
  currentPrice: number;
  joiners: Joiner[];
  background?: string;
  maxSolDisplayed?: number;
  maxPercentDisplay?: number;
  width?: number;
  height?: number;
  padding?: number;

  widthAround?: DimensionValue;
  heightAround?: DimensionValue;
}

export const PremarketBondingCurve: React.FC<PremarketBondingCurveProps> = ({
  state,
  goalPercent,
  nowPercent,
  currentPrice,
  joiners,
  background,
  maxSolDisplayed = 100,
  maxPercentDisplay = 90,

  width = 347,
  height = 250,
  padding = 16,
}) => {
  const { colors, fonts } = useTheme() as AppTheme;
  const widthSVG = width - padding*2
  const heightSVG= height - padding*2
  const graphMarginLeft = 16;
  const graphMarginRight = 0;
  const graphMarginBottom = 20;
  const YLineWight = 22;
  const XLineHeight = 22;

  const dWidthGraph_SVG = graphMarginLeft + YLineWight;
  const dHeightGraph_SVG = graphMarginBottom + XLineHeight;


  const widthGraph = widthSVG - dWidthGraph_SVG - graphMarginRight
  const heightGraph = heightSVG - dHeightGraph_SVG

  const solToY = (sol: number) => {
    return (heightGraph - (sol * heightGraph / maxSolDisplayed) );
  };
  const percentToX = (p: number) => ((widthGraph * p )/ maxPercentDisplay) + dWidthGraph_SVG;

  const curvePoints: BondingCurvePointWithCoordinate[] = bondingCurvePoints.map((v) => ({
    persent: v.persent,
    sol_lamp: v.sol_lamp,
    x: percentToX(v.persent),
    y: solToY(convertLamportToSmallCount(v.sol_lamp)),
  }));
  const beforeNow = curvePoints.filter(p => p.persent <= nowPercent);
  const afterNow = curvePoints.filter(p => p.persent >= nowPercent);

  const pathBefore = beforeNow.reduce(
    (acc, p, i) => (i === 0 ? `M${p.x},${p.y}` : `${acc} L${p.x},${p.y}`),
    ""
  );
  const pathAfter = afterNow.reduce(
    (acc, p, i) => (i === 0 ? `M${p.x},${p.y}` : `${acc} L${p.x},${p.y}`),
    ""
  );

  const goalPoint = findPointByPercent(curvePoints, goalPercent);
  const nowPoint = findPointByPercent(curvePoints, nowPercent);

  const goalTop = 
    state === 'premarket' && goalPoint.y === nowPoint.y  ? 
      goalPoint.y - (fonts.labelSmall.fontSize as number) * 0.2 :
      goalPoint.y + (fonts.labelSmall.fontSize as number) / 2

  const nowTop = 
    goalPoint.y === nowPoint.y ? 
      nowPoint.y + (fonts.labelSmall.fontSize as number) * 1.2 : 
      nowPoint.y + (fonts.labelSmall.fontSize as number) / 2

  const goalColor = 
    state === 'canceled' ? colors.error : 
    state === 'finished' ? colors.primary :
    colors.secondary
  const onGoalColor = 
    state === 'canceled' ? colors.onError : 
    state === 'finished' ? colors.onPrimary :
    colors.onSecondary

  if (state === 'canceled') {
    currentPrice = 0
  }
  

  return (
    <View style={{
      backgroundColor: background,
      borderRadius: 16,
      padding: padding, width: width, height: height }}>
      <Svg height={heightSVG} width={widthSVG}>
        {/* axes */}
        {/* 
        <Line x1={margin} y1={margin} x2={margin} y2={height - margin} stroke={colors.outlineVariant} />
        <Line x1={margin} y1={height - margin} x2={width - margin} y2={height - margin} stroke={colors.outlineVariant} />
         */}

        {/* curve */}
        <Path d={pathBefore} stroke={colors.primary} strokeWidth={4} fill="none" />
        <Path d={pathAfter} stroke={colors.inverseOnSurface} strokeWidth={4} fill="none" />

        {/* goal line */}
        <Line x1={YLineWight} x2={goalPoint.x -4} y1={goalPoint.y} y2={goalPoint.y} stroke={goalColor} strokeDasharray="10" />
        <Circle
          cx={goalPoint.x}
          cy={goalPoint.y}
          r={4}
          stroke={goalColor}
          strokeWidth={1}
          fill="none"
        />

        {/* now line */}
        { state === 'premarket' &&
          <Line x1={YLineWight} x2={nowPoint.x} y1={nowPoint.y} y2={nowPoint.y} stroke={colors.primary} strokeDasharray="5" />
        }

        {/* joiners */}
        {joiners.map((j) => {
          const point = findPointBySol(curvePoints, j.amount_sol_cumulative_lamp);
          return (
            <JoinerMarker
              key={j.id}
              url={j.user_url}
              x={point.x}
              y={point.y}
              color={colors.primary}
              background={colors.background}
            />
          );
        })}

        {/* Y labels */}
        {[20, 40, 60, 80].map((sol) => {
          const y = solToY(sol);
          return (
            <SvgText
              key={`y-${y}`}
              x={0}
              y={y+fonts.labelSmall.fontSize/2}
              fill={colors.onSurfaceVariant}
              fontSize={fonts.labelSmall.fontSize}
              fontFamily={fonts.labelSmall.fontFamily}
              fontWeight={fonts.labelSmall.fontWeight as any}
            >
              {Math.round(sol)}
            </SvgText>
          );
        })}
        <SvgText
          x={0}
          y={fonts.labelSmall.fontSize}
          fill={colors.onSurfaceVariant}
          fontSize={fonts.labelSmall.fontSize}
          fontFamily={fonts.labelSmall.fontFamily}
          fontWeight={fonts.labelSmall.fontWeight as any}
        >SOL</SvgText>

        {/* X labels */}
        {[0, 25, 50, 75, 100].map((p) => {
          const x = percentToX(p);
          return (
            <SvgText
              key={`x-${p}`}
              x={x}
              y={heightSVG}
              fill={colors.onSurfaceVariant}
              fontSize={fonts.labelSmall.fontSize}
              fontFamily={fonts.labelSmall.fontFamily}
              fontWeight={fonts.labelSmall.fontWeight as any}
              textAnchor="middle"
            >{p}%</SvgText>
          );
        })}
      </Svg>

      {/* Right section */}
      <View style={{justifyContent:'flex-end', position: 'absolute', right: padding+graphMarginRight, bottom: (padding + dHeightGraph_SVG) }}>
        <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant, textAlign: 'right' }}>
          Current Price
        </Text>
        <CurrentPriceValue currentPrice={currentPrice} colors={colors} fonts={fonts}/>
      </View>

      {/* Labels */}
      <Text
        variant="labelSmall"
        style={{
          position: 'absolute',
          left: 9,
          top: goalTop,
          backgroundColor: goalColor,
          color: onGoalColor,
          borderRadius: 6,
          paddingHorizontal: 6,
        }}
      >
        Goal
      </Text>
      { state === 'premarket' &&
        <Text
          variant="labelSmall"
          style={{
            position: 'absolute',
            left: 0,
            top: nowTop,
            backgroundColor: colors.primary,
            color: colors.onPrimary,
            borderRadius: 6,
            paddingHorizontal: 6,
          }}
        >Now</Text>
      }
    </View>
  );
};

function CurrentPriceValue({
  currentPrice,
  colors,
  fonts,
}: {
  currentPrice: number;
  colors: MD3Colors;
  fonts: MD3Typescale;
}) {
  if (currentPrice === 0) {
    return (
      <Text variant="headlineSmall" style={{ color: colors.onBackground }}>
        $0.00
      </Text>
    );
  }
  if (currentPrice >= 1) {
    const formattedPrice = formatMax5Significant(currentPrice);
    return (
      <Text variant="headlineSmall" style={{ color: colors.onBackground }}>
        ${formattedPrice}
      </Text>
    );
  }
  const { zeros, val } = convertNumberWithNull(currentPrice);
  if (zeros < 3) {
    return (
      <Text variant="headlineSmall" style={{ color: colors.onBackground }}>
        ${currentPrice}
      </Text>
    );
  }
  return (
    <View style={{ flexDirection: "row" }}>
      <Text variant="headlineSmall" style={{ color: colors.onBackground }}>
        $0.0
      </Text>
      <Text
        variant="labelMedium"
        style={{
          color: colors.onBackground,
          transform: [
            { translateY: ((fonts.headlineSmall.fontSize as number) * 5) / 6 },
          ],
        }}
      >
        {zeros}
      </Text>
      <Text variant="headlineSmall" style={{ color: colors.onBackground }}>
        {val}
      </Text>
    </View>
  );
}

function formatMax5Significant(n: number): string {
  if (n > 1000000) {
    return n.toPrecision()
  }
  return n.toString()
}


function convertNumberWithNull(num: number): { zeros: number; val: number } {
  if (num === 0) return { zeros: 0, val: 0 };
  const str = num.toExponential();
  const match = str.match(/^([\d.]+)e-(\d+)$/);
  if (match) {
    const digits = match[1].replace('.', '');
    const zeros = parseInt(match[2], 10) - (digits.length - 1);
    return { zeros, val: parseInt(digits) };
  }
  const decimalStr = num.toString().split('.')[1] || '';
  const leadingZeros = decimalStr.match(/^0*/)?.[0].length || 0;
  const rest = decimalStr.slice(leadingZeros);
  return { zeros: leadingZeros, val: parseInt(rest) };
}



function findPointBySol(points: BondingCurvePointWithCoordinate[], solLamp: BN) {
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (p.sol_lamp.gte(solLamp)) return p;
  }
  return points[points.length - 1];
}

function findPointByPercent(points: BondingCurvePointWithCoordinate[], percent: number) {
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (p.persent >= percent) return p;
  }
  return points[points.length - 1];
}