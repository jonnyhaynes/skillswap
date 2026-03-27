# Account Deletion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow users to permanently delete their SkillSwap account in compliance with UK GDPR, with data export, review anonymisation, and active swap cancellation.

**Architecture:** A Supabase Edge Function (`delete-account`) handles two actions — `export` (read-only JSON snapshot) and `delete` (atomic DB cleanup via PostgreSQL RPC, then `auth.admin.deleteUser`). The frontend has a two-step confirmation flow at `/settings/account`. All destructive DB changes are atomic; the user can cancel freely until the final confirmation.

**Tech Stack:** Deno (Edge Function), PostgreSQL RPC, React + React Router, Vitest + MSW (unit tests), Playwright (E2E tests)

---

## Reference

- Design doc: `docs/plans/2026-02-24-account-deletion-design.md`
- Existing edge function pattern: `supabase/functions/notify-swap-proposal/index.ts`
- Service layer pattern: `src/services/reviews.ts`
- Router: `src/router.tsx`
- Auth context: `src/context/AuthContext.tsx`
- MSW handlers: `src/test/mocks/handlers.ts`
- Latest migration: `013_user_presence.sql` → next is `014_`

---

## Task 1: Database migration — nullable review FKs + delete_account_data RPC

**Files:**
- Create: `supabase/migrations/014_account_deletion.sql`

The reviews table has `reviewer_id` and `reviewee_id` as NOT NULL FKs. We need them nullable so the RPC can anonymise reviews without deleting them. We also create the `delete_account_data` RPC that the Edge Function will call.

**Step 1: Create the migration file**

```sql
-- supabase/migrations/014_account_deletion.sql

-- Make review FKs nullable so anonymisation can set them to NULL
-- without deleting the review record
ALTER TABLE reviews
  ALTER COLUMN reviewer_id DROP NOT NULL,
  ALTER COLUMN reviewee_id DROP NOT NULL;

-- Atomic cleanup function called by the delete-account Edge Function.
-- Uses SECURITY DEFINER so it runs with the function owner's privileges,
-- allowing updates across rows regardless of RLS.
CREATE OR REPLACE FUNCTION delete_account_data(p_user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cancelled_swap_ids UUID[];
BEGIN
  -- 1. Anonymise reviews this user wrote (keep reviewee_id so the
  --    other party retains their rating; remove reviewer identity + comment)
  UPDATE reviews
  SET reviewer_id = NULL,
      comment     = '[Review removed]'
  WHERE reviewer_id = p_user_id;

  -- 2. Anonymise reviews written about this user (keep reviewer_id so the
  --    reviewer retains their activity record; remove personal association)
  UPDATE reviews
  SET reviewee_id = NULL,
      comment     = '[Review removed]'
  WHERE reviewee_id = p_user_id;

  -- 3. Remove user from conversation participant arrays.
  --    Conversations are preserved so the other party keeps their history.
  UPDATE conversations
  SET participant_ids = array_remove(participant_ids, p_user_id)
  WHERE p_user_id = ANY(participant_ids);

  -- 4. Cancel active swaps and capture their IDs for notification
  WITH cancelled AS (
    UPDATE swap_proposals
    SET status = 'cancelled'
    WHERE (proposer_id = p_user_id OR recipient_id = p_user_id)
      AND status IN ('pending', 'in_progress')
    RETURNING id
  )
  SELECT array_agg(id) INTO v_cancelled_swap_ids FROM cancelled;

  RETURN jsonb_build_object(
    'cancelled_swap_ids', COALESCE(v_cancelled_swap_ids, ARRAY[]::UUID[])
  );
END;
$$;

-- Only the service role (used by the Edge Function) can call this.
-- Revoke from public and authenticated to prevent direct misuse.
REVOKE ALL ON FUNCTION delete_account_data(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION delete_account_data(UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION delete_account_data(UUID) TO service_role;
```

**Step 2: Apply the migration locally**

```bash
supabase db reset
```

Expected: Migration applies cleanly, seed data loads, no errors.

**Step 3: Verify the migration**

```bash
supabase db diff
```

Expected: No pending changes (migration is applied).

**Step 4: Commit**

