// src/lib/http.ts
type RetryOpts = {
  retries?: number;
  baseDelayMs?: number; // backoff base
  maxDelayMs?: number;
  onRetry?: (info: { attempt: number; status?: number; err?: any }) => void;
};

/**
 * fetchWithRetry: reintentos con backoff exponencial + jitter.
 * Respeta Retry-After (segundos) si el server lo envía (p.ej., 429).
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  opts: RetryOpts = {},
): Promise<Response> {
  const {
    retries = 5,
    baseDelayMs = 400,
    maxDelayMs = 5000,
    onRetry,
  } = opts;

  let attempt = 0;
  let lastErr: any;

  // Jitter aleatorio para evitar sincronización.
  const sleep = (ms: number) =>
    new Promise((res) => setTimeout(res, ms + Math.random() * 100));

  while (attempt <= retries) {
    try {
      const res = await fetch(input as any, init);
      if (res.ok) return res;

      // 429 o 5xx -> reintentar
      if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
        attempt += 1;
        if (attempt > retries) return res;

        // Respeta Retry-After si existe
        const retryAfter = res.headers.get("Retry-After");
        let delay =
          retryAfter && !Number.isNaN(Number(retryAfter))
            ? Number(retryAfter) * 1000
            : Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));

        onRetry?.({ attempt, status: res.status });
        await sleep(delay);
        continue;
      }

      // Otros errores no son reintentos
      return res;
    } catch (err) {
      // Errores de red -> reintentar
      lastErr = err;
      attempt += 1;
      if (attempt > retries) throw err;
      const delay = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
      onRetry?.({ attempt, err });
      await sleep(delay);
    }
  }

  // Si salimos del bucle por alguna razón
  if (lastErr) throw lastErr;
  throw new Error("fetchWithRetry: agotados los reintentos");
}
