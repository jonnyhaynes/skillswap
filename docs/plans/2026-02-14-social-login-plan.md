# Social Login (Google & Apple OAuth) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Google and Apple sign-in to SkillSwap using Supabase OAuth with a post-login onboarding flow for new social users.

**Architecture:** Client-side OAuth via `supabase.auth.signInWithOAuth()` with redirect. Social buttons above email/password forms. New OAuth users with incomplete profiles are redirected to `/onboarding` to collect their neighbourhood before they can use the app.

**Tech Stack:** React 19, Supabase Auth (OAuth), Tailwind CSS 4, React Router

**Design doc:** `docs/plans/2026-02-14-social-login-design.md`

---

### Task 1: Create feature branch

**Step 1: Create and switch to feature branch**

Run: `git checkout -b feat/social-login`

**Step 2: Commit the design doc**

Run:
```bash
git add docs/plans/2026-02-14-social-login-design.md
git commit -m "docs: add social login design doc"
```

---

### Task 2: Add `signInWithOAuth` to AuthContext

**Files:**
- Modify: `src/context/AuthContext.tsx`

**Step 1: Add `signInWithOAuth` to the `AuthContextType` interface**

Add to the interface after the existing `signIn` method:

```typescript
signInWithOAuth: (provider: 'google' | 'apple') => Promise<{ error?: string }>
```

**Step 2: Add `needsOnboarding` to `AuthState` and `AuthContextType`**

Add to `AuthState` interface:
```typescript
needsOnboarding: boolean
```

Add to `AuthContextType` interface:
```typescript
needsOnboarding: boolean
```

Add to initial state in `useReducer`:
```typescript
needsOnboarding: false,
```

**Step 3: Add reducer cases for onboarding**

Add a new action type:
```typescript
| { type: 'SET_NEEDS_ONBOARDING'; needsOnboarding: boolean }
```

Add reducer case:
```typescript
case 'SET_NEEDS_ONBOARDING':
  return { ...state, needsOnboarding: action.needsOnboarding }
```

**Step 4: Update the `SIGNED_IN` handler in `onAuthStateChange`**

In the existing `SIGNED_IN` handler, after fetching the profile, check if the user needs onboarding:

```typescript
if (event === 'SIGNED_IN' && session?.user) {
  getProfile(session.user.id).then((profile) => {
    dispatch({ type: 'SET_SESSION', session, user: profile })
    // Check if OAuth user needs to complete onboarding
    if (profile && profile.neighbourhood === 'Unknown') {
      dispatch({ type: 'SET_NEEDS_ONBOARDING', needsOnboarding: true })
    }
  })
}
```

**Step 5: Implement the `signInWithOAuth` callback**

Add after the existing `signIn` callback:

```typescript
const signInWithOAuth = useCallback(
  async (provider: 'google' | 'apple'): Promise<{ error?: string }> => {
    dispatch({ type: 'SET_LOADING', loading: true })
    dispatch({ type: 'SET_ERROR', error: null })

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })

    if (error) {
      const errorMessage = getAuthErrorMessage(error)
      dispatch({ type: 'SET_ERROR', error: errorMessage })
      return { error: errorMessage }
    }

    // Browser will redirect — no need to dispatch further
    return {}
  },
  []
)
```

**Step 6: Expose new values in the context provider**

Add `signInWithOAuth` and `needsOnboarding` to the Provider value object:

```typescript
signInWithOAuth,
needsOnboarding: state.needsOnboarding,
```

**Step 7: Commit**

```bash
git add src/context/AuthContext.tsx
git commit -m "feat: add signInWithOAuth and needsOnboarding to AuthContext"
```

---

### Task 3: Create `SocialLoginButtons` component

**Files:**
- Create: `src/components/auth/SocialLoginButtons.tsx`

**Step 1: Create the component**

This component renders Google and Apple sign-in buttons with SVG logos and an "or" divider. It accepts an `onError` callback for displaying errors.

```tsx
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export function SocialLoginButtons() {
  const { signInWithOAuth } = useAuth()
  const [loading, setLoading] = useState<'google' | 'apple' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setLoading(provider)
    setError(null)
    const result = await signInWithOAuth(provider)
    if (result.error) {
      setError(result.error)
      setLoading(null)
    }
    // If no error, browser is redirecting — don't clear loading
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4" role="alert">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => handleOAuth('google')}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {loading === 'google' ? 'Connecting...' : 'Continue with Google'}
        </button>

        <button
          type="button"
          onClick={() => handleOAuth('apple')}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          {loading === 'apple' ? 'Connecting...' : 'Continue with Apple'}
        </button>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-slate-500">or continue with email</span>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/auth/SocialLoginButtons.tsx
git commit -m "feat: add SocialLoginButtons component with Google and Apple OAuth"
```

