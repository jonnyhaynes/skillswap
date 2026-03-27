# User Presence (Last Seen + Online Status) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Show a real-time green "Online now" dot and a "Last seen X ago" timestamp on the SkillDetailPage sidebar and ProfilePage header.

**Architecture:** Supabase Realtime Presence tracks who is currently online; a `last_seen_at` column in `profiles` provides a persistent fallback for offline users. A `usePresence` hook manages both: joining the presence channel on login and running a 60s heartbeat to keep `last_seen_at` fresh. A reusable `UserPresence` component renders the appropriate state wherever needed.

**Tech Stack:** React 19, Supabase JS v2 (Realtime Presence + direct DB update), TypeScript, Tailwind CSS 4

---

### Task 1: Database migration — add `last_seen_at` to profiles

**Files:**
- Create: `supabase/migrations/013_user_presence.sql`

**Step 1: Create the migration file**

```sql
-- supabase/migrations/013_user_presence.sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NULL;

-- Allow users to update their own last_seen_at
CREATE POLICY "Users can update own last_seen_at"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

> Note: A general update policy may already exist. If `supabase db reset` errors with "policy already exists", wrap in `DROP POLICY IF EXISTS` first and check `001_schema.sql` for the existing policy name.

**Step 2: Apply the migration**

```bash
cd /Users/jonnyhaynes/Projects/claude/skillswap
supabase db reset
```

Expected: migration runs without error, seed data loads.

**Step 3: Commit**

```bash
git add supabase/migrations/013_user_presence.sql
git commit -m "feat: add last_seen_at column to profiles"
```

---

### Task 2: Update TypeScript types

**Files:**
- Modify: `src/types/database.ts` — add `last_seen_at` to ProfileRow/Update
- Modify: `src/types/user.ts` — add `lastSeenAt` to User interface
- Modify: `src/lib/typeMappers.ts` — map `last_seen_at` ↔ `lastSeenAt`

**Step 1: Update `src/types/database.ts` — ProfileRow**

Find the `profiles` Row block (around line 53) and add after `updated_at`:

```typescript
last_seen_at: string | null
```

Find the `profiles` Update block (around line 79) and add after `updated_at`:

```typescript
last_seen_at?: string | null
```

Also find the `ProfileRow` and `ProfileUpdate` type aliases (search for `export type ProfileRow`) and confirm they reference the `Database['public']['Tables']['profiles']` Row/Update — no change needed there if they use the Database type directly.

**Step 2: Update `src/types/user.ts`**

Add `lastSeenAt` after `joinedAt`:

```typescript
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  bio: string;
  neighbourhood: string;
  postcode: string;
  joinedAt: string;
  lastSeenAt: string | null;   // <-- add this
  isVerifiedNeighbour: boolean;
  skillsOffered: string[];
  skillsWanted: string[];
}
```

**Step 3: Update `src/lib/typeMappers.ts` — `mapProfileToUser`**

Add mapping after `joinedAt`:

```typescript
export function mapProfileToUser(profile: ProfileRow): User {
  return {
    id: profile.id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: profile.email,
    avatarUrl: profile.avatar_url,
    bio: profile.bio,
    neighbourhood: profile.neighbourhood,
    postcode: profile.postcode,
    joinedAt: profile.joined_at,
    lastSeenAt: profile.last_seen_at ?? null,  // <-- add this
    isVerifiedNeighbour: profile.is_verified_neighbour,
    skillsOffered: [],
    skillsWanted: [],
  }
}
```

**Step 4: Check for TypeScript errors**

```bash
cd /Users/jonnyhaynes/Projects/claude/skillswap
npx tsc --noEmit
```

Expected: no errors. Fix any that appear (they will be places that construct a `User` object without `lastSeenAt` — add `lastSeenAt: null` to each).

**Step 5: Commit**

```bash
git add src/types/database.ts src/types/user.ts src/lib/typeMappers.ts
git commit -m "feat: add lastSeenAt to User type and DB mappings"
```

---

### Task 3: Add `formatRelativeTime` utility

**Files:**
- Modify: `src/utils/formatDate.ts`

**Step 1: Add the function**

Append to `src/utils/formatDate.ts`:

```typescript
/**
 * Returns a human-friendly relative time string.
 * e.g. "Just now", "5 minutes ago", "3 hours ago", "2 days ago", "4 weeks ago"
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)

  if (diffSeconds < 60) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`
}
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
git add src/utils/formatDate.ts
git commit -m "feat: add formatRelativeTime utility"
```

---

### Task 4: Create `usePresence` hook

**Files:**
- Create: `src/hooks/usePresence.ts`

**Step 1: Create the hook**

```typescript
// src/hooks/usePresence.ts
import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const HEARTBEAT_INTERVAL_MS = 60_000
const ONLINE_THRESHOLD_MS = 2 * 60_000 // 2 minutes grace period

interface PresenceState {
  isOnline: boolean
  lastSeenAt: string | null
}

// Module-level map so presence data is accessible outside the hook
// without needing context. Keyed by userId.
const presenceMap = new Map<string, { onlineAt: number }>()

/**
 * Call once at the top level (inside AuthProvider) when a user is authenticated.
 * Manages Realtime Presence channel membership and last_seen_at heartbeat.
 */
