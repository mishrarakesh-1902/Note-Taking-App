export interface User {
  id: string
  email: string
  created_at: string
}

export interface Session {
  token: string
  user: User
}

const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

export async function api<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', 'Bearer ' + token)

  const response = await fetch(baseUrl + path, { ...options, headers })
  if (!response.ok) {
    if (response.status === 401 && token) {
      window.dispatchEvent(new CustomEvent('notes:unauthorized', { detail: token }))
    }
    const error = await response.json().catch(() => null)
    throw new Error(error?.message || 'Request failed. Please try again.')
  }
  if (response.status === 204) return undefined as T
  return response.json()
}
