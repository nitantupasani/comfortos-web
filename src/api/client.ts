const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

if (BASE.includes('localhost') && window.location.protocol === 'https:') {
  console.warn('[ComfortOS] API base URL points to localhost but site is served over HTTPS. Set VITE_API_BASE_URL to your production API.');
}

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...options, headers });
  } catch (err) {
    // Network-level failure: CORS, DNS, offline, mixed-content, etc.
    const url = `${BASE}${path}`;
    console.error(`[ComfortOS] Network error fetching ${url}`, err);
    throw new ApiError(0, `Cannot reach server (${BASE}). Check your connection.`);
  }

  if (res.status === 204) return null as T;
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.detail ?? res.statusText);
  }
  return res.json();
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