export function usePresence(userId: string | null) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const updateLastSeen = useCallback(async () => {
    if (!userId) return
    await supabase
      .from('profiles')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', userId)
  }, [userId])

  useEffect(() => {
    if (!userId) return

    // Write last_seen_at immediately on mount
    updateLastSeen()

    // Join presence channel
    const channel = supabase.channel('presence:global', {
      config: { presence: { key: userId } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ online_at: number }>()
        // Rebuild our local map from Supabase presence state
        presenceMap.clear()
        for (const [key, presences] of Object.entries(state)) {
          // presences is an array; take the most recent
          const latest = presences[presences.length - 1] as { online_at: number }
          if (latest) presenceMap.set(key, { onlineAt: latest.online_at })
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: Date.now() })
        }
      })

    channelRef.current = channel

    // Heartbeat: update last_seen_at every 60s
    heartbeatRef.current = setInterval(() => {
      updateLastSeen()
      channel.track({ online_at: Date.now() })
    }, HEARTBEAT_INTERVAL_MS)

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [userId, updateLastSeen])
}

/**
 * Check presence state for any user.
 * isOnline: true if they are in the presence channel right now.
 * lastSeenAt: from the DB (passed in from the User object).
 */
export function getPresenceState(
  userId: string,
  lastSeenAt: string | null
): PresenceState {
  const entry = presenceMap.get(userId)
  const isOnline = entry
    ? Date.now() - entry.onlineAt < ONLINE_THRESHOLD_MS
    : false

  return { isOnline, lastSeenAt }
}
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
git add src/hooks/usePresence.ts
git commit -m "feat: add usePresence hook for Realtime Presence and last_seen_at heartbeat"
```

---

### Task 5: Initialise `usePresence` in `AuthProvider`

**Files:**
- Modify: `src/context/AuthContext.tsx`

**Step 1: Import `usePresence`**

Add to the imports at the top of `AuthContext.tsx`:

```typescript
import { usePresence } from '@/hooks/usePresence'
```

**Step 2: Call the hook inside `AuthProvider`**

Add this line after the `useReducer` call (line 110, after `const [state, dispatch] = useReducer(...)`):

```typescript
usePresence(state.currentUser?.id ?? null)
```

This is all that's needed — the hook handles channel lifecycle automatically.

**Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 4: Commit**

```bash
git add src/context/AuthContext.tsx
git commit -m "feat: initialise usePresence in AuthProvider"
```

---

### Task 6: Create `UserPresence` component

**Files:**
- Create: `src/components/ui/UserPresence.tsx`

**Step 1: Create the component**

```typescript
// src/components/ui/UserPresence.tsx
import { getPresenceState } from '@/hooks/usePresence'
import { formatRelativeTime } from '@/utils/formatDate'

interface UserPresenceProps {
  userId: string
  lastSeenAt: string | null
  className?: string
}

export function UserPresence({ userId, lastSeenAt, className = '' }: UserPresenceProps) {
  const { isOnline } = getPresenceState(userId, lastSeenAt)

  if (!isOnline && !lastSeenAt) {
    // User predates the feature — render nothing
    return null
  }

  return (
    <span className={`flex items-center gap-1.5 ${className}`}>
      <span
        className={`inline-block w-2 h-2 rounded-full shrink-0 ${
          isOnline ? 'bg-green-500' : 'bg-slate-300'
        }`}
        aria-hidden="true"
      />
      <span className="text-sm text-slate-500">
        {isOnline ? 'Online now' : `Last seen ${formatRelativeTime(lastSeenAt!)}`}
      </span>
    </span>
  )
}
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
git add src/components/ui/UserPresence.tsx
git commit -m "feat: add UserPresence component"
```

---

### Task 7: Add `UserPresence` to `SkillDetailPage` sidebar

**Files:**
- Modify: `src/pages/SkillDetailPage.tsx`

**Step 1: Import `UserPresence`**

Add to imports at the top of `SkillDetailPage.tsx`:

```typescript
import { UserPresence } from '@/components/ui/UserPresence'
```

**Step 2: Add `UserPresence` below the neighbourhood paragraph**

Find this block (around line 203):

```tsx
<p className="text-sm text-slate-500">{listingUser.neighbourhood}</p>
```

Add the `UserPresence` component directly after it:

```tsx
<p className="text-sm text-slate-500">{listingUser.neighbourhood}</p>
<div className="mt-1 flex justify-center">
  <UserPresence userId={listingUser.id} lastSeenAt={listingUser.lastSeenAt} />
