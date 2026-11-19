import 'dotenv/config'
import express from 'express'
import { env } from './env.js'
import { auth } from './auth.js'
import { requireAuth } from './require-auth.js'
import { notes } from './notes.js'
import { ApiError, handleError } from './errors.js'

const app = express()
app.use(express.json({ limit: '128kb' }))
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', auth)
app.use('/api/notes', requireAuth, notes)
app.use((_req, _res, next) => next(new ApiError(404, 'Route not found')))
app.use(handleError)

app.listen(env.port)
