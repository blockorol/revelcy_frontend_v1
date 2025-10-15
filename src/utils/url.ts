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

export function normalizeTelegramUrl(input: string) {
    if (!input) return '';
    
    input = input.toLowerCase().trim();
    
    // If already has https://t.me/ prefix, return as is
    if (input.startsWith('https://t.me/')) {
        return input;
    }
    
    // If has t.me/ prefix, add https://
    if (input.startsWith('t.me/')) {
        return `https://${input}`;
    }
    
    // If has other https:// or http:// prefix, extract username and convert to t.me
    if (input.startsWith('https://') || input.startsWith('http://')) {
        const url = input.replace(/^https?:\/\//, '');
        const username = url.split('/')[0] === 't.me' ? url.split('/').slice(1).join('/') : url.split('/').pop() || '';
        return `https://t.me/${username}`;
    }
    
    // For plain text, add https://t.me/ prefix
    return `https://t.me/${input}`;
}

export function normalizeTwitterUrl(input: string) {
    if (!input) return '';
    
    input = input.toLowerCase().trim();
    
    // If already has x.com/ prefix, return as is
    if (input.startsWith('x.com/')) {
        return input;
    }
    
    // If has https://x.com/ prefix, return as is
    if (input.startsWith('https://x.com/')) {
        return input;
    }
    
    // If has https:// or http:// prefix, extract username and convert to x.com
    if (input.startsWith('https://') || input.startsWith('http://')) {
        const url = input.replace(/^https?:\/\//, '');
        const username = url.split('/')[0] === 'x.com' ? url.split('/').slice(1).join('/') : url.split('/').pop() || '';
        return `x.com/${username}`;
    }
    
    // For plain text, add x.com/ prefix
    return `x.com/${input}`;
}

export function normalizeWebsiteUrl(input: string) {
    if (!input) return '';
    
    input = input.toLowerCase().trim();
    
    // If already has https:// prefix, return as is
    if (input.startsWith('https://')) {
        return input;
    }
    
    // If has http:// prefix, convert to https://
    if (input.startsWith('http://')) {
        return input.replace('http://', 'https://');
    }
    
    // If has www. prefix, add https://
    if (input.startsWith('www.')) {
        return `https://${input}`;
    }
    
    // For plain text, add https:// prefix
    return `https://${input}`;
}
  