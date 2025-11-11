export function normalizeStringDecimalInput (text: string, postfix?: string ): string {
  let sanitized = postfix&&text.endsWith(postfix) ? text.slice(0, -postfix.length) : text
  sanitized = sanitized.replace(',', '.');

  sanitized = sanitized.replace(/[^0-9.]/g, '');

  const parts = sanitized.split('.');
  if (parts.length === 0) return ""
  if (parts.length === 1) return parts[0]
  return parts[0] + '.' + parts[1];
};

export function convertStringToDecimalInput (text: string, postfix?: string): {
  value:number,
  raw: string|undefined
} {
    const sanitizedValue = normalizeStringDecimalInput(text, postfix)
    if (sanitizedValue === "") {
        return {value:0, raw:undefined}
    }
    return {value:parseFloat(sanitizedValue), raw: sanitizedValue + (postfix??"")} 
}
