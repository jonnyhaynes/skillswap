# Remove `accepted` Swap Status Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove the `accepted` swap status entirely — accepting a swap now immediately sets it to `in_progress`.

**Architecture:** Update the DB enum via migration, update seed data, then update all frontend references. No new components needed; the "Start Progress" button is removed as it becomes unreachable.

**Tech Stack:** Supabase (Postgres), React 19, TypeScript

---

### Task 1: Database migration — remove `accepted` from enum

**Files:**
- Create: `supabase/migrations/012_remove_accepted_status.sql`

**Step 1: Create the migration file**

```sql
-- Migrate any existing 'accepted' rows to 'in_progress'
UPDATE public.swap_proposals
SET
  status = 'in_progress',
  responded_at = COALESCE(responded_at, NOW())
WHERE status = 'accepted';

-- Postgres can't drop an enum value directly, so we recreate the type
-- 1. Create the new enum without 'accepted'
CREATE TYPE swap_status_new AS ENUM (
  'pending',
  'declined',
  'in_progress',
  'completed',
  'cancelled'
);

-- 2. Swap the column to use the new type
ALTER TABLE public.swap_proposals
  ALTER COLUMN status TYPE swap_status_new
  USING status::text::swap_status_new;

-- 3. Drop the old type and rename the new one
DROP TYPE swap_status;
ALTER TYPE swap_status_new RENAME TO swap_status;
```

**Step 2: Apply the migration**

```bash
supabase db reset
```

Expected: Migration runs without errors, seed data loads cleanly.

**Step 3: Commit**

```bash
git add supabase/migrations/012_remove_accepted_status.sql
git commit -m "feat: migration to remove accepted swap status"
```

---

### Task 2: Update seed data

**Files:**
- Modify: `supabase/seed.sql` (line ~563-577, swap-2)

**Step 1: Update swap-2 status and comment**

Find this block (around line 563):
```sql
-- swap-2: Priya <-> Alex (accepted: yoga for React mentoring)
```

Change the comment and status:
```sql
-- swap-2: Priya <-> Alex (in_progress: yoga for React mentoring)
```

And on the status line (~line 571), change:
```sql
  'accepted',
```
to:
```sql
  'in_progress',
```

**Step 2: Run reset to verify**

```bash
supabase db reset
```

Expected: No errors. Swap-2 now has status `in_progress`.

**Step 3: Commit**

```bash
git add supabase/seed.sql
git commit -m "fix: update seed data swap-2 from accepted to in_progress"
```

---

### Task 3: Update TypeScript type

**Files:**
- Modify: `src/types/swap.ts`

**Step 1: Remove `'accepted'` from SwapStatus union**

Find:
```typescript
export type SwapStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'in_progress'
  | 'completed'
  | 'cancelled';
```

Change to:
```typescript
export type SwapStatus =
  | 'pending'
  | 'declined'
  | 'in_progress'
  | 'completed'
  | 'cancelled';
```

**Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: Errors in other files (not yet updated) — that's fine at this stage, just confirm the type change itself doesn't break anything unexpected.

**Step 3: Commit**

```bash
git add src/types/swap.ts
git commit -m "feat: remove accepted from SwapStatus type"
```

---

### Task 4: Update swaps service

**Files:**
- Modify: `src/services/swaps.ts` (line ~99)

**Step 1: Update respondedAt condition**

Find (line ~99):
```typescript
if (status === 'accepted' || status === 'declined') {
  updates.respondedAt = new Date().toISOString()
}
```

Change to:
```typescript
if (status === 'in_progress' || status === 'declined') {
  updates.respondedAt = new Date().toISOString()
}
```

**Step 2: Commit**

```bash
git add src/services/swaps.ts
git commit -m "fix: set respondedAt on in_progress instead of accepted"
```

---

### Task 5: Update SwapsContext

**Files:**
- Modify: `src/context/SwapsContext.tsx` (lines ~208, ~325)

**Step 1: Update acceptProposal to set in_progress**

Find (line ~208):
```typescript
const updated = await updateSwapStatus(id, 'accepted')
```

Change to:
```typescript
const updated = await updateSwapStatus(id, 'in_progress')
```

**Step 2: Update getActiveSwaps filter**

Find (line ~325):
```typescript
(p.status === 'accepted' || p.status === 'in_progress')
```

Change to:
```typescript
p.status === 'in_progress'
```

**Step 3: Commit**

```bash
git add src/context/SwapsContext.tsx
git commit -m "feat: accept proposal now sets status to in_progress directly"
```

---

### Task 6: Update SwapActions component

**Files:**
- Modify: `src/components/swaps/SwapActions.tsx` (line ~96-126)

**Step 1: Remove the `accepted` status block**

Find and remove the entire block (lines ~96-126):
```typescript
if (swap.status === 'accepted') {
  return (
    <>
      <div className="space-y-3">
        <Button variant="primary" onClick={onStartProgress} className="w-full">
          Start Progress
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowCancelDialog(true)}
          className="w-full"
        >
          Cancel Swap
        </Button>
      </div>

      <ConfirmDialog
        isOpen={showCancelDialog}
        title="Cancel Swap"
        message="Are you sure you want to cancel this swap? This action cannot be undone."
        confirmLabel="Cancel Swap"
        variant="danger"
        onConfirm={() => {
          onCancel();
          setShowCancelDialog(false);
        }}
        onCancel={() => setShowCancelDialog(false)}
      />
    </>
  );
}
```

**Step 2: Check if `onStartProgress` prop is now unused**

If `onStartProgress` is only used in that block, remove it from the component's props interface and any parent passing it in (`SwapDetailPage.tsx`).

**Step 3: Commit**

```bash
git add src/components/swaps/SwapActions.tsx
git commit -m "feat: remove Start Progress button, accepted state no longer exists"
```

---

### Task 7: Update SwapStatusBadge component

**Files:**
- Modify: `src/components/swaps/SwapStatusBadge.tsx` (line ~10)

**Step 1: Remove `accepted` from statusConfig**

Find:
```typescript
accepted: { label: 'Accepted', className: 'bg-blue-50 text-blue-600' },
```

Remove that line entirely.

**Step 2: Commit**

```bash
git add src/components/swaps/SwapStatusBadge.tsx
git commit -m "feat: remove accepted status from SwapStatusBadge"
```

---

### Task 8: Final verification

**Step 1: TypeScript compile check**

```bash
npx tsc --noEmit
```

Expected: Zero errors.

**Step 2: Run the dev server and manually verify**

```bash
npm run dev
```

- Log in as Priya (or Alex) and navigate to Swaps
- Swap-2 (Priya ↔ Alex) should show as "In Progress" not "Accepted"
- As a recipient of a pending swap, click Accept — it should immediately show "In Progress" with no intermediate "Accepted" state
- Confirm "Start Progress" button is gone

**Step 3: Reset DB and verify seed**

```bash
supabase db reset
```

Expected: No errors, all swaps load correctly.

**Step 4: Final commit if anything was missed**

```bash
git add -A
git commit -m "chore: final cleanup after removing accepted swap status"
```
