# Note Taking App

A private notes app with React, Express, and Supabase Postgres.

## Run locally

1. Install Node.js 22.12 or later and npm.
2. Create a Supabase project with its Data API enabled. Open the SQL Editor and run [server/sql/schema.sql](server/sql/schema.sql).
3. Copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env`. Set the server variables below.
4. Start the API from one terminal.

   ```sh
   cd server
   npm ci
   npm run dev
   ```

5. Start the frontend from a second terminal.

   ```sh
   cd client
   npm ci
   npm run dev
   ```

6. Open the URL printed by Vite, usually `http://localhost:5173`.

| File | Variable | Value |
| --- | --- | --- |
| server/.env | SUPABASE_URL | Supabase project URL |
| server/.env | SUPABASE_SERVICE_ROLE_KEY | Supabase service-role key. Keep it on the server. |
| server/.env | JWT_SECRET | Random secret with at least 32 characters |
| server/.env | PORT | Optional. Defaults to 3000. |
| client/.env | VITE_API_BASE_URL | Defaults to `/api`. This value is public. |

Generate a JWT secret with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.

Vite proxies `/api` to port 3000. If you change the API port, update `client/vite.config.ts`. Run `npm run build` in each folder to produce the production builds. To host the built client, use a React Router history fallback and forward `/api` to Express on the same origin.

## API

Send JSON request bodies with `Content-Type: application/json`. Send `Authorization: Bearer <token>` with protected requests.

| Method | Path | Body | Success |
| --- | --- | --- | --- |
| GET | `/api/health` | | 200, `{ status }` |
| POST | `/api/auth/signup` | `{ email, password }` | 201, `{ token, user }` |
| POST | `/api/auth/login` | `{ email, password }` | 200, `{ token, user }` |
| GET | `/api/auth/me` | | 200, `{ user }` |
| GET | `/api/notes` | | 200, `{ notes }` |
| POST | `/api/notes` | `{ title, content? }` | 201, `{ note }` |
| GET | `/api/notes/:id` | | 200, `{ note }` |
| PUT | `/api/notes/:id` | `{ title, content? }` | 200, `{ note }` |
| DELETE | `/api/notes/:id` | | 204 |

Emails are trimmed and lowercased. Passwords must be at least eight characters and at most 72 UTF-8 bytes, bcrypt's input limit. Note IDs are UUIDs. Titles are trimmed and must contain 1–120 characters. Content is limited to 10,000 characters and defaults to an empty string. PUT replaces both editable fields.

Errors use `{ "message": "..." }`. Common statuses are 400 for invalid input, 401 for missing or invalid credentials, 404 for missing or inaccessible notes, 409 for duplicate email, and 500 for unexpected failures.

## Ownership and sessions

Express verifies the JWT signature and uses its subject as the user ID. Creation sets `notes.user_id` from that subject. Listing filters by `user_id`. Single-note reads, updates, and deletes match both the owner and note ID in the database query and return 404 if no row matches. The foreign key enforces ownership at the database level and cascades note deletion when a user row is deleted.

The SQL enables row-level security and revokes table access for browser-facing roles. Express uses the server-side service role, and API responses omit password hashes. The client stores the one-day JWT in local storage, sends it with protected requests, and clears it on logout or a 401 for that session.

## Verify with two users

1. Sign up as user A and create a note. The edit URL includes the note ID.
2. In Supabase's SQL Editor, verify the note's `user_id` matches A's `users.id`.
3. Log out, sign up as user B, and confirm B's dashboard is empty.
4. With B's bearer token, send GET, PUT with a valid note body, and DELETE to `/api/notes/<A-note-id>`. Each should return 404. Repeat without a token and expect 401.
5. Log back in as A. Open the original note, edit it, reload to check persistence, and delete it. The dashboard should show “No notes yet.”

## Deploy on Vercel

Import the repository as a multi-service project with its root at the repository root. The root `vercel.json` routes `/api` requests to Express and sends other requests to Vite. React Router URLs open directly through the client fallback.

Run the schema in Supabase and set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `JWT_SECRET` in the Vercel project environment for the server. Keep the frontend API base at its default `/api`.

Run `vercel dev` from the repository root to exercise the two services together. After deploying, open `/login` and check that `/api/health` returns JSON before testing signup and notes.
