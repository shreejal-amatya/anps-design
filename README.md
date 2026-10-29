# ANPS Design

Next.js foundation preserving the approved ANPS UI. Source baseline: development commit 708af4a.

## Local setup

Use Node 24 and npm. Run `npm ci`, `npm test`, `npm run typecheck`, and `npm run build`. Configure `APP_ENV=local` before running the app. Link only to `anps-design-dev` and verify development-only credentials before database commands. Do not run schema changes against production.

## Current scope

Public routes: /, /services, /works, /works/[slug], /about, /contact, /privacy. Existing HTML URLs redirect. Shared shell and client interactions replace duplicated brittle scripts. Trusted versioned design templates preserve the current visual direction pending feature component migration. No runtime CMS HTML is accepted.

Admin uses Neon Auth with server-enforced active membership. No public registration is exposed by the application. An owner account must be provisioned before use. The enquiry API validates and persists enquiries with deduplication, keyed request limits and a transactional notification outbox. Email sending is not configured. This is a foundation, not a live enquiry system. The portfolio reads published projects from the database. Demo entries are explicitly labelled and use studio-supplied material. Search indexing stays disabled until launch.

## Environments

One repository. Development branch uses anps-design-dev; main reserved for reviewed production releases on anps-design. APP_ENV is explicit and distinct from Vercel deployment scope and NODE_ENV. Never share credentials/database/media write access across environments. Private setup checklists, architecture and failure reports stay outside this public repository.

## Database changes

Versioned SQL lives in db/migrations. Run npm run db:migrate with APP_ENV=development and a direct DATABASE_URL_UNPOOLED in the ignored .env.local. The runner checks migration checksums, applies each migration transactionally and serializes concurrent runs. Production migrations are intentionally unsupported at this stage. The health endpoint verifies database connectivity and schema presence; it reports schema and enquiry-storage readiness; it does not prove email delivery or media are functional.

## Portfolio media

Neon private object storage holds image bytes; Postgres stores keys and metadata. Draft image delivery checks studio membership; published images receive short-lived signed read URLs. Server-issued signed uploads accept JPEG, PNG or WebP up to 12 MB; finalization verifies actual bytes and re-encodes full/thumbnail WebP derivatives with GPS/EXIF stripped. Demo imports are data, not committed photos.

A client can save a draft, upload photos or add a validated YouTube URL, arrange the gallery, set its cover, preview and publish. Publishing requires ready media with confirmed permission and a category; image projects also require a cover. Move published projects back to draft before editing. Removal from a gallery does not permanently delete a reusable asset. Videos remain on YouTube and load only after a visitor clicks.

Development limits are currently 100 uploads per account per day, a 500 MB tracked media allowance and 40 megapixels per input. Automated orphan/abandoned-upload retention and CDN integration remain future work. Private object read URLs expire after one minute; already issued URLs do not revoke immediately on unpublish.
