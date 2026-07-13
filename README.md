# Nanny Trip Log

A mobile-first React app for caregivers to schedule gigs, log kid journals, track shift punctuality, and generate weekly receipts. Parents use the separate `/book` route to request care.

## Live Demo

- [Caregiver Journal](https://nanny-trip-log-git-cursor-trip-route-bar-stella-nadais-projects.vercel.app/journal)
- [Parent Booking](https://nanny-trip-log-git-cursor-trip-route-bar-stella-nadais-projects.vercel.app/book)

## Features

- Caregiver workflow with schedule, shift logging, journaling, events, and weekly receipts.
- Parent-facing booking flow on `/book`.
- Mobile-first UI optimized for quick logging on the go.
- Local-only storage with `localStorage` for privacy and offline-friendly use.
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

All app data is stored in `localStorage` on the current device only.  
There is no login, cloud sync, or backend database.

## Customization

- `src/data/tripPlaces.js` — place nicknames for the trip journal
- `src/data/tripSegments.js` — trip segment labels
- `src/data/bookThanks.js` — thank-you message for the booking page

## Deployment

This project is deployed on Vercel and auto-deploys from GitHub.

## Notes

This project is designed as a privacy-first, mobile-friendly tool for caregivers and families.
