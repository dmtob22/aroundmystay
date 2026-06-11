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
  2026-06-10 (RDAP) and no existing app uses the name. Domain purchase
  DEFERRED (Derek's call, same as Practice Points) — app will live on the
  free `*.vercel.app` URL; buy the domain only if the app gets traction.
  Known risk: someone else could register it in the meantime.
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
- [x] GitHub repo created + pushed: https://github.com/dmtob22/aroundmystay (private)
- [~] Domain: deferred by choice — free Vercel URL instead (revisit at traction)

## Phase 1 status

- [x] Search UI built & verified (2026-06-10): city/hotel autocomplete fields
  (Places API New via `src/lib/places.js`), date pickers with validation,
  scan button gated until all fields valid. Runs clean with NO key — shows
  "autocomplete is asleep" note; wakes automatically when
  `VITE_GOOGLE_MAPS_API_KEY` exists in git-ignored `.env` (see `.env.example`).
- [x] Google Cloud account created (2026-06-10, trial mode: $300/90 days,
  card cannot be charged while in trial)
- [x] Places API (New) enabled (gotcha: the Maps onboarding wizard enabled 33
  OTHER APIs but not this one — had to enable via the activation URL from the
  403 SERVICE_DISABLED error)
- [x] Key restricted: Websites = http://localhost:5174/* ; API = Places API
  (New) only (initially saved as "33 APIs" — re-restricted). Key rotated after
  it appeared in a chat screenshot; lives ONLY in git-ignored `.env`.
- [x] Live autocomplete VERIFIED end-to-end (2026-06-10): city suggestions,
  hotel suggestions biased to chosen city (placeLocation), dates, scan
  confirmation. Tested: Nashville → Gaylord Opryland.
- [~] Quota caps: NOT EDITABLE during free trial (Google blocks quota changes
  on trial accounts — trial itself is the spending wall; even at trial end,
  Google suspends rather than charges unless you manually upgrade).
  🔴 RULE: if the account is EVER upgraded to full/paid, set these BEFORE
  using the app again: Places API (New) → Requests per day = 300, Requests
  per minute = 100, plus a billing budget alert. Never upgrade casually.
- [x] Deployed to Vercel: https://aroundmystay.vercel.app (public; deployment
  protection NOT an issue this time). Vercel URL added to key restrictions.
- [x] PHASE 1 COMPLETE — verified working on Derek's phone (2026-06-10).
  Debug saga for the record: live site said "API key not valid" because the
  WHOLE `.env` line (name + = + key) had been pasted into Vercel's value box
  (baked value was 64 chars instead of 39). Found via the on-screen error
  display added in 52b2477 + inspecting the deployed bundle's exact bytes.
  Fix: Vercel env var = key only, then Redeploy. LESSONS: (a) errors must be
  visible on phones, (b) when a secret transits a human clipboard, verify the
  DEPLOYED value's length/shape, not just that a key is present.
- [ ] 🔴 Old exposed key ("Maps Platform API Key") confirmed STILL ALIVE —
  Derek to delete in Keys & Credentials (keep only "New Maps Platform API
  Key").

## Phase 2 status (events via Ticketmaster Discovery API)

- [x] Derek: Ticketmaster Consumer Key in `.env` as VITE_TICKETMASTER_KEY
  (free, no card). Old Google key deleted & verified dead same day.
- [x] Key decision for v1: client-side via VITE_TICKETMASTER_KEY (acceptable:
  no payment attached, default rate caps ~5/sec & 5000/day bound the damage;
  move behind a Vercel serverless proxy before any serious launch)
- [x] Hotel coordinates fetched on hotel pick (placeLocation); scan centers
  on hotel, falls back to city center
- [x] Results screen: events within 20 mi during stay, grouped by day —
  image, venue, local time, price range, category chip, Get Tickets link,
  ★ Pick toggles + picked-count footer (picks feed the Phase 4 map)
- [x] Verified locally with REAL data (Nashville/Gaylord Jul 10–13: 28
  events). Gotchas fixed: use localStartDateTime (UTC range leaked previous
  evening's events); Ticketmaster segment "Undefined" → show "Event"
- [x] Vercel env var VITE_TICKETMASTER_KEY added. GOTCHA: "Redeploy" reused
  the build cache (6s build) so the new env var didn't bake in — fix was
  pushing a commit to force a fresh build. Rule: after env-var changes,
  either uncheck "use existing build cache" on Redeploy or push a commit.
- [x] PHASE 2 COMPLETE — verified live on Derek's phone (2026-06-10).
- NOTE: Vercel bot protection ("Security Checkpoint") may serve a challenge
  page to automated curl checks of the live site — verify via a real browser
  or the Vercel dashboard instead of rapid polling.

## Phase 3 status (places + filter tabs)

- [x] Tabs on results screen: 🎟️ Events / 🍽️ Food / 🍸 Bars / 🥾 Outdoors /
  🎡 Attractions — all fetched in parallel on scan. Uses the EXISTING Google
  key (Places searchNearby + photo media), no new accounts.
- [x] Outdoors tab per Derek's request: hiking_area, national_park, park
  (40 km radius — trailheads can be a drive; food/bars 4 km, attractions 15).
- [x] Place cards: photo, ★ rating (count), $-level, Open now / Closed right
  now, address, ☆ Pick toggle, Details link to Google Maps.
- [x] Verified locally (Nashville/Gaylord: 28 events + 15 per tab).
- [x] Stay field accepts hotel name OR street address (Derek's insight:
  Airbnbs/rentals/family). Dropped the 'lodging' type filter on the stay
  autocomplete; city bias keeps suggestions local. Verified: "501 Broadway"
  → scan centers there, distances recompute correctly.
- [x] Distance from hotel on every event/place card (Derek's request):
  straight-line haversine miles ("≈0.5 mi"), computed free at scan time from
  coordinates we already have. Phase 5 upgrades to true walk/drive times.
- [ ] Derek: verify live on phone (auto-deployed; no Vercel env changes
  needed this phase)
- DECISION: Facebook events = NOT possible (FB closed its public events API
  in 2018; scraping violates ToS). Gap noted; SeatGeek API is the Phase 7
  candidate for a second event source.
- [ ] Derek: Google Cloud account (needed for Phase 1)
- [ ] Derek: Ticketmaster developer account (needed for Phase 2)
- [ ] Derek: Yelp Fusion account (needed for Phase 3)

## Machine gotchas (this PC)

- `node`/`npm` are NOT on PATH — node lives at `C:\Program Files\nodejs\`.
  Prepend it to PATH in the shell session before `npm run dev`.
- git lives at `C:\Program Files\Git\cmd\git.exe`.
- PowerShell mangles multiline `git commit -m` — commit via `-F <file>`.
- Use `curl.exe`, not `Invoke-WebRequest`.
