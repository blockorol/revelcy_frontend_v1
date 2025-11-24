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
  