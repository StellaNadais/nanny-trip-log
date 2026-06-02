# Nanny trip log

A mobile-first React app for caregivers: schedule gigs, log kid journals, track shift punctuality, and build weekly receipts. Parents book via a separate **`/book`** link you share.

Data is stored in **localStorage** on this device only — no login, no cloud sync.

## Run locally

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

## Caregiver flow

1. **Welcome** → tap to start → **Schedule**
2. On Schedule, open any tool (Shift, Kid journal, Events, Internal notes) or **Receipt**
3. Each tool shows **Press to start**, then its workspace
4. **← Schedule** returns from any tool

`/hub` redirects to Schedule (legacy URL).

## Routes

| Path | Purpose |
|------|---------|
| `/` | Welcome |
| `/schedule` | Calendar + tool links + receipt |
| `/shift` | Arrival / end logging |
| `/journal` | Kid journal + mileage sync |
| `/notes` | Punctuality score |
| `/events` | Local event ideas |
| `/book` | Parent booking |
| `/receipt` | Redirects to Schedule with receipt open |

## Journal → receipt mileage

1. Use the **week strip** on Kid journal (same week as Receipt).
2. In **About today**, type outing nicknames (e.g. `home, drop off, music`).
3. Highlighted nicknames mean mileage is counting for that week.
4. Open **Receipt** from Schedule to see totals.

## Customizing

- Place nicknames: `src/data/tripPlaces.js`, `src/data/tripSegments.js`
- Thank-you on Book page: `src/data/bookThanks.js`
