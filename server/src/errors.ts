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
