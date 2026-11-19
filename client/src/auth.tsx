import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { api } from './api'
import type { Session, User } from './api'

const storageKey = 'notes.token'
const AuthContext = createContext<{
  token: string | null
  user: User | null
  signIn: (session: Session) => void
  signOut: () => void
} | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem(storageKey))
  const [user, setUser] = useState<User | null>(null)

  function signIn(session: Session) {
    localStorage.setItem(storageKey, session.token)
    setToken(session.token)
    setUser(session.user)
  }

  function signOut() {
    localStorage.removeItem(storageKey)
    setToken(null)
    setUser(null)
  }

  useEffect(() => {
    function unauthorized(event: Event) {
      if ((event as CustomEvent<string>).detail === localStorage.getItem(storageKey)) signOut()
    }
    window.addEventListener('notes:unauthorized', unauthorized)
    return () => window.removeEventListener('notes:unauthorized', unauthorized)
  }, [])

  useEffect(() => {
    if (!token) return
    const controller = new AbortController()
    api<{ user: User }>('/auth/me', { signal: controller.signal }, token)
      .then(({ user }) => { if (!controller.signal.aborted) setUser(user) })
      .catch(() => { /* Protected requests handle unauthorized sessions. */ })
    return () => controller.abort()
  }, [token])

  return (
    <AuthContext.Provider value={{ token, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('AuthProvider is missing')
  return auth
}

export function RequireAuth() {
  const { token } = useAuth()
  return token ? <Outlet /> : <Navigate to="/login" replace />
}
