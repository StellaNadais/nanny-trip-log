# Nanny Trip Log

A mobile-first React app for caregivers to schedule gigs, log kid journals, and generate weekly receipts. Parents use the separate `/book` route to request care.

## Live Demo

- [Caregiver Journal](https://nanny-trip-log-git-cursor-trip-route-bar-stella-nadais-projects.vercel.app/journal)
- [Parent Booking](https://nanny-trip-log-git-cursor-trip-route-bar-stella-nadais-projects.vercel.app/book)

## Features

- Caregiver workflow with schedule, shift logging, journaling, events, and weekly receipts.
- Parent-facing booking flow on `/book`.
- Mobile-first UI optimized for quick logging on the go.
- Local-first storage with persistent Supabase household sync for logged app data.
- Legacy redirects for older routes like `/hub` and `/receipt`.

## Tech Stack

- React
- Vite
- React Router
- localStorage
- Supabase
- Vercel

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Routes

| Path | Purpose |
|------|---------|
| `/` | Welcome / onboarding |
| `/schedule` | Calendar, tool links, and weekly receipt |
| `/shift` | Arrival and end logging |
| `/journal` | Kid trip and activity journal |
| `/notes` | Nanny hub and punctuality score |
| `/events` | Local event ideas |
| `/book` | Parent booking flow |
| `/receipt` | Redirects to Schedule with receipt open |
| `/hub` | Legacy redirect to `/schedule` |

## Data Storage

The app keeps an offline copy in `localStorage` and, when configured, continuously syncs a
shared household record to Supabase. This means the same logged data is available after opening
the app in another browser or on another device.

### Supabase shared household sync

Supabase stores a persistent JSON snapshot of:

- bookings and booking requests
- kid journal and About Today entries
- parent reminders and grocery lists
- shift/arrival logs
- receipt hours, mileage, expenses, and settings
- trip-log entries, custom outing locations, and shift-contract/leave data

To set it up:

1. Create a [Supabase project](https://supabase.com/dashboard).
2. Open its SQL Editor and run
   [`supabase/migrations/20260809113000_create_nanny_shared_data.sql`](supabase/migrations/20260809113000_create_nanny_shared_data.sql).
3. In Supabase **Project Settings → API**, copy the Project URL and anon/publishable key.
4. Generate a random household code of at least 24 characters. For example:
   `openssl rand -hex 32`.
5. Set these Vercel environment variables, then redeploy:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_NANNY_SYNC_CODE`
6. For local development, copy `.env.example` to `.env.local` and use the same three values.

No Supabase service-role key or Vercel API environment variable is needed. The app loads the
shared document at startup, saves shortly after each change, and checks for changes once per
minute. The cloud record does not expire. If two devices edit before either has downloaded the
other's change, the last saved snapshot wins.

This v1 design has no individual accounts: the household code is the shared access secret and is
compiled into the client. The SQL migration prevents anonymous browsing of the table, but anyone
who obtains that code can access the household data. Do not store highly sensitive personal
information until the app has real user authentication and per-household access policies.

## Customization

- `src/data/tripPlaces.js` — place nicknames for the trip journal
- `src/data/tripSegments.js` — trip segment labels
- `src/data/bookThanks.js` — thank-you message for the booking page

## Deployment

This project is deployed on Vercel and auto-deploys from GitHub.

## Notes

This project is designed as a privacy-first, mobile-friendly tool for caregivers and families.
