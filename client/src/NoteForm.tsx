import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from './api'
import { useAuth } from './auth'

export function NoteForm() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!title.trim()) {
      setError('Enter a title.')
      return
    }
    if (!token) return

    setSaving(true)
    try {
      await api('/notes', {
        method: 'POST', body: JSON.stringify({ title: title.trim(), content }),
      }, token)
      navigate('/')
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not save the note.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="editor">
      <Link to="/">Back to notes</Link>
      <h1>New note</h1>
      <form onSubmit={submit}>
        <label htmlFor="title">Title</label>
        <input id="title" value={title} maxLength={120} onChange={event => setTitle(event.target.value)} />
        <label htmlFor="content">Content</label>
        <textarea id="content" value={content} maxLength={10000} rows={10}
          onChange={event => setContent(event.target.value)} />
        {error && <p className="error" role="alert">{error}</p>}
        <button disabled={saving}>{saving ? 'Saving…' : 'Save note'}</button>
      </form>
    </main>
  )
}
