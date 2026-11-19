import jwt from 'jsonwebtoken'
import { env } from './env.js'

export function issueToken(userId: string) {
  return jwt.sign({}, env.jwtSecret, {
    algorithm: 'HS256', subject: userId, expiresIn: '1d',
  })
}
