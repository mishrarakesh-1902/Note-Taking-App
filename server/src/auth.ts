import bcrypt from 'bcrypt'
import { Router } from 'express'
import { z } from 'zod'
import { db } from './db.js'
import { ApiError, parse } from './errors.js'
import { requireAuth } from './require-auth.js'
import { issueToken } from './token.js'

export const auth = Router()
const fields = 'id,email,created_at'
const credentials = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  password: z.string().min(8).refine(value => Buffer.byteLength(value) <= 72, {
    message: 'Password must be at most 72 bytes',
  }),
})

auth.post('/signup', async (req, res) => {
  const { email, password } = parse(credentials, req.body)
  const passwordHash = await bcrypt.hash(password, 12)
  const { data: user, error } = await db.from('users')
    .insert({ email, password_hash: passwordHash })
    .select(fields).single()

  if (error?.code === '23505') throw new ApiError(409, 'Email already registered')
  if (error) throw error
  res.status(201).json({ token: issueToken(user.id), user })
})

auth.post('/login', async (req, res) => {
  const { email, password } = parse(credentials, req.body)
  const { data, error } = await db.from('users')
    .select('id,email,created_at,password_hash').eq('email', email).maybeSingle()

  if (error) throw error
  if (!data || !await bcrypt.compare(password, data.password_hash)) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const user = { id: data.id, email: data.email, created_at: data.created_at }
  res.json({ token: issueToken(user.id), user })
})

auth.get('/me', requireAuth, async (req, res) => {
  const { data: user, error } = await db.from('users')
    .select(fields).eq('id', req.userId!).maybeSingle()

  if (error) throw error
  if (!user) throw new ApiError(401, 'Authentication required')
  res.json({ user })
})