```bash
git add supabase/migrations/014_account_deletion.sql
git commit -m "feat: add delete_account_data RPC and nullable review FKs"
```

---

## Task 2: Supabase Edge Function — delete-account

**Files:**
- Create: `supabase/functions/delete-account/index.ts`

This function handles both `export` and `delete` actions. Pattern follows `notify-swap-proposal/index.ts`.

**Step 1: Create the edge function**

```typescript
// supabase/functions/delete-account/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify the user's JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // User client — validates the JWT and gives us the user
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Admin client — bypasses RLS for mutations and admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { action, confirmation } = await req.json()

    // ── EXPORT ──────────────────────────────────────────────────────────────
    if (action === 'export') {
      const exportData = await generateExport(supabaseAdmin, user.id)
      return new Response(JSON.stringify(exportData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── DELETE ──────────────────────────────────────────────────────────────
    if (action === 'delete') {
      if (confirmation !== 'DELETE') {
        return new Response(JSON.stringify({ error: 'Confirmation must be the string DELETE' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Step 1: Atomic DB cleanup (anonymise reviews, cancel swaps, update conversations)
      const { error: rpcError } = await supabaseAdmin.rpc('delete_account_data', {
        p_user_id: user.id,
      })
      if (rpcError) throw new Error(`RPC failed: ${rpcError.message}`)

      // Step 2: Delete avatar files from storage
      const { data: avatarFiles } = await supabaseAdmin.storage
        .from('avatars')
        .list(user.id)
      if (avatarFiles && avatarFiles.length > 0) {
        const paths = avatarFiles.map((f) => `${user.id}/${f.name}`)
        await supabaseAdmin.storage.from('avatars').remove(paths)
      }

      // Step 3: Delete the auth user — cascades profiles, skill_listings,
      //         messages, swap_proposals, remaining reviews, user_reports
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
      if (deleteError) throw new Error(`Auth delete failed: ${deleteError.message}`)

      console.log(`Account deleted: ${user.id}`)

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('delete-account error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function generateExport(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  userId: string
): Promise<object> {
  const [
    { data: profile },
    { data: skillListings },
    { data: conversations },
    { data: messages },
    { data: swapProposals },
    { data: reviewsWritten },
    { data: reviewsReceived },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('skill_listings').select('*').eq('user_id', userId),
    supabase.from('conversations').select('*').contains('participant_ids', [userId]),
    supabase.from('messages').select('*').eq('sender_id', userId),
    supabase
      .from('swap_proposals')
      .select('*')
      .or(`proposer_id.eq.${userId},recipient_id.eq.${userId}`),
    supabase.from('reviews').select('*').eq('reviewer_id', userId),
    supabase.from('reviews').select('*').eq('reviewee_id', userId),
  ])

  return {
    exported_at: new Date().toISOString(),
    profile: profile ?? {},
    skill_listings: skillListings ?? [],
    conversations: conversations ?? [],
    messages: messages ?? [],
    swap_proposals: swapProposals ?? [],
    reviews_written: reviewsWritten ?? [],
    reviews_received: reviewsReceived ?? [],
  }
}
```

**Step 2: Verify function structure**

```bash
ls supabase/functions/delete-account/
```

Expected: `index.ts`

**Step 3: Commit**

```bash
git add supabase/functions/delete-account/index.ts
git commit -m "feat: add delete-account edge function"
```

---

## Task 3: Account service layer

**Files:**
- Create: `src/services/account.ts`

Follows the same pattern as `src/services/reviews.ts` — custom error class, typed functions.

**Step 1: Write the failing tests first** (see Task 4 — do Task 4 before this step)

**Step 2: Create the service**

