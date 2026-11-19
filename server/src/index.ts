import 'dotenv/config'
import express from 'express'
import { env } from './env.js'

const app = express()
app.use(express.json({ limit: '128kb' }))
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))


app.listen(env.port)
