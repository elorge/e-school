// web/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const TOKEN_STORAGE_KEY = 'eschools_access_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null; // SSR/build has no localStorage
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public params?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    let message = body;
    let code: string | undefined;
    let params: Record<string, unknown> | undefined;
    try {
      const parsed = JSON.parse(body);
      message = parsed.message ?? body;
      code = typeof parsed.code === 'string' ? parsed.code : undefined;
      params = parsed.params && typeof parsed.params === 'object' ? parsed.params : undefined;
    } catch {
      // body wasn't JSON — use as-is
    }
    throw new ApiError(res.status, typeof message === 'string' ? message : JSON.stringify(message), code, params);
  }

  // 204/empty responses (e.g. some DELETEs) have no body to parse
  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as T);
}