# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev                  # Start dev server (port configurable via PORT env var)
npm run build                # TypeScript compile + Vite build
npm run lint                 # ESLint (flat config, TypeScript + React hooks)

# Unit/integration tests (Vitest + jsdom + MSW)
npm run test                 # Watch mode
npm run test:run             # Single run
npm run test:coverage        # With coverage
npm run test:ui              # Vitest UI

# E2E tests (Playwright, Chromium only)
npm run test:e2e             # Headless
npm run test:e2e:ui          # Interactive UI
npm run test:e2e:report      # Show last HTML report

# Supabase local dev
npx supabase start           # Start local Supabase stack
npx supabase db reset        # Reapply all migrations + seed.sql
npx supabase db diff         # Generate migration from schema changes
npx supabase functions serve # Serve Edge Functions locally
```

To run a single unit test file: `npm run test:run -- src/path/to/file.test.ts`

E2E tests require `E2E_TEST_PASSWORD` in `.env.local` and a running dev server.

## Architecture

### Stack
React 19 + React Router 7 + TypeScript + Vite + Tailwind CSS 4 + Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions) + Vitest + Playwright

Path alias: `@/` → `src/`

### Data Flow
All database access goes through `src/services/` — components never call Supabase directly. Services return typed domain objects (mapped via `src/lib/typeMappers.ts`) and throw custom service error classes (e.g. `ProfileServiceError`, `SkillsServiceError`).

### Context Providers
Seven providers nested in `App.tsx` (outer → inner): `ToastProvider` → `CookieConsentProvider` → `AuthProvider` → `SkillsProvider` → `SwapsProvider` → `MessagesProvider` → `ReviewsProvider`. Realtime subscriptions live in `SwapsProvider` and `MessagesProvider`.

### Routing (26 routes)
`src/router.tsx` uses React Router 7. Protected routes wrap page components with `<AuthGuard>` inside stable named wrapper components (e.g. `GuardedCreateListing`) — this prevents remounting on search param changes.

### Auth
`AuthContext` manages auth state via `authReducer`. Supports email/password and OAuth (Google, Apple). Cloudflare Turnstile CAPTCHA protects auth forms and the report submission endpoint. New OAuth users go through an onboarding flow (`needsOnboarding` state).

### Dual Seed Data
There are two separate seed data locations:
- `supabase/seed.sql` — actual DB seed, applied by `supabase db reset`
- `src/data/*.ts` — frontend-only mock data

**Always update both** when changing seed data. DB IDs use predictable UUIDs: users `00...00N`, skills `10...0N`, conversations `20...0N`, swaps `30...0N`, messages `40...0N`, reviews `50...0N`.

### Supabase
- 32 ordered SQL migrations in `supabase/migrations/`
- 3 Deno Edge Functions: `delete-account` (GDPR), `notify-swap-proposal` (email), `submit-report` (Turnstile server-side verification)
- Full-text skill search uses a parameterised RPC `search_skill_listings` (migration 031) — never string-interpolate search queries
- PII columns (email, postcode) accessed only via SECURITY DEFINER RPCs
- RLS enabled on all tables; all functions use fixed `search_path`

### Testing Approach
- Unit/integration tests use MSW for mocking Supabase API calls — handlers in `src/test/mocks/handlers.ts`, setup in `src/test/setup.ts`
- E2E auth state is shared: `auth.setup.ts` logs in once and saves session to `e2e/fixtures/.auth.json` (gitignored)
- Vitest environment variables for test mocks are set in `vitest.config.ts`

### Security Notes
- `vercel.json` sets CSP, HSTS, X-Frame-Options, and other security headers — update CSP when adding new external domains
- BugSnag error reporting only logs `{code}`, never `details`/`hint`/`message` to avoid leaking PII
- BugSnag and GA4 are only initialised after cookie consent
