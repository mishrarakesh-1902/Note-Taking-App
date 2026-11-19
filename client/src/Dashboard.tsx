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
      <ul className="notes">
        {notes.map(note => (
          <li className="note" key={note.id}>
            <h2>{note.title}</h2>
            <p className="note-content">{note.content}</p>
            <div className="note-actions">
              <Link to={'/notes/' + note.id + '/edit'}>Edit</Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
