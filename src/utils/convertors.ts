export function normalizeStringDecimalInput (text: string): string {
  let sanitized = text.replace(',', '.');

  sanitized = sanitized.replace(/[^0-9.]/g, '');

  const parts = sanitized.split('.');
  if (parts.length > 2) {
    sanitized = parts[0] + '.' + parts.slice(1).join('');
  }

  return sanitized;
};

export function convertStringToDecimalInput (text: string): number {
    const sanitizedValue = normalizeStringDecimalInput(text)
    if (sanitizedValue === "") {
        return 0
    }
    return parseFloat(sanitizedValue)
}
