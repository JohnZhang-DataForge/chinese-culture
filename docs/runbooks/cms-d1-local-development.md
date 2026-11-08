# CMS Local D1 and Pages Functions Runbook

The production site remains static. The editorial CMS uses Cloudflare Pages Functions and the `CMS_DB` D1 binding only under authenticated `/api/admin/*` routes.

## Safety rules

- Local testing uses Wrangler's local D1 emulator and the `.wrangler/state` directory.
- Never use `--remote` for local development or automated tests.
- Do not copy production database contents into local fixtures.
- Do not commit `.dev.vars`, private keys, API tokens or CSRF secrets.
- The local auth bypass is accepted only for requests to `localhost` whose Origin exactly matches the local `ADMIN_ORIGIN`. Production's HTTPS origin does not satisfy that check.

## First-time setup

Install the project dependencies:

```sh
npm install
```

Create an untracked `.dev.vars` file in the repository root:

```dotenv
ADMIN_ORIGIN=http://localhost:8788
ADMIN_EMAIL=local-admin@example.test
ADMIN_CSRF_SECRET=replace-with-a-random-local-secret-at-least-32-characters
CMS_LOCAL_AUTH_BYPASS=true
```

Do not use a real production email or production secret in this file.

## Apply migrations locally

```sh
npx wrangler d1 migrations apply chinese-culture-cms --local
```

Check the local migration state:

```sh
npx wrangler d1 migrations list chinese-culture-cms --local
npx wrangler d1 execute chinese-culture-cms --local --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
```

Wrangler stores this local database under its local state directory. It is separate from the production D1 database.

## Run the complete Pages application locally

Build the static site and start the Pages Functions runtime:

```sh
npm run build
npx wrangler pages dev dist
```

Open `http://localhost:8788/admin/`. The local-only auth bypass supplies the configured local admin identity. Drafts, translations, revision history and preview use local D1.

GitHub publication and media upload remain unavailable locally unless a developer deliberately configures a separate test GitHub App. Never copy production GitHub App credentials into `.dev.vars`.

## Automated validation

The CI workflow applies the migration with `--local`, runs the Node test suite, checks the import script syntax, builds Astro and verifies the static output. The CMS bootstrap workflow is the only workflow that applies migrations to production; it runs only after migration/import changes reach `main`.

## Production bindings

- Pages project: `chinese-culture`
- D1 binding: `CMS_DB`
- D1 database: `chinese-culture-cms`
- Local auth bypass: never set in production
- Production authentication: Cloudflare Access + verified Access JWT + same-origin CSRF
