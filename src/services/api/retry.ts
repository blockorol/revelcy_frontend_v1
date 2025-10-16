// retry.ts
export type RetryOpts = {
  masterRetry?: boolean;  // skip error code checker - return if not 2xx
  retries?: number;       // retries count
  timeoutMs?: number;     // request timeout 
  minDelayMs?: number;    // first delay
  maxDelayMs?: number;    // maxDelay
  factor?: number;        // e factor
  jitter?: boolean;       // with random jitter
  isRetryable?: (res?: Response, err?: unknown) => boolean;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function backoffDelay(attempt: number, {
  minDelayMs = 400,
  maxDelayMs = 4000,
  factor = 2,
  jitter = true,
}: RetryOpts = {}) {
  const base = Math.min(maxDelayMs!, minDelayMs! * Math.pow(factor!, attempt));
  if (!jitter) return base;
  const rand = base * 0.4 * Math.random(); // ±40% jitter
  return Math.max(0, base - rand);
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs = 15000): Promise<T> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    return await promise;
  } finally {
    clearTimeout(t);
  }
}

export async function withRetry<T>(
  task: (attempt: number) => Promise<T>,
  opts: RetryOpts = {},
): Promise<T> {
  const {
    retries = 3,
    timeoutMs = 15000,
    isRetryable = (res?: Response, err?: unknown) => {

      if (err) return true; // net/abourt/etc - retry
      if (!res) return false;
      const { status } = res;
      
      if (opts.masterRetry) {
        return status >= 399
      }

      if (status === 408 || status === 425 || status === 429) return true;
      if (status >= 500) return true;
      return false; // 4xx (кроме указанных) — не ретраим
    },
  } = opts;

  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await withTimeout(task(attempt), timeoutMs);
      // if task with respone it should be checked here
      // Успешно:
      // @ts-ignore
      return res;
    } catch (err) {
      lastErr = err;
      // Ошибка внутри task — считаем retryable и ждём
      if (attempt === retries) break;
      await sleep(backoffDelay(attempt, opts));
    }
  }
  throw lastErr;
}
