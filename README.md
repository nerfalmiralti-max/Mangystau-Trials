# Mangystau Trails

Mangystau Trails is a production-oriented tourism guide for Kazakhstan built with Next.js 16, React 19, Tailwind CSS 4, Leaflet and Prisma. It combines destination discovery, route planning, saved travel content, offline preparation and traveler support while preserving the project's dark glass visual identity.

## Project structure

The repository root is also the Next.js application root. Keep Vercel's **Root Directory** set to the repository root (`.`).

- `app/` — App Router pages, layouts, metadata and route handlers
- `components/` — shared navigation, maps, planners and travel UI
- `hooks/` — settings and geolocation state
- `lib/` — tourism data, authentication, storage and server utilities
- `prisma/` — database schema and migrations
- `public/` — optimized destination imagery and visual assets

There is no nested application directory and `next.config.ts` does not define a custom `distDir`. A successful production build therefore writes the standard `.next/` directory at the repository root.

## Local development

Next.js 16 requires Node.js 20.9 or newer.

```bash
npm install
copy .env.example .env
npm run prisma:deploy
npm run dev
```

On macOS or Linux, use `cp .env.example .env` instead of `copy`.

The install step generates Prisma Client automatically. Account, visit and contact persistence use PostgreSQL. Create an empty database, put its connection string in `.env`, then run `npm run prisma:deploy`. The public guide, map, location pages and local travel packs still render without database credentials; account and contact actions return an honest unavailable state until the backend is configured.

## Implemented product flow

- cinematic destination discovery with real Mangystau places and practical field notes
- interactive Leaflet map with filters, route previews and an accessible location list
- four-step route builder with transport, pace, group, budget, safety, equipment and backup plans
- shareable and device-saved generated routes, including restored saved-plan URLs
- full location pages with road, season, time, safety, gallery and nearby-service context
- compact contextual Travel Assistant with deterministic offline guidance
- secure server-backed registration, login and HTTP-only signed sessions when PostgreSQL is connected
- account-synced places and routes with device-first fallback, plus saved hotels and honest low-signal travel packs
- live account reviews with owner-only edit/delete controls and clearly labeled editorial previews
- branded loading, 404 and recovery states across desktop and mobile

## Quality checks

Run the same checks before deployment:

```bash
npm run lint
npm run type-check
npm test
npm run prisma:validate
npm run build
```

`npm run build` is intentionally the standard `next build` command. When it succeeds, `.next/BUILD_ID` is generated.

## Environment variables

Copy `.env.example` for local development and configure production secrets in the Vercel project settings.

| Variable | Production requirement | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Required for persistent backend features | Durable PostgreSQL connection used by Prisma. |
| `DIRECT_URL` | Required for migrations | Direct PostgreSQL connection. It may equal `DATABASE_URL` when the provider does not use pooling. |
| `AUTH_SECRET` | Required | Random secret of at least 32 characters used to sign authentication sessions. |
| `ADMIN_EMAILS` | Recommended | Comma-separated authenticated accounts allowed to create places through the admin API. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical public URL for metadata, sitemap and robots output. |
| `CONTACT_EMAIL` | Optional SMTP group | Destination for route-planning enquiries. |
| `SMTP_HOST` | Optional SMTP group | SMTP server hostname. |
| `SMTP_PORT` | Optional SMTP group | SMTP port, usually `587` or `465`. |
| `SMTP_USER` | Optional SMTP group | SMTP account username. |
| `SMTP_PASS` | Optional SMTP group | SMTP account password. |
| `SMTP_SECURE` | Optional SMTP group | Set to `true` for implicit TLS, normally on port `465`. |
| `SMTP_FROM` | Optional SMTP group | Verified sender address; defaults to `SMTP_USER`. |

The production build itself does not require live database or SMTP credentials. Prisma Client generation uses a non-connecting PostgreSQL placeholder only when `DATABASE_URL` is absent; runtime database features still require the hosted production value. There are no shared demo credentials or committed passwords.

## Vercel configuration

Use these project settings:

- Framework Preset: `Next.js`
- Root Directory: repository root (`.`)
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: leave unset so Next.js uses `.next`
- Node.js: 20.9 or newer

Before the first production release, run `npm run prisma:deploy` against the same hosted PostgreSQL database. For a new database, run `npm run prisma:seed` once afterward; the seed inserts only missing destination IDs and never overwrites edited production records. Do not run database migrations or seeds as part of every Vercel page build.

If Vercel reports that `.next` was not generated, inspect the first error earlier in the build log. The missing directory is normally a consequence of `next build` stopping, not an output-directory problem.

## Backend notes

Prisma models cover tourists, destinations, visits, account-owned saved content, reviews and contact messages. Route handlers use the configured PostgreSQL database when available and preserve read-only destination fallbacks for the public guide. Previous SQLite migration history is retained under `prisma/sqlite-migrations/` for reference only; deployable migrations live under `prisma/migrations/`.

Mutation endpoints enforce same-origin checks, server-side validation and instance-local request limits. Because Vercel can run multiple serverless instances, production deployments should also enable Vercel Firewall rate limiting or a shared durable limiter for distributed abuse protection.
