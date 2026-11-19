import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthForm } from './AuthForm'
import { AuthProvider, RequireAuth, useAuth } from './auth'
import { Dashboard } from './Dashboard'
import { NoteForm } from './NoteForm'

function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const { token, signIn } = useAuth()
  return token ? <Navigate to="/" replace /> : <AuthForm mode={mode} onSession={signIn} />
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/signup" element={<AuthPage key="signup" mode="signup" />} />
        <Route path="/login" element={<AuthPage key="login" mode="login" />} />
        <Route element={<RequireAuth />}>
          <Route index element={<Dashboard />} />
          <Route path="notes/new" element={<NoteForm key="new" />} />
          <Route path="notes/:id/edit" element={<NoteForm />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>,
)
