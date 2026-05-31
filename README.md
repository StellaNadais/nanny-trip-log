# Nanny trip log

A mobile-first React app for caregivers: schedule gigs, log kid journals, track shift punctuality, add expenses, and build weekly receipts. Parents book via a separate **`/book`** link you share.

Data is stored in **localStorage** on this device only — no login, no cloud sync.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build    # production build
npm run preview  # serve the build
npm run lint     # ESLint
```

## Routes

| Path | Who | Purpose |
|------|-----|---------|
| `/` | Caregiver | Welcome — tap anywhere to start |
| `/schedule` | Caregiver | Calendar + booking requests |
| `/hub` | Caregiver | Tools hub (flash cards) |
| `/shift` | Caregiver | Shift / punctuality (A) |
| `/journal` | Caregiver | Kid journal (B) |
| `/outings` | Caregiver | Weekly expenses (C) |
| `/events` | Caregiver | Local event ideas (D) |
| `/notes` | Caregiver | Internal notes (E) |
| `/book` | Parent | Request dates — share this link |
| `/receipt` | Caregiver | Redirects to Hub with receipt popup |
| `/trip-log` | — | Redirects to `/journal` (legacy URL) |

**Hub → receipt:** tap the receipt button at the bottom of Tools. It opens as a popup over the flash cards.

## Caregiver flow

1. **Welcome** → tap screen → **Schedule**
2. **Schedule** → swipe left (mobile) or **Open Tools →** (desktop) → **Hub**
3. Pick a tool card, or open **Receipt** from the Hub footer
4. **← Schedule** on Hub (or swipe right on mobile) to go back

Arrow keys also move between Welcome → Schedule → Hub (right arrow does not advance from home).

## Parent flow

1. Open **`/book`** (not linked from the caregiver app)
2. Pick dates and submit a request
3. Request appears on the caregiver **Schedule** → accept or decline

## Smoke-test checklist

Use this after changes or before sharing a demo.

### Setup

- [ ] `npm run build` completes with no errors
- [ ] App loads at `/` without console errors

### Welcome & navigation

- [ ] Tap welcome screen → lands on `/schedule`
- [ ] Mobile: swipe left on schedule → `/hub`
- [ ] Desktop: **Open Tools →** → `/hub`
- [ ] Hub **← Schedule** (or swipe right) → back to schedule

### Booking (parent)

- [ ] Open `/book` in another tab or incognito
- [ ] Submit a date request
- [ ] Request shows on schedule (Requests dock if pending)
- [ ] Accept → date appears on calendar; decline works

### Hub tools

- [ ] **Shift (A)** — open, log punctuality, back to Hub
- [ ] **Kid journal (B)** — pick a day, save notes/meals; **Add expenses** opens modal
- [ ] **Outings (C)** — add parking/tolls; week total updates; link to receipt works
- [ ] **Events (D)** — lists load
- [ ] **Internal notes (E)** — open, back to Hub

### Receipt

- [ ] From Hub, open receipt popup
- [ ] Hub cards blur behind modal; close returns to Hub
- [ ] Hours / mileage / extras persist after refresh
- [ ] `/receipt` redirects to Hub with popup open

### Persistence

- [ ] Refresh browser — bookings, journal, and receipt data remain
- [ ] Clear site data → app starts fresh (expected)

## Customizing content

- **Place nicknames & mileage legs:** `src/data/tripPlaces.js`, `src/data/tripSegments.js`
- **Thank-you section on Book page:** `src/data/bookThanks.js`
- **Family events:** `src/data/familyEvents.js`

For a public portfolio, swap real nicknames in `tripPlaces.js` with generic placeholders.

## Limits (by design)

- Single browser / device — no multi-user sync
- No authentication
- Weather on welcome needs network (falls back gracefully)
- Clearing browser storage deletes all data
