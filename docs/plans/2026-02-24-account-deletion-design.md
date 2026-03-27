# Account Deletion — Design Document

**Date:** 2026-02-24
**Status:** Approved
**Scope:** GDPR-compliant account deletion with data export

---

## Overview

Allow users to permanently delete their SkillSwap account in compliance with UK GDPR (right to erasure, Article 17) and the right to data portability (Article 20). The privacy policy already promises this capability; this feature fulfils that promise.

---

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Reviews on deletion | Anonymise | Satisfies GDPR (no personal data remains); preserves rating integrity for the other party |
| Active swaps | Auto-cancel with notification | Cannot indefinitely block erasure requests under UK GDPR |
| Data export | Yes, before deletion | Best-practice compliance; privacy policy already states this right |
| Architecture | Single Edge Function | Service-role key stays server-side; atomic from the client's perspective |

---

## Architecture

### Edge Function: `delete-account`

A single Supabase Edge Function handles both actions:

- `POST /functions/v1/delete-account` with `{ action: 'export' }` — read-only, returns JSON export, no DB side-effects
- `POST /functions/v1/delete-account` with `{ action: 'delete', confirmation: 'DELETE' }` — runs full deletion atomically

Both require a valid user JWT in the `Authorization` header.

### Why two actions in one function?

The export must be side-effect free — callable at any time without commitment. The destruction is a single atomic operation triggered only on final confirmation. Separating them prevents a half-deleted state if the user cancels after export.

---

## Deletion Sequence

Steps 1–4 run inside a PostgreSQL transaction via RPC before `auth.admin.deleteUser()` is called.

```
1. Verify JWT + extract user_id

2. Generate data export JSON (read-only snapshot before any changes)

3. [TRANSACTION START]
   a. Anonymise reviews
      - WHERE reviewer_id = user_id  → SET reviewer_id = NULL, comment = '[Review removed]'
      - WHERE reviewee_id = user_id  → SET reviewee_id = NULL, comment = '[Review removed]'
      ⚠ Must happen before auth deletion — ON DELETE CASCADE would otherwise
        destroy other users' reviews that reference this user as reviewee

   b. Remove user from conversations.participant_ids
      - UPDATE conversations SET participant_ids = array_remove(participant_ids, user_id)
        WHERE user_id = ANY(participant_ids)
      - Conversations are preserved for the remaining participant's history

   c. Cancel active swaps + notify
      - UPDATE swap_proposals SET status = 'cancelled'
        WHERE (proposer_id = user_id OR recipient_id = user_id)
        AND status IN ('pending', 'in_progress')
      - For each cancelled swap, insert a system message into its conversation:
        "This swap was cancelled because the other participant deleted their account."
   [TRANSACTION END]

4. Delete avatar from Supabase Storage (avatars/{user_id}/*)

5. auth.admin.deleteUser(user_id)
   → Cascades: profiles, skill_listings, messages, swap_proposals,
     remaining reviews, user_reports
```

### What cascades automatically on auth.users deletion

| Table | Behaviour |
|---|---|
| `profiles` | CASCADE delete |
| `skill_listings` | CASCADE delete (via profiles) |
| `messages` | CASCADE delete (sender_id → profiles) |
| `swap_proposals` | CASCADE delete (proposer_id / recipient_id → profiles) |
| `reviews` | CASCADE delete — but anonymised in step 3 first, so FKs are NULL by the time cascade runs |
| `user_reports` | CASCADE delete |
| `conversations` | Not deleted — user removed from participant_ids array in step 3b |

---

## Data Export Format

Returned as `application/json`, downloaded as `skillswap-data-export.json`.

