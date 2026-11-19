import { z } from 'zod'

const parsed = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  SUPABASE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(32),
}).safeParse(process.env)

if (!parsed.success) {
  const fields = parsed.error.issues.map(issue => issue.path.join('.'))
  throw new Error('Check server environment variables: ' + fields.join(', '))
}

export const env = {
  port: parsed.data.PORT,
  supabaseUrl: parsed.data.SUPABASE_URL,
  serviceRoleKey: parsed.data.SUPABASE_SERVICE_ROLE_KEY,
  jwtSecret: parsed.data.JWT_SECRET,
}