```typescript
// src/services/account.ts
import { supabase } from '../lib/supabase'

export interface AccountExport {
  exported_at: string
  profile: Record<string, unknown>
  skill_listings: Record<string, unknown>[]
  conversations: Record<string, unknown>[]
  messages: Record<string, unknown>[]
  swap_proposals: Record<string, unknown>[]
  reviews_written: Record<string, unknown>[]
  reviews_received: Record<string, unknown>[]
}

export class AccountServiceError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message)
    this.name = 'AccountServiceError'
  }
}

export async function exportAccountData(): Promise<AccountExport> {
  const { data, error } = await supabase.functions.invoke('delete-account', {
    body: { action: 'export' },
  })

  if (error) {
    throw new AccountServiceError(error.message ?? 'Failed to export account data')
  }

  return data as AccountExport
}

export async function deleteAccount(confirmation: string): Promise<void> {
  if (confirmation !== 'DELETE') {
    throw new AccountServiceError('Confirmation must be the string DELETE')
  }

  const { error } = await supabase.functions.invoke('delete-account', {
    body: { action: 'delete', confirmation },
  })

  if (error) {
    throw new AccountServiceError(error.message ?? 'Failed to delete account')
  }
}
```

---

## Task 4: MSW handlers + account service unit tests

**Files:**
- Modify: `src/test/mocks/handlers.ts`
- Create: `src/services/__tests__/account.test.ts`

**Step 1: Add MSW handlers**

In `src/test/mocks/handlers.ts`, add these handlers to the existing `handlers` array:

```typescript
// Add to the top-level imports (already present in the file):
// import { http, HttpResponse } from 'msw'

// Add these to the handlers array:

export const mockAccountExport = {
  exported_at: '2024-01-01T00:00:00.000Z',
  profile: { id: 'user-1', first_name: 'Test', email: 'test@example.com' },
  skill_listings: [],
  conversations: [],
  messages: [],
  swap_proposals: [],
  reviews_written: [],
  reviews_received: [],
}

// In the handlers array:
http.post('https://test.supabase.co/functions/v1/delete-account', async ({ request }) => {
  const body = await request.json() as { action: string; confirmation?: string }

  if (body.action === 'export') {
    return HttpResponse.json(mockAccountExport)
  }

  if (body.action === 'delete' && body.confirmation === 'DELETE') {
    return HttpResponse.json({ success: true })
  }

  return HttpResponse.json({ error: 'Invalid request' }, { status: 400 })
}),
```

**Step 2: Write the failing tests**

```typescript
// src/services/__tests__/account.test.ts
import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/setup'
import {
  exportAccountData,
  deleteAccount,
  AccountServiceError,
  mockAccountExport,  // exported from handlers for reuse
} from '../account'

describe('exportAccountData', () => {
  it('returns a correctly shaped export object', async () => {
    const result = await exportAccountData()
    expect(result.exported_at).toBeDefined()
    expect(Array.isArray(result.skill_listings)).toBe(true)
    expect(Array.isArray(result.swap_proposals)).toBe(true)
    expect(Array.isArray(result.reviews_written)).toBe(true)
    expect(Array.isArray(result.reviews_received)).toBe(true)
  })

  it('throws AccountServiceError when the edge function returns an error', async () => {
    server.use(
      http.post('https://test.supabase.co/functions/v1/delete-account', () =>
        HttpResponse.json({ error: 'Internal server error' }, { status: 500 })
      )
    )
    await expect(exportAccountData()).rejects.toThrow(AccountServiceError)
  })
})

describe('deleteAccount', () => {
  it('resolves when called with confirmation DELETE', async () => {
    await expect(deleteAccount('DELETE')).resolves.toBeUndefined()
  })

  it('throws AccountServiceError without waiting for the network if confirmation is wrong', async () => {
    await expect(deleteAccount('delete')).rejects.toThrow(AccountServiceError)
    await expect(deleteAccount('')).rejects.toThrow(AccountServiceError)
  })

  it('throws AccountServiceError when the edge function returns an error', async () => {
    server.use(
      http.post('https://test.supabase.co/functions/v1/delete-account', () =>
        HttpResponse.json({ error: 'RPC failed' }, { status: 500 })
      )
    )
    await expect(deleteAccount('DELETE')).rejects.toThrow(AccountServiceError)
  })
})
```

**Step 3: Run tests to verify they fail**

```bash
npm run test:run -- src/services/__tests__/account.test.ts
```

