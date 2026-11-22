# 🌾 AgroCast AI — AI-Powered Agricultural Intelligence Platform
**Designed Exclusively for the Farmers of Andhra Pradesh, India**

AgroCast AI is a full-stack, Telugu-first, bilingual agricultural intelligence and farmer assistance platform built with **Next.js (App Router), React, JavaScript (JSX), and Tailwind CSS**.

---

## 🏗️ Full-Stack Backend Architecture

The backend is built as a modular multi-tier service layer using **Next.js Route Handlers**, a **PostgreSQL database schema (Supabase)**, and service abstractions:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js Route Handlers                          │
│   /api/health, /api/profile, /api/farm, /api/weather, /api/advisor,   │
│   /api/pesticides, /api/reviews, /api/markets, /api/notifications     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                            Services Layer                              │
│   authService, farmService, weatherService, advisorService,            │
│   pesticideService, marketService, notificationService                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                         Data & Integration Layer                       │
│  - Cookie-authenticated Supabase clients and RLS for user-owned data    │
│  - localStorage only for offline demo data and migration source         │
│  - Open-Meteo weather API and data.gov.in AGMARKNET prices              │
│  - Gemini AI integration when configured; no offline advice fallback   │
└────────────────────────────────────────────────────────────────────────┘
```

Authenticated profile, farm, crop, custom-settlement, language-preference, and farmer-review operations use Supabase through cookie-backed server clients and Row Level Security. The browser only receives the Supabase publishable/anon key; no service-role key is used. Farm data already stored locally is imported only when the authenticated account has no farm. Existing cloud farms are authoritative and are never overwritten by that import. When Supabase is not configured, the demo farm remains local to the browser. The legacy in-memory data layer is retained only for features that have not been connected to Supabase.

The checked-in Andhra Pradesh location dataset contains 26 districts, 644 mandals, and 1,047 village entries; it is not a complete authoritative village directory. Farmers can add and edit settlements missing from that dataset. Custom settlement coordinates use approximate parent-mandal coordinates when available and are marked approximate.

---

## 📡 Complete Backend API Endpoints

### 1. Health & System
- `GET /api/health` — Reports service and integration configuration status; it does not make provider health-check requests.

### 2. Authentication & User Profile
- `GET /api/profile` — Retrieves the authenticated farmer's profile.
- `PUT /api/profile` — Updates personal information and settings.
- `PUT /api/profile/language` — Updates preferred language (`te` or `en`).

### 3. Andhra Pradesh Location Hierarchy
- `GET /api/locations` — Returns AP location data with query filters.
- `GET /api/locations/districts` — Lists all 26 AP districts with coordinates and dominant soil.
- `GET /api/locations/mandals?district=<name>` — Returns mandals for a district.
- `GET /api/locations/villages?district=<name>&mandal=<name>` — Returns villages in the checked-in dataset; coordinates may be approximate and are labelled as such.

### 4. Farm Profile & Crop Progress Tracker
- `GET /api/farm` — Returns the authenticated farmer's farm, crops, and custom settlements.
- `POST /api/farm` — Creates a farm snapshot only when no cloud farm exists; used for safe local-data migration.
- `PUT /api/farm` — Updates the authenticated farmer's farm and replaces its crop/settlement snapshot.
- `GET /api/farm/crops` — Lists crops for the authenticated farmer's farm.
- `POST /api/farm/crops` — Adds a crop to the authenticated farmer's farm.
- `PUT /api/farm/crops/:id` — Updates one of the authenticated farmer's crops.
- `DELETE /api/farm/crops/:id` — Removes one of the authenticated farmer's crops.

### 5. Weather Intelligence
- `GET /api/weather/current?lat=<lat>&lon=<lon>&lang=<te|en>` — Real-time temperature, humidity, wind, rainfall, sunrise/sunset via Open-Meteo.
- `GET /api/weather/forecast?lat=<lat>&lon=<lon>&lang=<te|en>` — Next 24-hr hourly, 7-day forecast, and 14-day extended trend.
- `GET /api/weather/alerts?district=<name>` — Active severe weather warnings (IMD official vs AgroCast risk).
- `GET /api/weather/history?district=<name>` — 30-year seasonal rainfall baseline comparison (deficit/surplus).

### 6. AI Farming Advisor
- `POST /api/advisor/chat` — Intent-aware AI responses using the farmer's supplied farm and weather context. Uses Gemini `gemini-3.8-flash`; an API key is required for agricultural answers. Without a configured key, greetings are handled locally and other questions return an explicit unavailable error rather than fabricated fallback advice. API keys are server-side only.
- `GET /api/advisor/conversations` — Retrieves conversation history.
- `POST /api/advisor/conversations` — Creates a new conversation thread.
- `GET /api/advisor/conversations/:id` — Retrieves specific conversation messages.
- `DELETE /api/advisor/conversations/:id` — Deletes a conversation.
- `POST /api/advisor/analyze-image` — Crop-, growth-stage-, and image-type-aware Gemini image assessment when `GEMINI_API_KEY` is configured. Accepts a farmer-selected crop, optional symptom description and farm context, and JPEG/PNG/WebP under 5 MB; validates file signatures and returns unavailable rather than a canned diagnosis when the service is not configured. It does not prescribe pesticide dosages.

Set `GEMINI_API_KEY` in the server's environment (for local development, the root `.env.local`). Never use a `NEXT_PUBLIC_` prefix for this secret. `GET /api/health` reports whether the key is configured; it does not confirm that the key is valid or that Gemini is reachable.

### 7. Pesticide Intelligence
- `GET /api/pesticides` — Lists pesticides with category and verification filters.
- `GET /api/pesticides/search?q=<query>&category=<cat>&verifiedOnly=<bool>` — Full-text search on name, active ingredient, crop, and pest.
- `GET /api/pesticides/:id` — Detailed view with CIBRC dosage, withholding period, and PPE gear.

### 8. Farmer Community
- `GET /api/reviews?crop=<crop>` — Lists farmer field experiences.
- `POST /api/reviews` — Submits a new review with ratings, crop, and optional video URL.
- `GET /api/reviews/:id` — Retrieves specific review details.
- `POST /api/reviews/:id/comments` — Adds a farmer community comment.
- `POST /api/reviews/:id/vote` — Upvotes a review as helpful.
- `POST /api/reviews/:id/report` — Submits inappropriate content for moderation.

### 9. Smart Crop Selling & Market Intelligence
- `GET /api/markets` — Lists agricultural mandis (APMC), e-NAM centers, and RBKs.
- `GET /api/markets/nearby?lat=<lat>&lon=<lon>` — Locates nearest agricultural selling centers.
- `GET /api/markets/:id` — Detailed mandi specifications.
- `GET /api/market-prices?commodity=<name>&district=<name>&market=<name>&variety=<name>&grade=<name>&limit=<n>&offset=<n>` — Live Andhra Pradesh AGMARKNET records from data.gov.in when available. API key configuration, upstream failures, and empty results are reported as unavailable; recent successful results may be returned as cached. No market price is synthesized.
- `GET /api/market-prices/trends` — Sample trend visualization data; not a live historical AGMARKNET feed.
- `GET /api/msp` — Official Government notified Minimum Support Prices (MSP) with CACP source.
- `POST /api/markets/estimate` — Calculates gross market value and net returns from the farmer-entered price, transport cost, and other deductions.

### 10. Notifications
- `GET /api/notifications` — Lists in-app severe weather and farming alerts.
- `PUT /api/notifications/:id/read` — Marks a notification as read.

---

## 🗄️ Database Schema (`supabase/migrations/001_initial_schema.sql`)

The application and schema use one farm model: `farm_profiles` and its child table `farm_crops` (not separate `farms`/`crops` tables). The database uses Row Level Security (RLS):
1. `profiles` — User account details and language preference (`te` or `en`).
2. `locations` — Complete Andhra Pradesh State → District → Mandal → Village hierarchy.
3. `farm_profiles` — Soil classification, acreage, irrigation method.
4. `farm_crops` — Associated crops, sowing dates, and growth stages.
5. `regional_agriculture` — Regional baseline agronomic characteristics.
6. `conversations` & `conversation_messages` — AI advisor chat histories.
7. `weather_alerts` — Severe weather warnings and farmer advisories.
8. `pesticides` & `pesticide_approved_uses` — CIBRC / ANGRAU registered chemical directory.
9. `pesticide_reviews`, `review_comments`, `review_votes`, `content_reports` — Community peer reviews.
10. `markets`, `market_prices`, `msp_rates` — Mandis, daily auction rates, and MSP data.
11. `notifications` — Alert inbox for farmers.
12. `custom_settlements`, `community_posts`, `community_comments`, and `user_preferences` — User-owned settlements, public/private community content, and preferences.

Migration 002 installs owner/public-content policies and profile/author triggers. Migration 003 installs authenticated farm-snapshot and preference RPCs and the review-vote RPC. Review vote rows are not readable by clients; the vote RPC returns only the total. Farm snapshot updates intentionally replace the submitted crop and custom-settlement lists, so callers must send complete snapshots.

## Supabase setup

1. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` to the project base URL (not a `/rest/v1` endpoint) and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the publishable/anon key. The app normalizes the standard `/rest/v1` suffix if present. Do not add a service-role key to the browser app.
2. For a new, empty project, apply `001_initial_schema.sql`, `002_auth_user_data_and_rls.sql`, and `003_farm_and_review_rpc.sql` in order. RLS must remain enabled.
3. If migration 001 was partially applied and failed on an existing public-read policy, do not replay it blindly. Run the entire `supabase/recovery/complete_partial_setup.sql` script once in the Supabase SQL Editor. It checks for required baseline tables and duplicate farm ownership, restores missing public-read policies, and applies the 002/003 schema and RPCs in one transaction without dropping tables or records. It aborts without applying changes if its preflight detects a blocker.
4. Configure Supabase Auth email confirmation and the site's allowed redirect URLs for local development and production.
5. Restart the Next.js server after changing environment variables.

Running SQL in the dashboard does not update the Supabase CLI migration history. Reconcile migration history before using `supabase db push` so the CLI does not replay already-applied migrations. The repository does not apply migrations automatically. Build validation alone does not verify a live project's schema, authentication settings, database operations, or two-user isolation; those require applying the migrations and testing with real project accounts.

---

## ⚡ Running the Full-Stack Application

### Install Dependencies:
```bash
npm install
```

### Build for Production:
```bash
npm run build
```

### Start Server:
```bash
npm start
```
The server will start at `http://localhost:3000` with all frontend pages and backend API routes available.
