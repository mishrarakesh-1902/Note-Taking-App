import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from './api'
import { useAuth } from './auth'
import type { Note } from './notes'

export function Dashboard() {
  const { token, user, signOut } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return
    const controller = new AbortController()
    api<{ notes: Note[] }>('/notes', { signal: controller.signal }, token)
      .then(result => setNotes(result.notes))
      .catch(failure => { if (!controller.signal.aborted) setError(failure.message) })
    return () => controller.abort()
  }, [token])

  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')

  async function deleteNote(note: Note) {
    if (!token || deleting || !window.confirm('Delete this note?')) return
    setDeleting(note.id)
    setDeleteError('')
    try {
      await api<void>('/notes/' + note.id, { method: 'DELETE' }, token)
      setNotes(current => current.filter(item => item.id !== note.id))
    } catch (failure) {
      setDeleteError(failure instanceof Error ? failure.message : 'Could not delete the note.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <main className="dashboard">
      <header className="page-header">
        <div>
          <h1>Your notes</h1>
          {user && <p className="muted">{user.email}</p>}
        </div>
        <button className="secondary" onClick={signOut}>Log out</button>
      </header>
      <div className="toolbar"><Link className="button" to="/notes/new">New note</Link></div>
      {error && <p className="error" role="alert">{error}</p>}
      {deleteError && <p className="error" role="alert">{deleteError}</p>}
      <ul className="notes">
        {notes.map(note => (
          <li className="note" key={note.id}>
            <h2>{note.title}</h2>
            <p className="note-content">{note.content}</p>
            <div className="note-actions">
              <Link to={'/notes/' + note.id + '/edit'}>Edit</Link>
              <button className="danger" disabled={Boolean(deleting)} onClick={() => void deleteNote(note)}>
                {deleting === note.id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