```json
{
  "exported_at": "2026-02-24T10:30:00Z",
  "profile": { "first_name": "...", "email": "...", "bio": "...", "..." },
  "skill_listings": [ { "title": "...", "category": "...", "..." } ],
  "conversations": [ { "id": "...", "created_at": "...", "..." } ],
  "messages": [ { "content": "...", "sent_at": "...", "..." } ],
  "swap_proposals": [ { "status": "...", "proposed_at": "...", "..." } ],
  "reviews_written": [ { "rating": 5, "comment": "...", "..." } ],
  "reviews_received": [ { "rating": 4, "comment": "...", "..." } ]
}
```

---

## UI Flow

### New route: `/settings/account`

Added to the existing router. Accessible via a link on the `/profile/edit` page and navigation.

```
/settings/account
├── Account Information (read-only: email, joined date)
└── Danger Zone
    └── [Delete Account] button
```

### Step 1 — Consequences screen

Shown when "Delete Account" is clicked. Displays a live count of active swaps.

```
Delete your account

This will permanently:
  • Delete your profile and skill listings
  • Cancel N active swap(s)        ← live count fetched on load
  • Remove your messages
  • Anonymise reviews you've given and received

Under UK GDPR you have the right to a copy of your data
before deletion.

  [↓ Download your data]     ← calls export action, no DB changes

  [Continue →]    [Cancel]
```

### Step 2 — Typed confirmation

```
Are you absolutely sure?

Type DELETE to confirm permanent account deletion.

  ┌────────────────────────────┐
  │                            │
  └────────────────────────────┘

  [Permanently delete my account]   ← disabled until "DELETE" typed exactly
  [← Go back]
```

### Post-deletion

- Edge Function returns 200
- `signOut()` called client-side
- Redirect to `/`
- Toast: "Your account has been deleted."
- On error: toast with message, account untouched (transaction rolled back)

---

## GDPR Compliance Notes

| Requirement | How we satisfy it |
|---|---|
| Right to erasure (Art. 17) | All personal data deleted or anonymised |
| Right to portability (Art. 20) | JSON export offered before deletion |
| Erasure without undue delay | Immediate — no grace period imposed on user |
| No indefinite blocking | Cannot be blocked by active swaps (they are auto-cancelled) |
| Audit trail | Edge Function logs deletion events (user_id, timestamp) |
| Partial data (reviews) | Rating retained as transaction record; personal identifiers and comments removed |

---

## Testing

### Unit tests — `src/services/__tests__/account.test.ts` (Vitest + MSW)

- `exportAccountData()` returns correctly shaped JSON
- `exportAccountData()` throws `AccountServiceError` on Supabase error
- `deleteAccount()` calls the Edge Function with correct payload
- `deleteAccount()` throws `AccountServiceError` on failure

### MSW handlers — added to `src/test/mocks/handlers.ts`

- `POST /functions/v1/delete-account` (export) → mock export JSON
- `POST /functions/v1/delete-account` (delete) → 200
- Error variants (400, 500) for both

### E2E tests — `e2e/account-deletion.spec.ts` (Playwright, authenticated)

- Navigates to `/settings/account` and sees Danger Zone
- "Download your data" button triggers a file download
- Cannot submit without typing "DELETE" exactly
- Typing "DELETE" enables the confirm button
- Confirming deletion redirects to `/` and shows success toast
- Active swap count is visible in the warning message

---

## New Files

```
supabase/functions/delete-account/index.ts   Edge Function
supabase/migrations/XXX_anonymise_reviews_nullable.sql  Make reviewer/reviewee_id nullable if not already
src/services/account.ts                       exportAccountData(), deleteAccount()
src/services/__tests__/account.test.ts        Unit tests
src/pages/AccountSettingsPage.tsx             /settings/account route
src/components/account/DeleteAccountFlow.tsx  Two-step confirmation UI
e2e/account-deletion.spec.ts                  E2E tests
```

## Modified Files

```
src/test/mocks/handlers.ts      Add delete-account MSW handlers
src/pages/EditProfilePage.tsx   Add link to /settings/account
src/App.tsx (or router)         Add /settings/account route
```
