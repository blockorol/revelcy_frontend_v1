const HTTP_STARTS = "http://"
const HTTPS_STARTS = "https://"

export default function normalizeUrl(input: string) {
    input = input.toLowerCase().trim();
    if (input.startsWith(HTTP_STARTS) || input.startsWith(HTTPS_STARTS)) {
      return input;
    }
    if (HTTP_STARTS.startsWith(input)) {
        return input
    }
    if (HTTPS_STARTS.startsWith(input)) {
        return input
    }
    return `https://${input}`;
}
  
/**
 * Makes a strict short-link path segment.
 * Allowed chars: A-Z a-z 0-9 _ -
 * Disallows any path levels: returns a single segment only.
 *
 * Examples:
 *  "hello/world"        -> "world"
 *  "../admin"           -> "admin"
 *  " my cool slug!! "   -> "mycoolslug"
 *  "a/b/c"              -> "c"
 *  "русский-текст"      -> ""   (non-latin removed)
 */
export function sanitizeShortPath(text: string): string {
  if (!text) return "";

  // Normalize & trim first
  const raw = String(text).trim();

  // Split by any slash/backslash to prevent "levels"
  const parts = raw.split(/[\\/]+/).filter(Boolean);

  // Take the last "segment" only (so "a/b/c" -> use "c")
  const last = (parts.length ? parts[parts.length - 1] : raw).trim();

  // Remove everything except [A-Za-z0-9_-]
  const cleaned = last.replace(/[^A-Za-z0-9_-]+/g, "");

  return cleaned;
}
