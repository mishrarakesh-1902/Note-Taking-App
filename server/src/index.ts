import 'dotenv/config'
import express from 'express'
import { env } from './env.js'
import { auth } from './auth.js'
import { ApiError } from './errors.js'

const app = express()
app.use(express.json({ limit: '128kb' }))
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', auth)
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof ApiError) {
    res.status(error.status).json({ message: error.message })
    return
  }
  res.status(500).json({ message: 'Something went wrong' })
})

app.listen(env.port)
