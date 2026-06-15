# PingX Chat — Setup & Deployment

This covers running the app locally and deploying it on Replit. The repo is
a pnpm workspace with two runtime artifacts:

- `artifacts/api-server` — Express 5 + Socket.IO backend (REST API + real-time)
- `artifacts/pingx` — React/Vite frontend

Shared packages (`lib/db`, `lib/api-spec`, `lib/api-zod`, `lib/api-client-react`)
are consumed by both via pnpm workspace links.

## 1. Prerequisites

- Node.js 24
- pnpm (the repo's `preinstall` script enforces pnpm — npm/yarn will fail)
- A PostgreSQL database (local, Docker, or a hosted instance like Neon/Supabase/Replit's built-in Postgres)
- A Cloudinary account (free tier is fine) for avatar and chat-media uploads

## 2. Install dependencies

```bash
pnpm install
```

## 3. Database setup

1. Create a Postgres database and note its connection string.
2. Copy the env example and fill in `DATABASE_URL`:
   ```bash
   cp artifacts/api-server/.env.example artifacts/api-server/.env
   ```
3. Push the Drizzle schema to create all tables, enums, and indexes:
   ```bash
   pnpm --filter @workspace/db run push
   ```
   This runs `drizzle-kit push` using `lib/db/drizzle.config.ts` and
   `DATABASE_URL` from your environment. Re-run this any time the schema in
   `lib/db/src/schema/` changes.

   For a non-destructive review of pending changes first, you can run
   `drizzle-kit push` interactively (it prompts before applying); the
   `push-force` script skips prompts and is only intended for throwaway dev
   databases.

## 4. Cloudinary setup

1. Create a free account at cloudinary.com.
2. From the dashboard, copy your Cloud name, API key, and API secret.
3. Add them to `artifacts/api-server/.env`:
   ```
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```
   No bucket/folder setup is needed — the backend uploads to `pingx/avatars`
   and `pingx/messages` folders automatically (created on first upload).

## 5. JWT secret

Generate a random secret for signing auth tokens:

```bash
openssl rand -hex 32
```

Set it as `JWT_SECRET` in `artifacts/api-server/.env`. `JWT_EXPIRES_IN`
controls session length (default `30d`).

## 6. Running locally

The API server and frontend run as separate processes on different ports in
development.

**Terminal 1 — API server** (default port 8080, set via `PORT` in `.env`):
```bash
pnpm --filter @workspace/api-server run dev
```
This typechecks, bundles with esbuild, and starts the server. It serves the
REST API under `/api/*` and Socket.IO under `/api/socket.io`.

**Terminal 2 — frontend** (default port 21913, set via `PORT`/`BASE_PATH` in
`artifacts/pingx/.replit-artifact/artifact.toml` or your own `.env`):
```bash
pnpm --filter @workspace/pingx run dev
```

Because these run on different ports, the frontend needs to know where the
API server is:

```bash
cp artifacts/pingx/.env.example artifacts/pingx/.env
# edit VITE_API_BASE_URL to match the API server's PORT, e.g.
# VITE_API_BASE_URL=http://localhost:8080
```

With this set, REST calls and the Socket.IO connection both go directly to
the API server. Leave `VITE_API_BASE_URL` unset in production (see below).

Open the frontend URL, register an account, and start chatting. Open a
second browser (or incognito window), register a second account, and use
Add Friends → Search to find the first account by username and send a
friend request — once accepted, a conversation appears on both sides.

## 7. Typecheck & build everything

```bash
pnpm run typecheck   # full monorepo typecheck
pnpm run build       # typecheck + build all packages
```

## 8. Regenerating API types (only if you change the OpenAPI spec)

If you edit `lib/api-spec/openapi.yaml`, regenerate the Zod schemas and React
Query hooks:

```bash
pnpm --filter @workspace/api-spec run codegen
```

This writes to `lib/api-zod/src/generated/` and
`lib/api-client-react/src/generated/`. Both packages' `src/index.ts` barrels
already handle the small export-name collisions Orval produces for the
multipart upload endpoints — no manual fixes needed after regenerating.

## 9. Deploying on Replit

This repo includes `.replit` and per-artifact `.replit-artifact/artifact.toml`
files configured for Replit's autoscale deployment:

- API server — builds via `pnpm --filter @workspace/api-server run build`
  (esbuild bundle to `artifacts/api-server/dist/index.mjs`), runs on port
  8080, and is routed at `/api/*` (which also covers `/api/socket.io`).
- Frontend — builds via `pnpm --filter @workspace/pingx run build` to
  static files in `artifacts/pingx/dist/public`, served at `/`.

Both services sit behind the same Replit domain, so in production the
frontend's relative `/api/...` and `/api/socket.io` requests are
automatically routed to the API server — no `VITE_API_BASE_URL` needed in
production.

To deploy:

1. Push this repo to a Replit project (or import via GitHub).
2. In the Replit Secrets tab, set the API server's environment variables:
   `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLOUDINARY_CLOUD_NAME`,
   `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Don't commit a `.env` file
   with real credentials.
3. Provision a Postgres database (Replit's built-in Postgres, or an external
   provider) and set `DATABASE_URL` accordingly.
4. The postMerge hook (`scripts/post-merge.sh`) runs `pnpm install` and
   `pnpm --filter db push` automatically, keeping the schema in sync after
   each merge.
5. Deploy via Replit's autoscale deployment target (already configured in
   `.replit`).

## 10. Common gotchas

- "Use pnpm instead" error on install — the root `package.json` enforces
  pnpm via a `preinstall` script. Delete any `package-lock.json`/`yarn.lock`
  and use `pnpm install`.
- CORS errors in dev — make sure `CORS_ORIGIN` in
  `artifacts/api-server/.env` matches the frontend's dev origin
  (`http://localhost:21913` by default), and that `VITE_API_BASE_URL` in
  `artifacts/pingx/.env` points at the API server's port.
- Socket not connecting — the client expects Socket.IO at
  `/api/socket.io`; if you change the server's `path` option in
  `sockets/index.ts`, update `lib/socket.ts` in the frontend to match.
- "Invalid or expired token" right after login — check `JWT_SECRET` is set
  and identical across server restarts (changing it invalidates all existing
  sessions).
- Avatar/media uploads fail — verify all three `CLOUDINARY_*` env vars are
  set; the server throws on startup if any are missing.
