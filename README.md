# SkillSwap

![Status: Alpha](https://img.shields.io/badge/status-alpha-orange)

> ⚠️ **Alpha** — this project is in active early development. Features, APIs, and the database schema may change without notice, and it is not yet recommended for production use.

A community skill-swapping platform that connects neighbours to exchange knowledge and services. Users can offer skills, request skills, propose swaps, and communicate via real-time messaging — all within their local community.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Testing](#testing)
- [Key Concepts](#key-concepts)

---

## Features

- **Skill Listings** — Create and manage listings for skills you offer or want to learn, with categories, levels, tags, and availability
- **Browse & Search** — Discover skills by category, level, listing type, and neighbourhood proximity
- **Swap Proposals** — Propose skill exchanges with other users, with a full lifecycle: pending → in progress → completed/cancelled
- **Real-time Messaging** — Conversation threads tied to swaps, with Supabase Realtime powering live updates
- **Reviews & Ratings** — Leave star ratings and comments after a swap completes; one review per user per swap
- **Verified Neighbour Badge** — Automatically awarded to users with 5+ completed swaps and a perfect 5.0 average rating
- **User Reporting** — Report users for harassment, spam, or inappropriate behaviour
- **Neighbourhood Discovery** — Postcode-based neighbourhood lookup via the Ordnance Survey Names API
- **Avatar Uploads** — Profile picture management via Supabase Storage
- **OAuth + Email Auth** — Sign up with email/password or social providers (Google, GitHub, etc.) with an onboarding flow for new OAuth users
- **Bot Protection** — Cloudflare Turnstile integration on auth forms
- **Cookie Consent** — GDPR-compliant consent banner before enabling analytics/monitoring
- **Account Deletion** — GDPR-compliant self-service account deletion with data export (UK GDPR Articles 17 & 20), review anonymisation, and active swap auto-cancellation
- **Mailing List** — Email newsletter subscription in footer
- **Error Monitoring** — BugSnag integration (activated post-consent)
- **Analytics** — Google Analytics 4
- **User Presence** — Tracks `last_seen_at` on each profile

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, React Router 7 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| Backend / DB | Supabase (PostgreSQL, Auth, Realtime, Storage) |
| Unit Testing | Vitest, Testing Library, MSW |
| E2E Testing | Playwright |
| Error Monitoring | BugSnag |
| Analytics | Google Analytics 4 |
| Bot Protection | Cloudflare Turnstile |
| Neighbourhood API | Ordnance Survey Names API |

---

## Project Structure

```
skillswap/
├── src/
│   ├── components/
│   │   ├── auth/          # Auth guards, social login, forgot password
│   │   ├── contact/       # Contact form
│   │   ├── layout/        # Root layout, navigation
│   │   ├── messages/      # Conversation list, message thread, bubbles
│   │   ├── profile/       # Profile form, verified badge
│   │   ├── reports/       # Report user button and modal
│   │   ├── reviews/       # Review cards, forms, star ratings
│   │   ├── skills/        # Search bar, skill badges, skill forms
│   │   ├── swaps/         # Swap cards, proposal form
│   │   └── ui/            # Shared UI: Avatar, Badge, Card, Modal, Toast, etc.
│   ├── context/           # React Contexts: Auth, Skills, Swaps, Messages, Reviews, Toast, CookieConsent
│   ├── data/              # Frontend mock/seed data (not used by Supabase)
│   ├── hooks/             # Custom hooks: useAuth, useSkills, useSwaps, useMessages, useReviews, etc.
│   ├── lib/               # Supabase client, BugSnag setup, error helpers, analytics
│   ├── pages/             # Route-level page components
│   ├── services/          # Supabase data access layer (profiles, skills, swaps, messages, reviews, etc.)
│   ├── types/             # TypeScript types (User, Skill, Swap, Message, Review, etc.)
│   └── utils/             # Helpers: cn, distance, filterSkills, sortSkills, formatRelativeTime, etc.
├── supabase/
│   ├── functions/         # Edge Functions (notify-swap-proposal, delete-account, submit-report)
│   ├── migrations/        # Ordered SQL migrations (001–032)
│   └── seed.sql           # Database seed data
└── e2e/                   # Playwright end-to-end tests
```

### Architecture Notes

**Path Alias**: The project uses `@/` as an alias for the `src/` directory (configured in `vite.config.ts`):
```ts
import { supabase } from '@/lib/supabase'
import type { User } from '@/types/user'
```

**Services Layer**: All Supabase database interactions go through `src/services/`. Never call the `supabase` client directly from components — always use the appropriate service function. This provides a consistent data access layer and makes testing easier.

---

## Getting Started

### Prerequisites

- Node.js 20+
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Docker (for local Supabase)

### 1. Clone and install

```bash
git clone <repo-url>
cd skillswap
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in the values — see [Environment Variables](#environment-variables) below.

### 3. Start local Supabase

```bash
supabase start
```

This starts a local PostgreSQL database, Auth server, Storage, and Realtime. On first run it applies all migrations and seeds from `supabase/seed.sql`.

To reset the database (re-runs migrations + seed):

```bash
supabase db reset
```

### 4. Start the dev server

```bash
npm run dev
```

The app runs at `http://localhost:5173` (configurable via `PORT` environment variable).

---

## Environment Variables

Copy `.env.example` to `.env.local` and set the following:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL (or `http://localhost:54321` locally) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_BUGSNAG_API_KEY` | BugSnag API key for error monitoring |
| `MAILTRAP_PASSWORD` | Mailtrap password for local email testing |
| `VITE_CLOUDFLARE_TURNSTILE_SITEKEY` | Cloudflare Turnstile site key (bot protection) |
| `CLOUDFLARE_TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key |
| `VITE_OS_NAMES_API_KEY` | Ordnance Survey Names API key (free at [osdatahub.os.uk](https://osdatahub.os.uk)) |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics 4 measurement ID |
| `E2E_TEST_PASSWORD` | Password for the E2E test user account |

> BugSnag and Google Analytics are only initialised after the user accepts the cookie consent banner.

---

## Database

### Schema overview

| Table | Purpose |
|---|---|
| `profiles` | Extends `auth.users` with name, bio, neighbourhood, postcode, avatar, verification status |
| `skill_listings` | Skills offered or wanted, with category, level, tags, availability |
| `conversations` | Messaging threads between two participants, optionally tied to a swap |
| `messages` | Individual messages within a conversation |
| `swap_proposals` | Skill exchange proposals with full status lifecycle |
| `reviews` | Post-swap ratings (1–5 stars) with one review per user per swap |
| `neighbourhoods` | Neighbourhood reference data with coordinates |
| `contact_enquiries` | Public contact form submissions |
| `user_reports` | User-submitted reports for moderation |
| `mailing_list_subscribers` | Email newsletter subscriptions |

### Migrations

Migrations live in `supabase/migrations/` and are applied in order by `supabase db reset`. There are 32 migrations covering schema, security, and features:

**Key migrations:**
- `001_schema.sql` — Core tables, RLS policies, triggers, Realtime
- `002_neighbourhoods.sql` — Neighbourhoods reference table
- `005_avatar_storage.sql` — Supabase Storage bucket for avatars
- `008_user_reports.sql` — User reporting system
- `011_verified_neighbour_trigger.sql` — Auto-calculate Verified Neighbour status
- `012_remove_accepted_status.sql` — Remove `accepted` swap status
- `013_user_presence.sql` — Add `last_seen_at` to profiles
- `014_account_deletion.sql` — Account deletion Edge Function support
- `018_profile_pii_access_control.sql` — PII access controls
- `020_security_definer_search_path.sql` — Security definer search path hardening
- `022-024_*.sql` — RLS policy fixes for messages, conversations, reviews
- `027_auto_complete_swap.sql` — Auto-complete swap when both parties confirm
- `031_search_skill_listings_rpc.sql` — Full-text search RPC function
- `032_mailing_list_subscribers.sql` — Mailing list subscribers table

Run `ls supabase/migrations/` to see all migrations.

### Seed data

`supabase/seed.sql` is the source of truth for local development data. It uses predictable UUIDs:

- Users: `00000000-0000-0000-0000-00000000000N`
- Skills: `10000000-0000-0000-0000-00000000000N`
- Conversations: `20000000-...`
- Swaps: `30000000-...`
- Messages: `40000000-...`
- Reviews: `50000000-...`

> **Note:** `src/data/*.ts` files contain frontend-only mock data used during initial development. The Supabase database uses `supabase/seed.sql` exclusively. If you modify seed data, update both.

### Edge Functions

Supabase Edge Functions (Deno runtime) in `supabase/functions/`:

| Function | Purpose |
|---|---|
| `notify-swap-proposal` | Sends email notifications when new swap proposals are created (triggered via database webhook) |
| `delete-account` | GDPR-compliant account deletion with data export, review anonymisation, and swap cancellation |
| `submit-report` | Server-side Cloudflare Turnstile verification for user reports (prevents API bypass) |

Edge Functions require environment variables set in Supabase dashboard or `supabase/.env` for local development.

---

## Testing

### Unit & integration tests (Vitest)

```bash
npm run test          # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage report
npm run test:ui       # Vitest UI
```

Tests use [Testing Library](https://testing-library.com/) and [MSW](https://mswjs.io/) for API mocking.

### End-to-end tests (Playwright)

```bash
npm run test:e2e         # Run all E2E tests
npm run test:e2e:ui      # Playwright UI mode
npm run test:e2e:report  # View last test report
```

E2E specs cover:
- `auth.spec.ts` — sign up, log in, log out
- `profile.spec.ts` — edit profile, avatar upload
- `skills.spec.ts` — create, edit, browse listings
- `swaps.spec.ts` — propose, accept, complete swaps
- `account-settings.spec.ts` — change email, change password
- `account-deletion.spec.ts` — GDPR-compliant account deletion flow

Requires `E2E_TEST_PASSWORD` to be set and the dev server running.

---

## Key Concepts

### Swap lifecycle

```
pending → in_progress → completed
                      → cancelled
       → declined
       → cancelled
```

Both parties must mark a swap complete (`proposer_completed` / `recipient_completed`) before it transitions to `completed`.

### Verified Neighbour

The `is_verified_neighbour` flag on profiles is calculated automatically by a database trigger (`trigger_recalculate_verified_neighbour`) that fires after every review insert. Criteria:

- **5 or more** completed swaps
- **5.0 average** review rating

### Row Level Security

All tables use Supabase RLS. The key rules:
- Profiles, skill listings, and reviews are publicly readable
- Users can only modify their own data
- Conversations and messages are only accessible to participants
- User reports are write-only (no SELECT policy — admin access only)

### Realtime

Messages and conversations use Supabase Realtime subscriptions for live updates. Swap proposals also subscribe to real-time changes.
