const HTTP_STARTS = "http://"
const HTTPS_STARTS = "https://"

export default function normalizeUrl(input: string) {
    input = input.toLocaleLowerCase()
    if (input.startsWith(HTTP_STARTS) || input.startsWith(HTTPS_STARTS)) {
        if (input === HTTP_STARTS || input === HTTPS_STARTS) {
            return ''
        }
      return input;
    }
    if (HTTP_STARTS.startsWith(input)) {
        return ''
    }
    if (HTTPS_STARTS.startsWith(input)) {
        return ''
    }
    return `https://${input}`;
  }
  