# User Presence: Last Seen & Online Status

**Date:** 2026-02-20
**Status:** Approved

## Summary

Display when a user last visited the application — showing a real-time "Online now" indicator when they are active, and a "Last seen X ago" timestamp when they are not.

## Approach

Supabase Realtime Presence (live status) + `last_seen_at` DB column (persistent fallback). Both pieces are independent and complement each other.

## Database

Add one column to the `profiles` table:

```sql
last_seen_at TIMESTAMPTZ DEFAULT NULL
```

- `NULL` = user predates the feature (render nothing)
- Updated on login and every 60 seconds via heartbeat
- No RLS changes required (users update their own row)

Migration file: `supabase/migrations/012_user_presence.sql`

## Presence & Heartbeat Hook

A `usePresence` hook (`src/hooks/usePresence.ts`):

- **On mount**: joins `presence:global` Realtime channel with `userId`, writes `last_seen_at` immediately
- **Heartbeat**: `setInterval` every 60s updates `last_seen_at` in DB and refreshes presence sync
- **On unmount**: leaves the presence channel (tab close / sign-out)
- **Exposes**: `getPresenceState(userId) => { isOnline: boolean, lastSeenAt: string | null }`

Initialised once in `AuthContext` for the lifetime of the session.

## UI Component

A reusable `UserPresence` component (`src/components/UserPresence.tsx`):

| State | Indicator | Text |
|-------|-----------|------|
| Online | Green dot | "Online now" |
| Offline | Grey dot | "Last seen 2 hours ago" |
| Never seen (null) | — | Nothing rendered |

Relative time formatting via a new `formatRelativeTime` helper in `src/lib/formatters.ts`.

## Placement

- **SkillDetailPage** (`src/pages/SkillDetailPage.tsx`) — below neighbourhood in the user sidebar
- **ProfilePage** (`src/pages/ProfilePage.tsx`) — next to "Member since" in the profile header

## Seed Data

Update `supabase/seed.sql` to populate `last_seen_at` with realistic values for test users.

## Out of Scope

- Skill card listings (not requested)
- Per-page presence (tracking which page a user is on)
- Push notifications for presence changes
