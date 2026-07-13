Nanny Trip Log
A mobile-first React app for caregivers: schedule gigs, log kid journals, track shift punctuality, and build weekly receipts. Parents book via a separate /book link you share.

Live demo: nanny-trip-log.vercel.app

Quick start
Parents: visit /book to browse available nannies and book a gig
Caregivers: visit /journal to log trips, shifts, and kid activities

Tech stack
Frontend: React (Vite), mobile-first responsive design

Routing: React Router (client-side)

Storage: localStorage (device-only, no backend, no login)

Deployment: Vercel (auto-deploy from GitHub)

Run locally
bash
npm install
npm run dev
npm run build
npm run preview
Routes
Path	Purpose	User
/	Welcome / onboarding	Caregivers
/schedule	Calendar + tool links + weekly receipt	Caregivers
/shift	Arrival/end time logging + punctuality	Caregivers
/journal	Kid trip/activity journal	Caregivers
/notes	Nanny hub (punctuality score, notes)	Caregivers
/events	Local event ideas for kids	Caregivers
/book	Parent booking flow (browse nannies, request gigs)	Parents/Families
/receipt	Redirects to Schedule with receipt open	Caregivers
/hub	Legacy → redirects to /schedule	Caregivers
User flows
Caregiver flow
Welcome → tap to start → Schedule

From Schedule, access any tool: Shift, Kid journal, Events, Nanny hub

Each tool shows Press to start, then its workspace

← Schedule returns from any tool

Generate weekly Receipt from Schedule

Parent/Family flow
Visit /book (shared by nanny or found via search)

Browse available nannies in the Bay Area

Select a nanny, view their profile, availability, and rates

Submit a booking request

Receive confirmation (stored locally for session)

Data & privacy
All data is stored in localStorage on the user's device

No login required

No cloud sync or backend database

Data does not persist across devices or browsers

Ideal for privacy-first, offline-capable use

Customizing
File	Purpose
src/data/tripPlaces.js	Customize place nicknames for trip journal
src/data/tripSegments.js	Customize trip segment labels
src/data/bookThanks.js	Customize thank-you message on Book page
src/data/nannies.js	Add/edit nanny profiles for booking (parents)
Deployment
This app is deployed on Vercel from the cursor-trip-route-bar branch.

Caregiver URL: https://nanny-trip-log-git-cursor-trip-route-bar-stella-nadais-projects.vercel.app/journal

Parent booking URL: https://nanny-trip-log-git-cursor-trip-route-bar-stella-nadais-projects.vercel.app/book

To add new routes or features:

Edit files in GitHub or locally

Commit and push

Vercel auto-deploys within 1-2 minutes

Future ideas
Add real booking form with date/time picker on /book

Connect nannies + families via shared localStorage keys or simple backend

Add push notifications for booking confirmations

Bay Area-specific event suggestions (parks, museums, activities)

Custom domain (e.g., gigprotocol.com) for professional branding
