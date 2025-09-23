import { API_HOST } from "env";

// api/http.ts
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
  retry?: number;
};

function buildUrl(url: string, query?: RequestOptions["query"]) {
  if (!query) return url;
  const u = new URL(url, typeof window !== "undefined" ? window.location.origin : "https://dummy.local");
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null) u.searchParams.set(k, String(v));
  });
  return u.toString().replace(u.origin, "");
}

let refreshing: Promise<boolean> | null = null;
async function tryRefreshToken(): Promise<boolean> {
  if (!refreshing) {
    refreshing = (async () => {
      try {
        // todo: fix me to correct api
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
  const resp = await fetch(target, { method, headers: finalHeaders, body: finalBody, signal });

  // auto-refresh for 401
  if (resp.status === 401 && _internalRetry) {
    const ok = await tryRefreshToken();
    if (ok) return request<T>(url, opts, /* _internalRetry */ false);
  }

  if (!resp.ok && resp.status >= 500 && retry > 0) {
    await new Promise(r => setTimeout(r, 200 * (opts.retry! - retry + 1)));
    return request<T>(url, { ...opts, retry: retry - 1 }, _internalRetry);
  }

  if (!resp.ok) {
    let errBody: any = null;
    try { errBody = await resp.clone().json(); } catch { /* ignore */ }
    const msg = `HTTP ${resp.status} ${resp.statusText}`;
    const e = new Error(errBody?.message ?? msg) as Error & { status?: number; details?: any };
    e.status = resp.status; e.details = errBody ?? (await resp.text().catch(() => undefined));
    throw e;
  }

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