---

### Task 4: Add social buttons to LoginForm and SignUpForm

**Files:**
- Modify: `src/components/auth/LoginForm.tsx`
- Modify: `src/components/auth/SignUpForm.tsx`

**Step 1: Update LoginForm**

Add import at the top of `src/components/auth/LoginForm.tsx`:
```typescript
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons'
```

Add `<SocialLoginButtons />` as the first child inside the `<form>` element, before the error display:

```tsx
<form onSubmit={handleSubmit} className="space-y-6" noValidate>
  <SocialLoginButtons />

  {displayError && (
    ...
```

**Step 2: Update SignUpForm**

Add import at the top of `src/components/auth/SignUpForm.tsx`:
```typescript
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons'
```

Add `<SocialLoginButtons />` as the first child inside the `<form>` element (the main form, not the confirmation view), before the error display:

```tsx
<form onSubmit={handleSubmit} className="space-y-5">
  <SocialLoginButtons />

  {displayError && (
    ...
```

**Step 3: Verify locally**

Run: `npm run dev`

Check both `/login` and `/signup` pages. The social buttons should appear above the email form with a clean divider.

**Step 4: Commit**

```bash
git add src/components/auth/LoginForm.tsx src/components/auth/SignUpForm.tsx
git commit -m "feat: add social login buttons to login and signup forms"
```

---

### Task 5: Create OnboardingPage

**Files:**
- Create: `src/pages/OnboardingPage.tsx`

**Step 1: Create the onboarding page**

This is a simple page with the NeighbourhoodTypeahead and postcode input. It updates the user's profile and clears the `needsOnboarding` flag.

```tsx
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/Button'
import { NeighbourhoodTypeahead } from '@/components/ui/NeighbourhoodTypeahead'
import { useAuth } from '@/hooks/useAuth'
import { ensureNeighbourhoodExists } from '@/services/neighbourhoods'

export function OnboardingPage() {
  const navigate = useNavigate()
  const { currentUser, updateProfile } = useAuth()
  const [neighbourhood, setNeighbourhood] = useState('')
  const [neighbourhoodCoords, setNeighbourhoodCoords] = useState<{ latitude?: number; longitude?: number }>({})
  const [postcode, setPostcode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!neighbourhood) {
      setError('Please select a neighbourhood from the suggestions')
      return
    }

    setLoading(true)

    try {
      await ensureNeighbourhoodExists(
        neighbourhood,
        neighbourhoodCoords.latitude,
        neighbourhoodCoords.longitude,
      )

      const result = await updateProfile({
        neighbourhood,
        postcode: postcode || '',
      })

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      navigate('/', { replace: true })
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Welcome to SkillSwap!</h1>
          <p className="text-slate-600 mt-2">
            Hi {currentUser?.firstName || 'there'}, tell us where you're based so we can connect you with neighbours.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
                {error}
              </div>
            )}

            <NeighbourhoodTypeahead
              value={neighbourhood}
              onChange={(place) => {
                setNeighbourhood(place?.name ?? '')
                setNeighbourhoodCoords({
                  latitude: place?.latitude,
                  longitude: place?.longitude,
                })
              }}
              required
            />

            <div>
              <label htmlFor="onboarding-postcode" className="block text-sm font-medium text-slate-700 mb-1">
                Postcode <span className="text-slate-500">(optional)</span>
              </label>
              <input
                id="onboarding-postcode"
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="e.g. E8 1AB"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Get started'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/pages/OnboardingPage.tsx
git commit -m "feat: add onboarding page for new OAuth users"
```

---

### Task 6: Update AuthGuard and router for onboarding

**Files:**
- Modify: `src/components/auth/AuthGuard.tsx`
- Modify: `src/router.tsx`

**Step 1: Update AuthGuard to redirect to onboarding**

Modify `src/components/auth/AuthGuard.tsx` to check `needsOnboarding`. Add a redirect to `/onboarding` after the auth check but before rendering children:

```tsx
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '@/hooks/useAuth'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { currentUser, initialized, loading, needsOnboarding } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking auth state
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Redirect to onboarding if profile is incomplete (skip if already on onboarding)
  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}
```

**Step 2: Add onboarding route to router**

In `src/router.tsx`, import `OnboardingPage`:

```typescript
import { OnboardingPage } from '@/pages/OnboardingPage'
```

Add the onboarding route in the protected routes section (after the auth routes block):

