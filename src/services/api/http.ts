// api/http.ts
import { API_HOST } from "env";

let currentToken: string | undefined;
export function setAuthToken(token?: string) { currentToken = token; }

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type RequestOptions = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined | null>;
  json?: unknown;
  body?: BodyInit | null;
  signal?: AbortSignal;
  /** количество ретраев (сколько ДОП. попыток после первой) */
  retry?: number;
};

function buildUrl(url: string, query?: RequestOptions["query"]) {
  if (!query) return url;
  const isAbsolute = /^[a-z][a-z0-9+.-]*:\/\//i.test(url);
  const u = new URL(url, typeof window !== "undefined" ? window.location.origin : "https://dummy.local");
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null) u.searchParams.set(k, String(v));
  });
  if (isAbsolute) {
    return u.toString();
  }
  return `${u.pathname}${u.search}${u.hash}`;
}

let refreshing: Promise<boolean> | null = null;
async function tryRefreshToken(): Promise<boolean> {
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const resp = await fetch(`${API_HOST}/auth/refresh`, { method: "POST", credentials: "include" });
        if (!resp.ok) return false;
        const data = await resp.json() as { accessToken: string };
        setAuthToken(data.accessToken);
        return true;
      } catch {
        return false;
      } finally {
        await new Promise(r => setTimeout(r, 0));
        refreshing = null;
      }
    })();
  }
  return refreshing;
}

type RetryConfig = {
  timeoutMs: number;          
  minDelayMs: number;         
  maxDelayMs: number;         
  factor: number;
  jitter: boolean;           
  isRetryable: (status: number | null, err?: unknown) => boolean;
};
const HTTP_RETRY: RetryConfig = {
  timeoutMs: 20_000,
  minDelayMs: 400,
  maxDelayMs: 5_000,
  factor: 3,
  jitter: true,
  isRetryable: (status, err) => {
    if (err) return true;
    if (status == null) return false;
    if (status === 408 || status === 425 || status === 429) return true;
    if (status >= 500) return true;
    return false; 
  },
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
function backoffDelay(attempt: number) {
  const base = Math.min(HTTP_RETRY.maxDelayMs, HTTP_RETRY.minDelayMs * Math.pow(HTTP_RETRY.factor, attempt));
  if (!HTTP_RETRY.jitter) return base;
  const rand = base * 0.4 * Math.random();
  return Math.max(0, base - rand);
}
async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs: number, extSignal?: AbortSignal) {
  const ac = new AbortController();
  const onAbort = () => ac.abort();
  if (extSignal) {
    if (extSignal.aborted) ac.abort();
    else extSignal.addEventListener("abort", onAbort, { once: true });
  }
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: ac.signal });
  } finally {
    clearTimeout(t);
    extSignal?.removeEventListener("abort", onAbort);
  }
}

export async function request<T = unknown>(url: string, opts: RequestOptions = {}, _internalRetry = true): Promise<T> {
  const { method = "GET", headers = {}, json, body, query, signal, retry = 0 } = opts;

  const finalHeaders = new Headers(headers);
  if (currentToken) finalHeaders.set("Authorization", `Bearer ${currentToken}`);

  let finalBody: BodyInit | null = body ?? null;
  if (json !== undefined) {
    // default content type - JSON
    if (!finalHeaders.has("Content-Type")) finalHeaders.set("Content-Type", "application/json");
    finalBody = JSON.stringify(json);
  }

  const target = buildUrl(url, query);

  let lastError: unknown;
  const attempts = retry + 1;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const resp = await fetchWithTimeout(
        target,
        { method, headers: finalHeaders, body: finalBody, signal },
        HTTP_RETRY.timeoutMs,
        signal
      );

      if (resp.status === 401 && _internalRetry) {
        const ok = await tryRefreshToken();
        if (ok) {
          const nextHeaders = new Headers(headers);
          if (currentToken) nextHeaders.set("Authorization", `Bearer ${currentToken}`);
          const next = await fetchWithTimeout(
            target,
            { method, headers: nextHeaders, body: finalBody, signal },
            HTTP_RETRY.timeoutMs,
            signal
          );
          if (!next.ok) {
            if (HTTP_RETRY.isRetryable(next.status)) {
              if (attempt < attempts - 1) await sleep(backoffDelay(attempt));
              else return await throwHttp(next);
              continue;
            } else {
              return await throwHttp(next);
            }
          }
          return await parseResponse<T>(next);
        }
      }

      if (!resp.ok) {
        if (HTTP_RETRY.isRetryable(resp.status)) {
          if (attempt < attempts - 1) {
            await sleep(backoffDelay(attempt));
            continue;
          }
          return await throwHttp(resp);
        }
        return await throwHttp(resp);
      }
      return await parseResponse<T>(resp);
    } catch (err) {
      lastError = err;
      if (HTTP_RETRY.isRetryable(null, err)) {
        if (attempt < attempts - 1) {
          await sleep(backoffDelay(attempt));
          continue;
        }
      }
      throw err;
    }
  }
  throw lastError;
}

async function throwHttp(resp: Response): Promise<never> {
  let errBody: any = null;
  try { errBody = await resp.clone().json(); } catch { /* ignore */ }
  const msg = `HTTP ${resp.status} ${resp.statusText}`;
  const e = new Error(errBody?.message ?? msg) as Error & { status?: number; details?: any };
  e.status = resp.status;
  e.details = errBody ?? (await resp.text().catch(() => undefined));
  throw e;
}

async function parseResponse<T>(resp: Response): Promise<T> {
  if (resp.status === 204) return undefined as unknown as T;
  const ctype = resp.headers.get("Content-Type") || "";
  if (ctype.includes("application/json")) return resp.json() as Promise<T>;
  if (ctype.startsWith("text/")) return resp.text() as unknown as T;
  return resp.blob() as unknown as T;
}

export const http = {
  get:  <T>(url: string, opts?: Omit<RequestOptions, "method" | "json" | "body">) =>
    request<T>(url, { ...opts, method: "GET" }),
  del:  <T>(url: string, opts?: Omit<RequestOptions, "method">) =>
    request<T>(url, { ...opts, method: "DELETE" }),
  post: <T>(url: string, opts?: Omit<RequestOptions, "method">) =>
    request<T>(url, { ...opts, method: "POST" }),
  put:  <T>(url: string, opts?: Omit<RequestOptions, "method">) =>
    request<T>(url, { ...opts, method: "PUT" }),
  patch:<T>(url: string, opts?: Omit<RequestOptions, "method">) =>
    request<T>(url, { ...opts, method: "PATCH" }),
};
