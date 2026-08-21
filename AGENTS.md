# AGENTS.md

## Cursor Cloud specific instructions

`nannytriplog` is a single **Vite 8 + React 19** SPA (package manager: **npm**). Standard commands live in `package.json` (`dev`, `build`, `lint`, `preview`) and setup is documented in `README.md`.

### Services

| Service | Required? | Run command | Notes |
|---|---|---|---|
| Vite dev server (the SPA) | Yes | `npm run dev` | Serves the whole app at `http://localhost:5173`. |
| Supabase (Postgres cloud sync) | No | n/a (hosted) | Optional cross-device sync only. |

### Non-obvious notes

- **App is local-first and runs with no configuration.** All data is stored in `localStorage`. Supabase is only for optional cross-device sync; when the `VITE_SUPABASE_*` env vars are unset (or still contain `replace-with`), the Supabase client is `null` and sync is silently disabled (see `src/context/CloudSyncProvider.jsx`). No secrets are needed to run or test the core product.
- **To enable cloud sync (optional):** copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_NANNY_SYNC_CODE`, then apply the migration in `supabase/migrations/` to a hosted Supabase project (see `README.md`).
- **`npm run lint` currently reports pre-existing errors** (mostly `react-hooks/set-state-in-effect`). The ESLint tooling itself works; these are existing code issues, not an environment problem. Do not assume you broke lint.
- **`npm run build` succeeds** and emits a chunk-size warning (>500 kB) — this is expected, not a failure.
- A stray `package-lock 2.json` file exists at the repo root (an accidental duplicate of `package-lock.json`); it is harmless and unused by npm.