</div>
```

**Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 4: Commit**

```bash
git add src/pages/SkillDetailPage.tsx
git commit -m "feat: show user presence on SkillDetailPage sidebar"
```

---

### Task 8: Add `UserPresence` to `ProfileHeader`

**Files:**
- Modify: `src/components/profile/ProfileHeader.tsx`

**Step 1: Import `UserPresence`**

Add to imports at the top of `ProfileHeader.tsx`:

```typescript
import { UserPresence } from '@/components/ui/UserPresence'
```

**Step 2: Add `UserPresence` after the "Member since" paragraph**

Find this block (line 58–60):

```tsx
<p className="text-sm text-slate-500 mt-1">
  Member since {formatDate(user.joinedAt)}
</p>
```

Add `UserPresence` directly after it:

```tsx
<p className="text-sm text-slate-500 mt-1">
  Member since {formatDate(user.joinedAt)}
</p>
<div className="mt-1">
  <UserPresence userId={user.id} lastSeenAt={user.lastSeenAt} />
</div>
```

**Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 4: Commit**

```bash
git add src/components/profile/ProfileHeader.tsx
git commit -m "feat: show user presence on ProfileHeader"
```

---

### Task 9: Update seed data with realistic `last_seen_at` values

**Files:**
- Modify: `supabase/seed.sql`

**Step 1: Update the profiles UPDATE statements**

In `supabase/seed.sql`, find each profile UPDATE block. They look like:

```sql
UPDATE public.profiles SET
  avatar_url = '...',
  bio = '...',
  is_verified_neighbour = ...,
  joined_at = '...'
WHERE id = '00000000-0000-0000-0000-000000000001';
```

Add `last_seen_at` to each UPDATE. Use a spread of realistic values:

```sql
-- User 1 (Alex Chen) - online recently
UPDATE public.profiles SET
  last_seen_at = NOW() - INTERVAL '2 minutes'
WHERE id = '00000000-0000-0000-0000-000000000001';

-- User 2 - seen today
UPDATE public.profiles SET
  last_seen_at = NOW() - INTERVAL '3 hours'
WHERE id = '00000000-0000-0000-0000-000000000002';

-- User 3 - seen yesterday
UPDATE public.profiles SET
  last_seen_at = NOW() - INTERVAL '1 day'
WHERE id = '00000000-0000-0000-0000-000000000003';

-- User 4 - seen a few days ago
UPDATE public.profiles SET
  last_seen_at = NOW() - INTERVAL '3 days'
WHERE id = '00000000-0000-0000-0000-000000000004';

-- User 5 - seen last week
UPDATE public.profiles SET
  last_seen_at = NOW() - INTERVAL '6 days'
WHERE id = '00000000-0000-0000-0000-000000000005';

-- User 6 - seen 2 weeks ago
UPDATE public.profiles SET
  last_seen_at = NOW() - INTERVAL '2 weeks'
WHERE id = '00000000-0000-0000-0000-000000000006';

-- User 7 - NULL (predates feature)
-- (no UPDATE needed, default is NULL)

-- User 8 - seen 1 month ago
UPDATE public.profiles SET
  last_seen_at = NOW() - INTERVAL '1 month'
WHERE id = '00000000-0000-0000-0000-000000000008';
```

> Note: Add these `last_seen_at` values INTO the existing UPDATE statements for each user (add the column to the SET clause), rather than running separate UPDATE statements. This keeps seed.sql clean.

**Step 2: Reset and verify**

```bash
supabase db reset
```

Expected: no errors.

**Step 3: Commit**

```bash
git add supabase/seed.sql
git commit -m "seed: add last_seen_at values to profiles"
```

---

### Task 10: Manual smoke test

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Test SkillDetailPage**

1. Navigate to any skill listing page (e.g. `/skills/...`)
2. Check the sidebar below the user's neighbourhood — you should see either:
   - Green dot + "Online now" (if logged in as that user in another tab), OR
   - Grey dot + "Last seen X ago"

**Step 3: Test ProfilePage**

1. Navigate to any user profile (e.g. `/profile/00000000-0000-0000-0000-000000000001`)
2. Check below "Member since …" — you should see the presence indicator

**Step 4: Test online state**

1. Log in as any user
2. Open their profile page in a second tab
3. You should see "Online now" with a green dot

**Step 5: Test null state**

1. Check User 7 (no `last_seen_at` in seed) — presence component should render nothing

---

### Task 11: Final TypeScript and build check

**Step 1: TypeScript**

```bash
npx tsc --noEmit
```

Expected: zero errors.

**Step 2: Build**

```bash
npm run build
```

Expected: build succeeds with no errors.

**Step 3: Commit if anything was fixed**

```bash
git add -p
git commit -m "fix: resolve any presence type issues"
```
