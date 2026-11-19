import type { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { env } from './env.js'
import { ApiError } from './errors.js'

declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const unauthorized = new ApiError(401, 'Authentication required')
  const token = req.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1]
  if (!token) return next(unauthorized)

  try {
    const claims = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] })
    const subject = z.uuid().safeParse(typeof claims === 'string' ? undefined : claims.sub)
    if (!subject.success) return next(unauthorized)
    req.userId = subject.data
  } catch {
    return next(unauthorized)
  }
  next()
}
