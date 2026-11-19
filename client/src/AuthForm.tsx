import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from './api'
import type { Session } from './api'

export function AuthForm({ mode, onSession }: {
  mode: 'signup' | 'login'
  onSession?: (session: Session) => void
}) {
  const signup = mode === 'signup'
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields: typeof errors = {}
    const address = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address) || address.length > 254) {
      fields.email = 'Enter a valid email address.'
    }
    if (password.length < 8) fields.password = 'Use at least 8 characters.'
    if (new TextEncoder().encode(password).length > 72) fields.password = 'Use at most 72 bytes.'
    setErrors(fields)
    setError('')
    if (fields.email || fields.password) return

    setPending(true)
    try {
      const session = await api<Session>('/auth/' + mode, {
        method: 'POST', body: JSON.stringify({ email: address, password }),
      })
      if (onSession) onSession(session)
      else localStorage.setItem('notes.token', session.token)
      navigate('/', { replace: true })
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="auth">
      <h1>{signup ? 'Create an account' : 'Log in'}</h1>
      <form noValidate onSubmit={submit}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" value={email}
          aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined}
          onChange={event => setEmail(event.target.value)} />
        {errors.email && <p id="email-error" className="error">{errors.email}</p>}
        <label htmlFor="password">Password</label>
        <input id="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'}
          value={password} aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? 'password-error' : undefined}
          onChange={event => setPassword(event.target.value)} />
        {errors.password && <p id="password-error" className="error">{errors.password}</p>}
        {error && <p role="alert" className="error">{error}</p>}
        <button disabled={pending}>{pending ? 'Please wait…' : signup ? 'Sign up' : 'Log in'}</button>
      </form>
      {signup ? <p>Already registered? <Link to="/login">Log in</Link></p>
        : <p>New here? <Link to="/signup">Create an account</Link></p>}
    </main>
  )
}
