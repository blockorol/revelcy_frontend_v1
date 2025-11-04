export function makeTransparent(hex: string, alphaFactor: number): string {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (clean.length === 6) {
    clean += 'FF';
  }
  if (clean.length !== 8) {
    throw new Error('Invalid hex color format');
  }
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const a = parseInt(clean.substring(6, 8), 16) / 255;
  const newA = Math.min(1, Math.max(0, a * (1 - alphaFactor)));
  return `rgba(${r}, ${g}, ${b}, ${newA.toFixed(3)})`;
}