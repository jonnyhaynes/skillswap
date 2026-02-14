# Social Login (Google & Apple OAuth) Design

## Summary

Add Google and Apple sign-in to SkillSwap using Supabase's built-in OAuth support with client-side redirect flow. Social buttons appear above the existing email/password form on both login and signup pages. New OAuth users who lack a neighbourhood are redirected to a one-time onboarding screen.

## Decisions

- **Approach**: Client-side OAuth via `supabase.auth.signInWithOAuth()` with redirect (not popup)
- **Button placement**: Above email/password form with "or continue with email" divider
- **CAPTCHA**: Turnstile only for email/password flows; skipped for OAuth (providers have their own bot protection)
- **Onboarding**: New OAuth users redirected to `/onboarding` to collect neighbourhood + postcode
- **2FA**: Delegated to Google/Apple — no Supabase-level MFA for OAuth users

## Auth Flow

1. User clicks "Continue with Google" or "Continue with Apple"
2. `supabase.auth.signInWithOAuth({ provider })` redirects browser to provider
3. User authenticates (provider handles 2FA if enabled on their account)
4. Provider redirects back to app; Supabase exchanges token and creates/updates `auth.users`
5. Existing `onAuthStateChange` fires `SIGNED_IN`, fetches profile from `profiles` table
6. If profile has `neighbourhood === 'Unknown'` → redirect to `/onboarding`
7. Onboarding collects neighbourhood (required) + postcode (optional), updates profile
8. User proceeds to their original destination

## Components

### New

- **`SocialLoginButtons`** — Google and Apple OAuth buttons with provider logos. Calls `signInWithOAuth(provider)`. Reused on both login and signup pages.
- **`OnboardingPage`** — Simple form with `NeighbourhoodTypeahead` + postcode input. Only shown to users with `neighbourhood === 'Unknown'`. Redirects to home after completion.

### Modified

- **`LoginForm`** — Add `SocialLoginButtons` above existing form with divider
- **`SignUpForm`** — Add `SocialLoginButtons` above existing form with divider
- **`AuthContext`** — Add `signInWithOAuth(provider)` method. Add `needsOnboarding` flag to state. Detect incomplete profiles (`neighbourhood === 'Unknown'`) on sign-in.
- **`AuthGuard`** — Redirect users with `needsOnboarding` to `/onboarding` instead of target page
- **`router.tsx`** — Add `/onboarding` route (protected)

## Database

No migration needed. The existing `handle_new_user` trigger creates a profile for OAuth users with sensible defaults:

- `first_name` / `last_name` from `raw_user_meta_data` (Google provides these; Apple may provide them on first login only)
- `neighbourhood` defaults to `'Unknown'` via `COALESCE`
- `postcode` defaults to `''`

## Supabase Dashboard Configuration (Manual)

These must be configured manually in the Supabase dashboard:

1. **Google OAuth**: Add client ID + secret from Google Cloud Console
2. **Apple OAuth**: Add credentials from Apple Developer Portal
3. **Redirect URLs**: Ensure app URL is in the allowed redirect list

## Environment Variables

No new env vars needed — OAuth config lives in the Supabase dashboard.
