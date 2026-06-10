# AroundMyStay — Project Plan & Kickoff

*Created 2026-06-10. Read this first in any new chat about this project.*

## What it is

A website (mobile-friendly, like Practice Points) for travelers:

1. Type a **city** and **hotel** (autocomplete as you type) + your **dates**.
2. Hit **"Scan my surroundings"** → the app queries event/place services and
   returns concerts, pro sports, shows, top restaurants, bars, nightlife, and
   tours happening near the hotel during those dates.
3. Check off what interests you → see it all as **pins on a map** with the
   hotel at the center.
4. Tap a pin → hours, rating/reviews, walk/drive time, estimated Uber/Lyft
   cost, and (for events) a direct **Get Tickets** link.

## Owner & working style

Derek Tobin — non-developer. Plain English, one step at a time, confirm before
each step. Secrets (API keys) NEVER go in chat, in committed files, or in this
folder — only in git-ignored `.env` or Vercel environment variables.

## Decisions made

- **Name:** AroundMyStay. `aroundmystay.com` verified unregistered on
  2026-06-10 (RDAP) and no existing app uses the name. Derek to register the
  domain ASAP (~$10–15/yr) before someone else does.
- **Website first** — no app stores for v1. PWA/installable later if earned.
- **Stack:** Vite + React, Vercel hosting, GitHub. Supabase only in Phase 6
  (accounts/saved trips). Same playbook as Practice Points.
- **Data sources (not "scanning the internet" — structured APIs):**
  - Events + ticket links: Ticketmaster Discovery API (free; affiliate program
    later). SeatGeek/Eventbrite as gap-fillers if needed.
  - Hotel/city autocomplete, places, hours, reviews, photos: Google Places.
  - Restaurants/bars backup + reviews: Yelp Fusion.
  - Map: Google Maps JavaScript API (or Mapbox if pricing favors it).
  - Walk/drive times: Google Routes/Distance Matrix.
  - Uber/Lyft estimates: OUR OWN formula (base + per-mile + per-minute by
    city), clearly labeled "estimate" — Uber/Lyft no longer offer public
    pricing APIs.
  - Happy hours: deliberately EXCLUDED from v1 (no reliable data source).

## Phases

- **Phase 0 — Setup** (this phase): folder, skeleton app, git/GitHub, Derek's
  accounts (domain, Google Cloud; Ticketmaster before Phase 2, Yelp before
  Phase 3).
- **Phase 1 — Front door:** city + hotel autocomplete (Google Places), date
  picker, button confirms selection. Deployed to a live URL.
- **Phase 2 — Events list:** Ticketmaster wired in; real events for the dates
  with working ticket links; "interested" checkboxes.
- **Phase 3 — Places:** restaurants/bars/nightlife/tours via Google/Yelp;
  filter tabs (Events / Food / Bars / Tours).
- **Phase 4 — The map:** hotel-centered map, pins for selections, tap → detail
  card. The signature screen.
- **Phase 5 — Smart details:** walk/drive times, rideshare estimate formula,
  review snippets, open-now status.
- **Phase 6 — Accounts:** Supabase login, save/share trips.
- **Phase 7 — Later:** happy hours (if ever), affiliate revenue, AI itinerary,
  app-store wrappers.

## Status

- [x] Name chosen & vetted (2026-06-10)
- [x] Project folder + Vite/React skeleton created
- [x] `npm install` + app runs locally (verified 2026-06-10, no console errors)
- [x] git init + first commit (4506d3b)
- [ ] GitHub repo created + pushed (Derek creates empty private repo on github.com)
- [ ] Derek: register aroundmystay.com
- [ ] Derek: Google Cloud account (needed for Phase 1)
- [ ] Derek: Ticketmaster developer account (needed for Phase 2)
- [ ] Derek: Yelp Fusion account (needed for Phase 3)

## Machine gotchas (this PC)

- `node`/`npm` are NOT on PATH — node lives at `C:\Program Files\nodejs\`.
  Prepend it to PATH in the shell session before `npm run dev`.
- git lives at `C:\Program Files\Git\cmd\git.exe`.
- PowerShell mangles multiline `git commit -m` — commit via `-F <file>`.
- Use `curl.exe`, not `Invoke-WebRequest`.
