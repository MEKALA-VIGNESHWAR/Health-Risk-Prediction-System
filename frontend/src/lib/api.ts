/**
 * Thin fetch wrapper around the existing Spring backend.
 *
 * Contract preserved from the legacy frontend:
 *   - API base is "/api" (same origin as the served SPA in prod).
 *   - The auth token lives INSIDE the `currentUser` object in localStorage
 *     (key: "currentUser", field: `token`) and is sent as `Bearer <token>`.
 * This keeps us 100% compatible with the deployed backend & login flow.
 */

export const API_BASE: string = import.meta.env.VITE_API_BASE || '/api'

const USER_KEY = 'currentUser'

export interface StoredUser {
  userId: string
  username: string
  email?: string
  firstName?: string
  lastName?: string
  role: string // 'patient' | 'doctor' | 'admin' (lowercased on store)
  token: string
  avatarUrl?: string | null
  message?: string
}

export function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredUser
  } catch {
    return null
  }
}

export function setStoredUser(user: StoredUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearStoredUser(): void {
  localStorage.removeItem(USER_KEY)
}

export function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...extra }
  const user = getStoredUser()
  if (user?.token) headers['Authorization'] = `Bearer ${user.token}`
  return headers
}

export class ApiError extends Error {
  status: number
  body: unknown
  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

async function parse(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/** Core JSON request helper. Throws ApiError on non-2xx. */
export async function request<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers as Record<string, string>) },
  })
  const body = await parse(res)
  if (!res.ok) {
    const message =
      (body && typeof body === 'object' && 'message' in body
        ? String((body as Record<string, unknown>).message)
        : typeof body === 'string' && body
          ? body
          : `Request failed (${res.status})`) || `Request failed (${res.status})`
    throw new ApiError(message, res.status, body)
  }
  return body as T
}

export const api = {
  get: <T = unknown>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T = unknown>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: data != null ? JSON.stringify(data) : undefined }),
  put: <T = unknown>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PUT', body: data != null ? JSON.stringify(data) : undefined }),
  del: <T = unknown>(path: string) => request<T>(path, { method: 'DELETE' }),
}
