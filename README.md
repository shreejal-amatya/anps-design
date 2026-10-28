# ANPS Design

Next.js foundation preserving the approved ANPS UI. Source baseline: development commit 708af4a.

## Local setup

Use Node 24 and npm. Run `npm ci`, `npm test`, `npm run typecheck`, and `npm run build`. Configure `APP_ENV=local` before running the app. Link only to `anps-design-dev` and verify development-only credentials before database commands. Do not run schema changes against production.

## Current scope

Public routes: /, /services, /works, /works/[slug], /about, /contact, /privacy. Existing HTML URLs redirect. Shared shell and client interactions replace duplicated brittle scripts. Trusted versioned design templates preserve the current visual direction pending feature component migration. No runtime CMS HTML is accepted.

Admin uses Neon Auth with server-enforced active membership. No public registration is exposed by the application. An owner account must be provisioned before use. The enquiry API validates and persists enquiries with deduplication, keyed request limits and a transactional notification outbox. Email sending is not configured. This is a foundation, not a live enquiry system. All portfolio imagery is illustrative. Search indexing stays disabled until launch.

## Environments

One repository. Development branch uses anps-design-dev; main reserved for reviewed production releases on anps-design. APP_ENV is explicit and distinct from Vercel deployment scope and NODE_ENV. Never share credentials/database/media write access across environments. Private setup checklists, architecture and failure reports stay outside this public repository.

## Database changes

Versioned SQL lives in db/migrations. Run npm run db:migrate with APP_ENV=development and a direct DATABASE_URL_UNPOOLED in the ignored .env.local. The runner checks migration checksums, applies each migration transactionally and serializes concurrent runs. Production migrations are intentionally unsupported at this stage. The health endpoint verifies database connectivity and schema presence; it reports schema and enquiry-storage readiness; it does not prove email delivery or media are functional.
