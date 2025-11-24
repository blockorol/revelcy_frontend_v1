export function linearOffset(x: number, MinValue: number, MaxValue: number, MaxOffset: number) {
  return MaxOffset * (MaxValue - x) / (MaxValue - MinValue);
}

export function linearOffsetReverse(
  x: number,
  MinValue: number,
  MaxValue: number,
  MaxOffset: number
): number {
  if (x <= MinValue) return 0;
  if (x >= MaxValue) return MaxOffset;

  return MaxOffset * (x - MinValue) / (MaxValue - MinValue);
}
