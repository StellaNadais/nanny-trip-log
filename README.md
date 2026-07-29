# Nanny Trip Log

A mobile-first React app for caregivers to schedule gigs, log kid journals, and generate weekly receipts. Parents use the separate `/book` route to request care.

## Live Demo

- [Caregiver Journal](https://nanny-trip-log-git-cursor-trip-route-bar-stella-nadais-projects.vercel.app/journal)
- [Parent Booking](https://nanny-trip-log-git-cursor-trip-route-bar-stella-nadais-projects.vercel.app/book)

## Features

- Caregiver workflow with schedule, shift logging, journaling, events, and weekly receipts.
- Parent-facing booking flow on `/book`.
- Mobile-first UI optimized for quick logging on the go.
- Local-first storage with optional weekly cloud sync for bookings, parent reminders, shopping, and journals.
- Legacy redirects for older routes like `/hub` and `/receipt`.

## Tech Stack

- React
- Vite
- React Router
- localStorage
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

The app keeps an offline copy in `localStorage`. By default nothing leaves the device.

### Optional shared weekly sync

The Vercel function in `api/week-sync.js` can sync the current Monday–Sunday week between
devices. It covers bookings (including bring-along choices and appreciation notes), parent
reminders, grocery lists, and kid-journal entries. The cloud record expires at the start of
the following Monday; local browser copies are left untouched.

1. Create a free [Upstash Redis](https://upstash.com/) database.
2. In Vercel, set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from Upstash.
3. Generate a long shared code and set it as `NANNY_SYNC_CODE` in Vercel and
   `VITE_NANNY_SYNC_CODE` in the Vercel build environment. Redeploy after setting it.
4. For local development, copy `.env.example` to `.env.local` and set
   `VITE_NANNY_SYNC_CODE` to that same code.

The code is a shared-family access code, not individual-user authentication: anybody who can
inspect the deployed client can recover it. Do not use this v1 mechanism for sensitive personal
information. A real authentication system is required before storing sensitive family data.

Changes sync shortly after they are saved and the app refreshes cloud data once per minute.
Simultaneous edits to the same data set use last-write-wins behavior.

## Customization

- `src/data/tripPlaces.js` — place nicknames for the trip journal
- `src/data/tripSegments.js` — trip segment labels
- `src/data/bookThanks.js` — thank-you message for the booking page

## Deployment

This project is deployed on Vercel and auto-deploys from GitHub.

## Notes

This project is designed as a privacy-first, mobile-friendly tool for caregivers and families.
