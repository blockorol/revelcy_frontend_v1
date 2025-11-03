/**
 * Converts hex color to rgba format with specified opacity.
 * Handles both 6-digit (#RRGGBB) and 8-digit (#RRGGBBAA) hex colors.
 * 
 * @param hex - Hex color string (with or without #)
 * @param alpha - Opacity value between 0 and 1
 * @returns rgba color string
 */
export function hexToRgba(hex: string, alpha = 1): string {
  const h = hex.replace("#", "");
  
  // Handle 8-digit hex (with alpha channel)
  if (h.length === 8) {
    const rr = parseInt(h.slice(0, 2), 16);
    const gg = parseInt(h.slice(2, 4), 16);
    const bb = parseInt(h.slice(4, 6), 16);
    return `rgba(${rr}, ${gg}, ${bb}, ${alpha})`;
  }
  
  // Handle 6-digit hex (no alpha channel)
  if (h.length === 6) {
    const rr = parseInt(h.slice(0, 2), 16);
    const gg = parseInt(h.slice(2, 4), 16);
    const bb = parseInt(h.slice(4, 6), 16);
    return `rgba(${rr}, ${gg}, ${bb}, ${alpha})`;
  }
  
  // Fallback for invalid hex
  return hex;
}

