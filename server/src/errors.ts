import type { ErrorRequestHandler } from 'express'
import { z } from 'zod'

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
  }
}

export function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input)
  if (result.success) return result.data

  const issue = result.error.issues[0]
  const field = issue.path.join('.')
  throw new ApiError(400, field ? field + ': ' + issue.message : issue.message)
}

export const handleError: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) return next(error)

  if (error instanceof ApiError) {
    res.status(error.status).json({ message: error.message })
    return
  }

  switch (error?.type) {
    case 'entity.parse.failed':
      res.status(400).json({ message: 'Invalid JSON body' })
      return
    case 'entity.too.large':
      res.status(413).json({ message: 'Request body is too large' })
      return
    default:
      res.status(500).json({ message: 'Something went wrong' })
  }
}
