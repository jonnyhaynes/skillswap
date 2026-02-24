# Email & Password Change — Design

**Date:** 2026-02-24
**Status:** Approved

## Overview

Add the ability for email/password users to change their email address or password from the Account Settings page. OAuth users (Google/Apple) see a note that their credentials are managed by their provider.

## Approach

Option A — inline expand components in `AccountSettingsPage`, with `updateEmail` and `updatePassword` methods added to `AuthContext`. No new edge functions needed; uses `supabase.auth.updateUser()` client-side, consistent with how `resetPassword` and `updateProfile` are already handled.

## Architecture

### AuthContext additions (`src/context/AuthContext.tsx`)

- `updateEmail(currentPassword: string, newEmail: string): Promise<void>`
  - Re-authenticates via `supabase.auth.signInWithPassword()` with current credentials
  - On success, calls `supabase.auth.updateUser({ email: newEmail })`
  - Change is pending until user clicks confirmation link sent to new email
- `updatePassword(currentPassword: string, newPassword: string): Promise<void>`
  - Re-authenticates via `supabase.auth.signInWithPassword()` first
  - On success, calls `supabase.auth.updateUser({ password: newPassword })`
  - Takes effect immediately

Re-authentication uses `signInWithPassword` as a verification step — it does not alter the active session when the user is already signed in.

### OAuth detection

Check `supabase.auth.getUser()` app_metadata provider. If not `email`, hide both sections and show: *"Your login credentials are managed by [Google/Apple]."*

## UI

### AccountSettingsPage layout

- **Account information** section: keep "Member since" row only (email row removed to avoid duplication)
- **Security** section (new): two rows — Email and Password — each with a "Change" toggle
- **Danger zone** section: unchanged

### Security section rows

```
Security
├── Email     [current@email.com]   [Change ▼]
│   └── (expanded) ChangeEmailForm
└── Password  ••••••••              [Change ▼]
    └── (expanded) ChangePasswordForm
```

### ChangeEmailForm (`src/components/account/ChangeEmailForm.tsx`)

Fields: Current password, New email address
On submit: calls `updateEmail()` → success banner: *"Confirmation email sent to [new email]. The change takes effect once you click the link."*
Cancel collapses form without saving.

### ChangePasswordForm (`src/components/account/ChangePasswordForm.tsx`)

Fields: Current password, New password, Confirm new password
Client-side validation before submit.
On submit: calls `updatePassword()` → success banner: *"Password updated successfully."*
Cancel collapses form without saving.

## Error Handling

| Scenario | Message |
|----------|---------|
| Wrong current password | "Incorrect password. Please try again." |
| New email already in use | "That email address is already registered." |
| New passwords don't match | "Passwords do not match" (client-side) |
| New password too short | "Password must be at least 8 characters" (client-side) |
| Same email as current | "That's already your email address" (client-side) |
| Network/unknown | Fall back to `getAuthErrorMessage()` from `src/lib/errors.ts` |

## Testing

- Unit tests for `ChangeEmailForm` and `ChangePasswordForm` (MSW mocks, existing patterns)
  - Successful submission
  - Wrong password error
  - Client-side validation errors
  - Cancel collapses form
- E2E tests in `e2e/account-settings.spec.ts` covering happy paths for both changes
- OAuth user test: security section hidden, provider note shown

## Files Changed

| File | Change |
|------|--------|
| `src/context/AuthContext.tsx` | Add `updateEmail`, `updatePassword` methods |
| `src/pages/AccountSettingsPage.tsx` | Add Security section, remove read-only email row |
| `src/components/account/ChangeEmailForm.tsx` | New component |
| `src/components/account/ChangePasswordForm.tsx` | New component |
| `src/services/__tests__/` or component tests | Unit tests |
| `e2e/account-settings.spec.ts` | E2E tests |