Expected: Tests fail (service file doesn't exist yet).

**Step 4: Implement the service** (Task 3 Step 2 above)

**Step 5: Run tests to verify they pass**

```bash
npm run test:run -- src/services/__tests__/account.test.ts
```

Expected: All tests pass.

**Step 6: Commit**

```bash
git add src/test/mocks/handlers.ts src/services/account.ts src/services/__tests__/account.test.ts
git commit -m "feat: add account service with export and delete, unit tests"
```

---

## Task 5: AccountSettingsPage

**Files:**
- Create: `src/pages/AccountSettingsPage.tsx`

This page has two sections: read-only account info, and the danger zone. It renders the `DeleteAccountFlow` component (Task 6).

**Step 1: Create the page**

```tsx
// src/pages/AccountSettingsPage.tsx
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DeleteAccountFlow from '../components/account/DeleteAccountFlow'

export default function AccountSettingsPage() {
  const { state } = useAuth()
  const user = state.user

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to="/profile/edit"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to profile
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Account settings</h1>

      {/* Account information */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Account information</h2>
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
          <div className="flex justify-between items-center px-4 py-3">
            <span className="text-sm text-gray-500">Email</span>
            <span className="text-sm text-gray-900">{user?.email}</span>
          </div>
          <div className="flex justify-between items-center px-4 py-3">
            <span className="text-sm text-gray-500">Member since</span>
            <span className="text-sm text-gray-900">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </span>
          </div>
        </div>
      </section>

      {/* Danger zone */}
      <section>
        <h2 className="text-lg font-semibold text-red-700 mb-4">Danger zone</h2>
        <div className="border border-red-200 rounded-lg p-6">
          <DeleteAccountFlow />
        </div>
      </section>
    </div>
  )
}
```

---

## Task 6: DeleteAccountFlow component

**Files:**
- Create: `src/components/account/DeleteAccountFlow.tsx`

Two-step confirmation flow. Step 1 shows consequences + download option. Step 2 requires typing "DELETE". Uses `exportAccountData` and `deleteAccount` from the service.

**Step 1: Create the component**

```tsx
// src/components/account/DeleteAccountFlow.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSwaps } from '../../context/SwapsContext'
import { exportAccountData, deleteAccount, AccountServiceError } from '../../services/account'

type Step = 'idle' | 'consequences' | 'confirm'

export default function DeleteAccountFlow() {
  const [step, setStep] = useState<Step>('idle')
  const [confirmation, setConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { signOut } = useAuth()
  const { swaps } = useSwaps()
  const navigate = useNavigate()

  const activeSwapCount = swaps.filter(
    (s) => s.status === 'pending' || s.status === 'in_progress'
  ).length

  async function handleExport() {
    setIsExporting(true)
    setError(null)
    try {
      const data = await exportAccountData()
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'skillswap-data-export.json'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof AccountServiceError ? err.message : 'Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  async function handleDelete() {
    if (confirmation !== 'DELETE') return
    setIsDeleting(true)
    setError(null)
    try {
      await deleteAccount(confirmation)
      await signOut()
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof AccountServiceError ? err.message : 'Deletion failed. Please try again.')
      setIsDeleting(false)
    }
  }

  // ── Idle state ────────────────────────────────────────────────────────────
  if (step === 'idle') {
    return (
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-medium text-gray-900">Delete account</h3>
          <p className="text-sm text-gray-500 mt-1">
            Permanently remove your account and all associated data.
          </p>
        </div>
        <button
          onClick={() => setStep('consequences')}
          className="shrink-0 px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
        >
          Delete account
        </button>
      </div>
    )
  }

  // ── Step 1: Consequences ──────────────────────────────────────────────────
  if (step === 'consequences') {
    return (
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Delete your account</h3>
        <p className="text-sm text-gray-700 mb-4">This will permanently:</p>
        <ul className="text-sm text-gray-700 space-y-2 mb-6 list-disc list-inside">
          <li>Delete your profile and all skill listings</li>
          {activeSwapCount > 0 && (
            <li>
              Cancel{' '}
              <span className="font-medium">
                {activeSwapCount} active swap{activeSwapCount !== 1 ? 's' : ''}
              </span>
            </li>
          )}
          <li>Remove all your messages</li>
          <li>Anonymise reviews you&apos;ve given and received</li>
        </ul>

        <p className="text-sm text-gray-500 mb-6">
          Under UK GDPR you have the right to a copy of your data before deletion.
        </p>

        {error && (
          <p className="text-sm text-red-600 mb-4" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isExporting ? 'Preparing download…' : '↓ Download your data'}
          </button>
          <button
            onClick={() => setStep('confirm')}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Continue →
          </button>
          <button
            onClick={() => setStep('idle')}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // ── Step 2: Typed confirmation ────────────────────────────────────────────
  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-2">Are you absolutely sure?</h3>
      <p className="text-sm text-gray-600 mb-6">
        Type <span className="font-mono font-semibold">DELETE</span> to confirm permanent account
        deletion. This cannot be undone.
      </p>

      <input
        type="text"
        value={confirmation}
        onChange={(e) => setConfirmation(e.target.value)}
        placeholder="Type DELETE to confirm"
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
        autoComplete="off"
        data-testid="delete-confirmation-input"
      />

      {error && (
        <p className="text-sm text-red-600 mb-4" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleDelete}
          disabled={confirmation !== 'DELETE' || isDeleting}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="confirm-delete-button"
        >
          {isDeleting ? 'Deleting…' : 'Permanently delete my account'}
        </button>
        <button
          onClick={() => setStep('consequences')}
          disabled={isDeleting}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
        >
          ← Go back
        </button>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/pages/AccountSettingsPage.tsx src/components/account/DeleteAccountFlow.tsx
git commit -m "feat: add AccountSettingsPage and DeleteAccountFlow component"
```

---

## Task 7: Wire up route and navigation

**Files:**
- Modify: `src/router.tsx`
- Modify: `src/pages/EditProfilePage.tsx`

**Step 1: Add the route in `src/router.tsx`**

In the protected routes section (alongside `/profile/edit`), add:

```tsx
// Add this import at the top:
import AccountSettingsPage from './pages/AccountSettingsPage'

// Add to the protected children array, near the /profile/edit route:
{
  path: '/settings/account',
  element: (
    <AuthGuard>
      <AccountSettingsPage />
    </AuthGuard>
  ),
},
```

**Step 2: Add a link from the edit profile page**

In `src/pages/EditProfilePage.tsx`, find the page heading or action area and add:

```tsx
// Add import at top if not already present:
import { Link } from 'react-router-dom'

// Add somewhere visible near the top of the page content (below the h1 heading):
<div className="flex justify-end mb-4">
  <Link
    to="/settings/account"
    className="text-sm text-gray-500 hover:text-gray-700 underline"
  >
    Account settings
  </Link>
</div>
```

**Step 3: Verify routes work locally**

Start the dev server and visit:
- `http://localhost:5173/settings/account` — should render AccountSettingsPage
- The link from `/profile/edit` should navigate correctly

**Step 4: Commit**

```bash
git add src/router.tsx src/pages/EditProfilePage.tsx
git commit -m "feat: add /settings/account route and nav link from edit profile"
```

---

## Task 8: E2E tests

**Files:**
- Create: `e2e/account-deletion.spec.ts`

Uses the existing authenticated `storageState` from `.auth.json`. The test user is `test@skillswap.test`.

**Important:** The delete test will actually delete the test user's account. This test should be tagged to run in isolation or against a throwaway account. For now, mark it with `test.skip` for the destructive delete test, and include a comment explaining the manual verification steps.

**Step 1: Create the E2E test file**

```typescript
// e2e/account-deletion.spec.ts
import { test, expect } from './fixtures/auth'

test.describe('Account deletion', () => {
  test('navigates to /settings/account and shows the danger zone', async ({ page }) => {
    await page.goto('/settings/account')
    await expect(page.getByRole('heading', { name: 'Account settings' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Danger zone' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Delete account' })).toBeVisible()
  })

  test('shows consequences step when Delete account is clicked', async ({ page }) => {
    await page.goto('/settings/account')
    await page.getByRole('button', { name: 'Delete account' }).click()
    await expect(page.getByRole('heading', { name: 'Delete your account' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Download your data/ })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continue →' })).toBeVisible()
  })

  test('cancel returns to idle state', async ({ page }) => {
    await page.goto('/settings/account')
    await page.getByRole('button', { name: 'Delete account' }).click()
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('button', { name: 'Delete account' })).toBeVisible()
  })

  test('Download your data button triggers a file download', async ({ page }) => {
    await page.goto('/settings/account')
    await page.getByRole('button', { name: 'Delete account' }).click()

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: /Download your data/ }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('skillswap-data-export.json')
  })

  test('confirm button is disabled until DELETE is typed exactly', async ({ page }) => {
    await page.goto('/settings/account')
    await page.getByRole('button', { name: 'Delete account' }).click()
    await page.getByRole('button', { name: 'Continue →' }).click()

    const confirmButton = page.getByTestId('confirm-delete-button')
    await expect(confirmButton).toBeDisabled()

    await page.getByTestId('delete-confirmation-input').fill('delete')
    await expect(confirmButton).toBeDisabled()

    await page.getByTestId('delete-confirmation-input').fill('DELETE')
    await expect(confirmButton).toBeEnabled()
  })

  test('go back returns to consequences step', async ({ page }) => {
    await page.goto('/settings/account')
    await page.getByRole('button', { name: 'Delete account' }).click()
    await page.getByRole('button', { name: 'Continue →' }).click()
    await page.getByRole('button', { name: '← Go back' }).click()
    await expect(page.getByRole('heading', { name: 'Delete your account' })).toBeVisible()
  })

  // Skipped: destructive test — run manually against a throwaway account.
  // To run: create a fresh test user, set E2E_TEST_EMAIL/PASSWORD to that user,
  // run `npx playwright test account-deletion.spec.ts --grep "deletes the account"`
  test.skip('deletes the account, signs out, and redirects to home', async ({ page }) => {
    await page.goto('/settings/account')
    await page.getByRole('button', { name: 'Delete account' }).click()
    await page.getByRole('button', { name: 'Continue →' }).click()
    await page.getByTestId('delete-confirmation-input').fill('DELETE')
    await page.getByTestId('confirm-delete-button').click()

    // Should redirect to home after deletion
    await expect(page).toHaveURL('/', { timeout: 10000 })
  })
})
```

**Step 2: Run E2E tests**

```bash
npm run test:e2e -- account-deletion.spec.ts
```

Expected: All non-skipped tests pass.

**Step 3: Commit**

```bash
git add e2e/account-deletion.spec.ts
git commit -m "feat: add E2E tests for account deletion flow"
```

---

## Task 9: Update README

**Files:**
- Modify: `README.md`

**Step 1: Add account deletion to the Features list**

In the `## Features` section of `README.md`, add a new bullet after the existing GDPR/cookie consent entry:

```markdown
- **Account Deletion** — GDPR-compliant self-service account deletion with data export (UK GDPR Articles 17 & 20), review anonymisation, and active swap auto-cancellation
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add account deletion to README features"
```

---

## Task 10: Run full test suite

**Step 1: Unit tests**

```bash
npm run test:run
```

Expected: All tests pass, no regressions.

**Step 2: E2E tests**

```bash
npm run test:e2e
```

Expected: All non-skipped E2E tests pass.

**Step 3: Final commit if any fixes were needed**

```bash
git add -p
git commit -m "fix: address test failures from account deletion feature"
```

---

## Summary of new files

| File | Purpose |
|---|---|
| `supabase/migrations/014_account_deletion.sql` | Nullable review FKs + `delete_account_data` RPC |
| `supabase/functions/delete-account/index.ts` | Edge Function (export + delete) |
| `src/services/account.ts` | `exportAccountData()`, `deleteAccount()` |
| `src/services/__tests__/account.test.ts` | Unit tests |
| `src/pages/AccountSettingsPage.tsx` | `/settings/account` page |
| `src/components/account/DeleteAccountFlow.tsx` | Two-step confirmation UI |
| `e2e/account-deletion.spec.ts` | E2E tests |

## Summary of modified files

| File | Change |
|---|---|
| `src/test/mocks/handlers.ts` | Add `delete-account` MSW handlers |
| `src/router.tsx` | Add `/settings/account` protected route |
| `src/pages/EditProfilePage.tsx` | Add link to `/settings/account` |
