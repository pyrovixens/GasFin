// ==========================================
// GastFin - Resilient & Protected API Client
// ==========================================

export interface ApiRequestOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  cacheTtlMs?: number;
}

const memoryCache = new Map<string, { data: any; expiresAt: number }>();

/**
 * Executes a network request with timeout, caching, and graceful failure handling
 */
export const safeFetch = async <T = any>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<{ data: T | null; error: string | null; isCached?: boolean }> => {
  const { timeoutMs = 8000, retries = 1, cacheTtlMs = 0, ...fetchOptions } = options;

  // 1. Check cache
  if (cacheTtlMs > 0 && (!fetchOptions.method || fetchOptions.method === 'GET')) {
    const cached = memoryCache.get(url);
    if (cached && cached.expiresAt > Date.now()) {
      return { data: cached.data as T, error: null, isCached: true };
    }
  }

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          ...(fetchOptions.headers || {})
        }
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Store in cache
      if (cacheTtlMs > 0) {
        memoryCache.set(url, {
          data,
          expiresAt: Date.now() + cacheTtlMs
        });
      }

      return { data, error: null };
    } catch (err: any) {
      clearTimeout(timer);
      lastError = err;
      attempt += 1;
      if (attempt <= retries) {
        await new Promise(r => setTimeout(r, 600 * attempt));
      }
    }
  }

  return {
    data: null,
    error: lastError?.message || 'Network request failed'
  };
};