```typescript
{
  path: 'onboarding',
  element: (
    <AuthGuard>
      <OnboardingPage />
    </AuthGuard>
  ),
},
```

**Step 3: Commit**

```bash
git add src/components/auth/AuthGuard.tsx src/router.tsx
git commit -m "feat: add onboarding route and redirect incomplete profiles"
```

---

### Task 7: Clear `needsOnboarding` flag after profile update

**Files:**
- Modify: `src/context/AuthContext.tsx`

**Step 1: Update the `updateProfile` callback**

In the `updateProfile` callback inside `AuthContext.tsx`, after a successful update, check if the updated data includes a neighbourhood and clear the onboarding flag:

After `dispatch({ type: 'UPDATE_PROFILE', data: updated })`, add:

```typescript
// Clear onboarding flag if neighbourhood was updated
if (updated.neighbourhood && updated.neighbourhood !== 'Unknown') {
  dispatch({ type: 'SET_NEEDS_ONBOARDING', needsOnboarding: false })
}
```

**Step 2: Also check on initial session load**

In the `getSession().then(...)` block within the `useEffect`, add the same onboarding check that exists in the `onAuthStateChange` handler:

```typescript
supabase.auth.getSession().then(async ({ data: { session } }) => {
  if (session?.user) {
    const profile = await getProfile(session.user.id)
    dispatch({ type: 'SET_SESSION', session, user: profile })
    // Check if user needs to complete onboarding
    if (profile && profile.neighbourhood === 'Unknown') {
      dispatch({ type: 'SET_NEEDS_ONBOARDING', needsOnboarding: true })
    }
  } else {
    dispatch({ type: 'SET_SESSION', session: null, user: null })
  }
  dispatch({ type: 'SET_INITIALIZED' })
})
```

**Step 3: Commit**

```bash
git add src/context/AuthContext.tsx
git commit -m "feat: clear needsOnboarding flag after profile update"
```

---

### Task 8: Update error handler for OAuth errors

**Files:**
- Modify: `src/lib/errors.ts`

**Step 1: Add OAuth-specific error messages**

In `getAuthErrorMessage()`, add cases for common OAuth errors. Add these checks within the existing function:

```typescript
if (message.includes('provider is not enabled')) {
  return 'This sign-in method is not currently available. Please try another method.'
}

if (message.includes('oauth')) {
  return 'There was a problem signing in with your account. Please try again.'
}
```

**Step 2: Commit**

```bash
git add src/lib/errors.ts
git commit -m "feat: add OAuth error messages to error handler"
```

---

### Task 9: Handle Login/Signup page redirects for authenticated users needing onboarding

**Files:**
- Modify: `src/pages/LoginPage.tsx`
- Modify: `src/pages/SignUpPage.tsx`

**Step 1: Update LoginPage redirect logic**

In `src/pages/LoginPage.tsx`, update the redirect check to also account for `needsOnboarding`. Import and use it:

```typescript
const { currentUser, initialized, needsOnboarding } = useAuth()
```

Update the redirect:
```typescript
if (initialized && currentUser) {
  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />
  }
  return <Navigate to={from} replace />
}
```

**Step 2: Update SignUpPage redirect logic**

In `src/pages/SignUpPage.tsx`, same change:

```typescript
const { currentUser, initialized, needsOnboarding } = useAuth()
```

Update the redirect:
```typescript
if (initialized && currentUser) {
  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />
  }
  return <Navigate to="/" replace />
}
```

**Step 3: Commit**

```bash
git add src/pages/LoginPage.tsx src/pages/SignUpPage.tsx
git commit -m "feat: redirect authenticated users needing onboarding from login/signup"
```

---

### Task 10: Manual verification and final commit

**Step 1: Run the dev server**

Run: `npm run dev`

**Step 2: Visual verification checklist**

Verify in the browser:
- [ ] `/login` shows Google and Apple buttons above the email form with "or continue with email" divider
- [ ] `/signup` shows the same social buttons above the signup form
- [ ] Clicking Google/Apple buttons doesn't crash (they'll fail gracefully if Supabase isn't configured yet — look for the "not currently available" error message)
- [ ] Existing email/password login still works
- [ ] Existing signup still works
- [ ] Turnstile CAPTCHA is NOT shown for social buttons, only for email form

**Step 3: Run lint and type check**

Run: `npm run lint && npx tsc --noEmit`

Fix any issues that arise.

**Step 4: Build check**

Run: `npm run build`

Ensure no build errors.

**Step 5: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: resolve lint/type errors from social login implementation"
```
