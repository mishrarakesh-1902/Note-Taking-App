import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from './api'
import { useAuth } from './auth'

import type { Note } from './notes'

export function NoteForm() {
  const { id } = useParams()
  return <Editor key={id ?? 'new'} id={id} />
}

function Editor({ id }: { id?: string }) {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [loading, setLoading] = useState(Boolean(id))
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!id || !token) return
    const controller = new AbortController()
    api<{ note: Note }>('/notes/' + id, { signal: controller.signal }, token)
      .then(({ note }) => {
        setTitle(note.title)
        setContent(note.content)
      })
      .catch(failure => { if (!controller.signal.aborted) setLoadError(failure.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [id, token])

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
      await api(id ? '/notes/' + id : '/notes', {
        method: id ? 'PUT' : 'POST', body: JSON.stringify({ title: title.trim(), content }),
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
      <h1>{id ? 'Edit note' : 'New note'}</h1>
      {loading && <p role="status">Loading note…</p>}
      {loadError && <p role="alert" className="error">{loadError}</p>}
      {!loading && !loadError && <form onSubmit={submit}>
        <label htmlFor="title">Title</label>
        <input id="title" value={title} maxLength={120} onChange={event => setTitle(event.target.value)} />
        <label htmlFor="content">Content</label>
        <textarea id="content" value={content} maxLength={10000} rows={10}
          onChange={event => setContent(event.target.value)} />
        {error && <p className="error" role="alert">{error}</p>}
        <button disabled={saving}>{saving ? 'Saving…' : 'Save note'}</button>
      </form>}
    </main>
  )
}
