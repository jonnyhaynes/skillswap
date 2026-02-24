# Email & Password Change — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let email/password users change their email or password from Account Settings, with current-password verification; OAuth users see a provider note instead.

**Architecture:** Add `updateEmail`/`updatePassword` to `AuthContext` (re-auth via `signInWithPassword`, then `supabase.auth.updateUser()`). Add two self-contained inline-expand form components. Update `AccountSettingsPage` to show a new Security section (hidden for OAuth users).

**Tech Stack:** React 19, Supabase JS v2, Tailwind CSS 4, Vitest + React Testing Library, Playwright

---

### Task 1: Add `updateEmail` to AuthContext

**Files:**
- Modify: `src/context/AuthContext.tsx`

**Step 1: Write the failing test**

Create `src/context/__tests__/AuthContext.updateEmail.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/setup'

// We test updateEmail indirectly via the Supabase client HTTP calls.
// signInWithPassword → POST /auth/v1/token?grant_type=password
// updateUser         → PUT  /auth/v1/user

const AUTH_BASE = 'https://test.supabase.co/auth/v1'

describe('updateEmail (via supabase auth endpoints)', () => {
  it('calls signInWithPassword then updateUser on success', async () => {
    const signInSpy = vi.fn()
    const updateSpy = vi.fn()

    server.use(
      http.post(`${AUTH_BASE}/token`, async ({ request }) => {
        const url = new URL(request.url)
        if (url.searchParams.get('grant_type') === 'password') {
          signInSpy()
          return HttpResponse.json({ access_token: 'tok', user: { id: 'user-1' } })
        }
        return HttpResponse.json({}, { status: 400 })
      }),
      http.put(`${AUTH_BASE}/user`, async () => {
        updateSpy()
        return HttpResponse.json({ id: 'user-1', email: 'new@example.com' })
      })
    )

    // Import supabase directly to call the methods we'll be testing
    const { supabase } = await import('../../lib/supabase')

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'current123',
    })
    expect(signInError).toBeNull()
    expect(signInSpy).toHaveBeenCalledOnce()

    const { error: updateError } = await supabase.auth.updateUser({ email: 'new@example.com' })
    expect(updateError).toBeNull()
    expect(updateSpy).toHaveBeenCalledOnce()
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npx vitest run src/context/__tests__/AuthContext.updateEmail.test.ts
```
Expected: FAIL (no handler for auth endpoints yet — `onUnhandledRequest: 'warn'` so it may just warn)

**Step 3: Add MSW auth handlers to `src/test/mocks/handlers.ts`**

Add at the end of the `handlers` array:

```typescript
// Auth token (signInWithPassword re-auth)
http.post('https://test.supabase.co/auth/v1/token', async ({ request }) => {
  const url = new URL(request.url)
  if (url.searchParams.get('grant_type') === 'password') {
    const body = await request.json() as { email?: string; password?: string }
    if (body.password === 'wrongpassword') {
      return HttpResponse.json(
        { error: 'invalid_grant', error_description: 'Invalid login credentials' },
        { status: 400 }
      )
    }
    return HttpResponse.json({
      access_token: 'test-access-token',
      token_type: 'bearer',
      user: { id: 'user-1', email: body.email },
    })
  }
  return HttpResponse.json({}, { status: 400 })
}),

// Auth user update (updateUser)
http.put('https://test.supabase.co/auth/v1/user', async ({ request }) => {
  const body = await request.json() as { email?: string; password?: string }
  return HttpResponse.json({
    id: 'user-1',
    email: body.email ?? 'test@example.com',
  })
}),
```

**Step 4: Run test again**

```bash
npx vitest run src/context/__tests__/AuthContext.updateEmail.test.ts
```
Expected: PASS

**Step 5: Add `updateEmail` to `AuthContextType` interface in `src/context/AuthContext.tsx`**

In the `AuthContextType` interface, after `updateProfile`:

```typescript
updateEmail: (currentPassword: string, newEmail: string) => Promise<{ error?: string }>
updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error?: string }>
```

**Step 6: Implement `updateEmail` in `AuthProvider`**

Add after the `updateProfile` `useCallback`, before `getUserById`:

```typescript
const updateEmail = useCallback(
  async (currentPassword: string, newEmail: string): Promise<{ error?: string }> => {
    if (!state.currentUser || !state.session?.user.email) {
      return { error: 'Not authenticated' }
    }

    // Verify current password by re-authenticating
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: state.session.user.email,
      password: currentPassword,
    })

    if (signInError) {
      return { error: 'Incorrect password. Please try again.' }
    }

    // Request email change — Supabase sends confirmation link to new email
    const { error: updateError } = await supabase.auth.updateUser({ email: newEmail })

    if (updateError) {
      return { error: getAuthErrorMessage(updateError) }
    }

    return {}
  },
  [state.currentUser, state.session]
)
```

Add `updateEmail` to the `AuthContext.Provider` value object.

**Step 7: Commit**

```bash
git add src/context/AuthContext.tsx src/context/__tests__/AuthContext.updateEmail.test.ts src/test/mocks/handlers.ts
git commit -m "feat: add updateEmail to AuthContext with current-password re-auth"
```

---

### Task 2: Add `updatePassword` to AuthContext

**Files:**
- Modify: `src/context/AuthContext.tsx`
- Modify: `src/context/__tests__/AuthContext.updateEmail.test.ts` (add updatePassword tests)

**Step 1: Write the failing tests**

Add to `src/context/__tests__/AuthContext.updateEmail.test.ts`:

```typescript
describe('updatePassword (via supabase auth endpoints)', () => {
  it('calls signInWithPassword then updateUser with password', async () => {
    const updateSpy = vi.fn()

    server.use(
      http.put(`${AUTH_BASE}/user`, async ({ request }) => {
        const body = await request.json() as { password?: string }
        expect(body.password).toBe('newpassword123')
        updateSpy()
        return HttpResponse.json({ id: 'user-1' })
      })
    )

    const { supabase } = await import('../../lib/supabase')

    await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'current123',
    })

    const { error } = await supabase.auth.updateUser({ password: 'newpassword123' })
    expect(error).toBeNull()
    expect(updateSpy).toHaveBeenCalledOnce()
  })

  it('returns error when wrong password', async () => {
    const { supabase } = await import('../../lib/supabase')
    const { error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'wrongpassword',
    })
    expect(error).not.toBeNull()
  })
})
```

**Step 2: Run tests**

```bash
npx vitest run src/context/__tests__/AuthContext.updateEmail.test.ts
```
Expected: PASS (handlers already added in Task 1)

**Step 3: Implement `updatePassword` in `AuthProvider`**

Add after `updateEmail`:

```typescript
const updatePassword = useCallback(
  async (currentPassword: string, newPassword: string): Promise<{ error?: string }> => {
    if (!state.currentUser || !state.session?.user.email) {
      return { error: 'Not authenticated' }
    }

    // Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: state.session.user.email,
      password: currentPassword,
    })

    if (signInError) {
      return { error: 'Incorrect password. Please try again.' }
    }

    // Update password — takes effect immediately
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })

    if (updateError) {
      return { error: getAuthErrorMessage(updateError) }
    }

    return {}
  },
  [state.currentUser, state.session]
)
```

Add `updatePassword` to the `AuthContext.Provider` value object.

**Step 4: Run all tests**

```bash
npx vitest run
```
Expected: all PASS

**Step 5: Commit**

```bash
git add src/context/AuthContext.tsx src/context/__tests__/AuthContext.updateEmail.test.ts
git commit -m "feat: add updatePassword to AuthContext with current-password re-auth"
```

---

### Task 3: Create `ChangeEmailForm` component

**Files:**
- Create: `src/components/account/ChangeEmailForm.tsx`
- Create: `src/components/account/__tests__/ChangeEmailForm.test.tsx`

**Step 1: Write the failing tests**

Create `src/components/account/__tests__/ChangeEmailForm.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ChangeEmailForm from '../ChangeEmailForm'

const mockUpdateEmail = vi.fn()

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    updateEmail: mockUpdateEmail,
    session: {
      user: {
        email: 'current@example.com',
        app_metadata: { provider: 'email' },
      },
    },
  }),
}))

describe('ChangeEmailForm', () => {
  beforeEach(() => {
    mockUpdateEmail.mockReset()
  })

  it('renders collapsed by default — shows email and Change button', () => {
    render(<ChangeEmailForm />)
    expect(screen.getByText('current@example.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument()
    expect(screen.queryByLabelText(/new email/i)).not.toBeInTheDocument()
  })

  it('expands form when Change is clicked', () => {
    render(<ChangeEmailForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/new email/i)).toBeInTheDocument()
  })

  it('collapses form when Cancel is clicked', () => {
    render(<ChangeEmailForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByLabelText(/new email/i)).not.toBeInTheDocument()
  })

  it('shows validation error when new email matches current email', async () => {
    render(<ChangeEmailForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    fireEvent.change(screen.getByLabelText(/new email/i), {
      target: { value: 'current@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'mypassword' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent("That's already your email address")
    })
    expect(mockUpdateEmail).not.toHaveBeenCalled()
  })

  it('calls updateEmail and shows success banner on success', async () => {
    mockUpdateEmail.mockResolvedValue({})
    render(<ChangeEmailForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'mypassword' },
    })
    fireEvent.change(screen.getByLabelText(/new email/i), {
      target: { value: 'new@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Confirmation email sent')
    })
    expect(mockUpdateEmail).toHaveBeenCalledWith('mypassword', 'new@example.com')
  })

  it('shows error message when updateEmail returns an error', async () => {
    mockUpdateEmail.mockResolvedValue({ error: 'Incorrect password. Please try again.' })
    render(<ChangeEmailForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'wrongpass' },
    })
    fireEvent.change(screen.getByLabelText(/new email/i), {
      target: { value: 'new@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Incorrect password')
    })
  })
})
```

**Step 2: Run tests to verify they fail**

```bash
npx vitest run src/components/account/__tests__/ChangeEmailForm.test.tsx
```
Expected: FAIL — module not found

**Step 3: Create `src/components/account/ChangeEmailForm.tsx`**

```typescript
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function ChangeEmailForm() {
  const { updateEmail, session } = useAuth()
  const currentEmail = session?.user.email ?? ''

  const [expanded, setExpanded] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleCancel() {
    setExpanded(false)
    setCurrentPassword('')
    setNewEmail('')
    setError(null)
    setSuccess(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (newEmail === currentEmail) {
      setError("That's already your email address")
      return
    }

    setIsSubmitting(true)
    const result = await updateEmail(currentPassword, newEmail)
    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setSuccess(true)
    setCurrentPassword('')
    setNewEmail('')
  }

  // ── Collapsed ──────────────────────────────────────────────────────────────
  if (!expanded) {
    return (
      <div className="flex justify-between items-center px-4 py-3">
        <div>
          <span className="text-sm text-gray-500">Email</span>
          <span className="text-sm text-gray-900 ml-4">{currentEmail}</span>
        </div>
        <button
          onClick={() => { setSuccess(false); setExpanded(true) }}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Change
        </button>
      </div>
    )
  }

  // ── Expanded ───────────────────────────────────────────────────────────────
  return (
    <div className="px-4 py-4">
      <p className="text-sm font-medium text-gray-700 mb-3">Change email</p>

      {success && (
        <p role="status" className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
          Confirmation email sent to <strong>{newEmail || 'your new address'}</strong>. The change
          takes effect once you click the link.
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600 mb-3">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="email-current-password" className="block text-sm text-gray-600 mb-1">
            Current password
          </label>
          <input
            id="email-current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="new-email" className="block text-sm text-gray-600 mb-1">
            New email address
          </label>
          <input
            id="new-email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving…' : 'Save email'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
```

**Step 4: Run tests**

```bash
npx vitest run src/components/account/__tests__/ChangeEmailForm.test.tsx
```
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/account/ChangeEmailForm.tsx src/components/account/__tests__/ChangeEmailForm.test.tsx
git commit -m "feat: add ChangeEmailForm component with inline expand"
```

---

### Task 4: Create `ChangePasswordForm` component

**Files:**
- Create: `src/components/account/ChangePasswordForm.tsx`
- Create: `src/components/account/__tests__/ChangePasswordForm.test.tsx`

**Step 1: Write the failing tests**

Create `src/components/account/__tests__/ChangePasswordForm.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ChangePasswordForm from '../ChangePasswordForm'

const mockUpdatePassword = vi.fn()

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    updatePassword: mockUpdatePassword,
  }),
}))

describe('ChangePasswordForm', () => {
  beforeEach(() => {
    mockUpdatePassword.mockReset()
  })

  it('renders collapsed by default — shows password row and Change button', () => {
    render(<ChangePasswordForm />)
    expect(screen.getByText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument()
    expect(screen.queryByLabelText(/new password/i)).not.toBeInTheDocument()
  })

  it('expands when Change is clicked', () => {
    render(<ChangePasswordForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^new password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument()
  })

  it('collapses when Cancel is clicked', () => {
    render(<ChangePasswordForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByLabelText(/new password/i)).not.toBeInTheDocument()
  })

  it('shows error when new password is too short', async () => {
    render(<ChangePasswordForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'current123' },
    })
    fireEvent.change(screen.getByLabelText(/^new password/i), {
      target: { value: 'short' },
    })
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'short' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('at least 8 characters')
    })
    expect(mockUpdatePassword).not.toHaveBeenCalled()
  })

  it('shows error when passwords do not match', async () => {
    render(<ChangePasswordForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'current123' },
    })
    fireEvent.change(screen.getByLabelText(/^new password/i), {
      target: { value: 'newpassword1' },
    })
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'newpassword2' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('do not match')
    })
    expect(mockUpdatePassword).not.toHaveBeenCalled()
  })

  it('calls updatePassword and shows success banner on success', async () => {
    mockUpdatePassword.mockResolvedValue({})
    render(<ChangePasswordForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'current123' },
    })
    fireEvent.change(screen.getByLabelText(/^new password/i), {
      target: { value: 'newpassword123' },
    })
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'newpassword123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Password updated successfully')
    })
    expect(mockUpdatePassword).toHaveBeenCalledWith('current123', 'newpassword123')
  })

  it('shows error message when updatePassword returns an error', async () => {
    mockUpdatePassword.mockResolvedValue({ error: 'Incorrect password. Please try again.' })
    render(<ChangePasswordForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'wrongpass' },
    })
    fireEvent.change(screen.getByLabelText(/^new password/i), {
      target: { value: 'newpassword123' },
    })
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'newpassword123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Incorrect password')
    })
  })
})
```

**Step 2: Run tests to verify they fail**

```bash
npx vitest run src/components/account/__tests__/ChangePasswordForm.test.tsx
```
Expected: FAIL — module not found

**Step 3: Create `src/components/account/ChangePasswordForm.tsx`**

```typescript
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function ChangePasswordForm() {
  const { updatePassword } = useAuth()

  const [expanded, setExpanded] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleCancel() {
    setExpanded(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setError(null)
    setSuccess(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsSubmitting(true)
    const result = await updatePassword(currentPassword, newPassword)
    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setSuccess(true)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  // ── Collapsed ──────────────────────────────────────────────────────────────
  if (!expanded) {
    return (
      <div className="flex justify-between items-center px-4 py-3">
        <div>
          <span className="text-sm text-gray-500">Password</span>
          <span className="text-sm text-gray-400 ml-4">••••••••</span>
        </div>
        <button
          onClick={() => { setSuccess(false); setExpanded(true) }}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Change
        </button>
      </div>
    )
  }

  // ── Expanded ───────────────────────────────────────────────────────────────
  return (
    <div className="px-4 py-4">
      <p className="text-sm font-medium text-gray-700 mb-3">Change password</p>

      {success && (
        <p role="status" className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
          Password updated successfully.
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600 mb-3">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="password-current" className="block text-sm text-gray-600 mb-1">
            Current password
          </label>
          <input
            id="password-current"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="password-new" className="block text-sm text-gray-600 mb-1">
            New password
          </label>
          <input
            id="password-new"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="password-confirm" className="block text-sm text-gray-600 mb-1">
            Confirm new password
          </label>
          <input
            id="password-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving…' : 'Save password'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
```

**Step 4: Run tests**

```bash
npx vitest run src/components/account/__tests__/ChangePasswordForm.test.tsx
```
Expected: all PASS

**Step 5: Run all tests**

```bash
npx vitest run
```
Expected: all PASS

**Step 6: Commit**

```bash
git add src/components/account/ChangePasswordForm.tsx src/components/account/__tests__/ChangePasswordForm.test.tsx
git commit -m "feat: add ChangePasswordForm component with inline expand"
```

---

### Task 5: Update `AccountSettingsPage`

**Files:**
- Modify: `src/pages/AccountSettingsPage.tsx`

**Step 1: Write the failing E2E test first**

Create `e2e/account-settings.spec.ts`:

```typescript
import { test, expect } from './fixtures/auth'

test.describe('Account settings — Security section', () => {
  test('shows Security section with Email and Password rows', async ({ page }) => {
    await page.goto('/settings/account')
    await expect(page.getByRole('heading', { name: 'Security' })).toBeVisible()
    await expect(page.getByText('Email')).toBeVisible()
    await expect(page.getByText('Password')).toBeVisible()
  })

  test('email row shows current email and Change button', async ({ page }) => {
    await page.goto('/settings/account')
    // Should see the current test user email and a Change button in the Email row
    const emailRow = page.locator('text=Email').locator('..')
    await expect(emailRow.getByRole('button', { name: 'Change' })).toBeVisible()
  })

  test('clicking Change on email row expands the form', async ({ page }) => {
    await page.goto('/settings/account')
    // Click the Change button in the email row area
    await page.getByText('Email').locator('..').getByRole('button', { name: 'Change' }).click()
    await expect(page.getByLabel('Current password')).toBeVisible()
    await expect(page.getByLabel('New email address')).toBeVisible()
  })

  test('Cancel collapses the email form', async ({ page }) => {
    await page.goto('/settings/account')
    await page.getByText('Email').locator('..').getByRole('button', { name: 'Change' }).click()
    await page.getByRole('button', { name: 'Cancel' }).first().click()
    await expect(page.getByLabel('New email address')).not.toBeVisible()
  })

  test('clicking Change on password row expands the form', async ({ page }) => {
    await page.goto('/settings/account')
    await page.getByText('Password').locator('..').getByRole('button', { name: 'Change' }).click()
    await expect(page.getByLabel('New password')).toBeVisible()
    await expect(page.getByLabel('Confirm new password')).toBeVisible()
  })

  test('Account information section no longer shows email', async ({ page }) => {
    await page.goto('/settings/account')
    // "Member since" should still be in Account information
    await expect(page.getByText('Member since')).toBeVisible()
  })

  test('Danger zone is still visible', async ({ page }) => {
    await page.goto('/settings/account')
    await expect(page.getByRole('heading', { name: 'Danger zone' })).toBeVisible()
  })
})
```

**Step 2: Run E2E tests to verify they fail**

```bash
npx playwright test e2e/account-settings.spec.ts
```
Expected: FAIL — Security heading not found

**Step 3: Update `src/pages/AccountSettingsPage.tsx`**

Replace the entire file with:

```typescript
import { Link } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import DeleteAccountFlow from '../components/account/DeleteAccountFlow'
import ChangeEmailForm from '../components/account/ChangeEmailForm'
import ChangePasswordForm from '../components/account/ChangePasswordForm'

export function AccountSettingsPage() {
  const { currentUser, session } = useAuth()

  const isOAuthUser = session?.user?.app_metadata?.provider !== 'email'
  const oauthProvider = session?.user?.app_metadata?.provider

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
            <span className="text-sm text-gray-500">Member since</span>
            <span className="text-sm text-gray-900">
              {currentUser?.joinedAt
                ? new Date(currentUser.joinedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </span>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Security</h2>
        {isOAuthUser ? (
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
            <p className="text-sm text-gray-500">
              Your login credentials are managed by{' '}
              {oauthProvider === 'google' ? 'Google' : 'Apple'}.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
            <ChangeEmailForm />
            <ChangePasswordForm />
          </div>
        )}
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

**Step 4: Run all unit tests**

```bash
npx vitest run
```
Expected: all PASS

**Step 5: Run E2E tests**

```bash
npx playwright test e2e/account-settings.spec.ts
```
Expected: all PASS

**Step 6: Run full E2E suite to check for regressions**

```bash
npx playwright test
```
Expected: all PASS (including existing account-deletion tests)

**Step 7: Commit**

```bash
git add src/pages/AccountSettingsPage.tsx e2e/account-settings.spec.ts
git commit -m "feat: add Security section with email/password change to AccountSettingsPage"
```

---

### Task 6: Final verification

**Step 1: Run full test suite**

```bash
npx vitest run && npx playwright test
```
Expected: all PASS

**Step 2: Start dev server and smoke-test**

```bash
npm run dev
```

Visit `http://localhost:5173/settings/account`:
- [ ] Security section visible with Email and Password rows
- [ ] Clicking Email "Change" expands the form with two fields
- [ ] Cancel collapses without saving
- [ ] Clicking Password "Change" expands three-field form
- [ ] Member since still in Account information
- [ ] Danger zone unchanged

**Step 3: Final commit if any stray fixes**

```bash
git add -p
git commit -m "chore: final cleanup for email/password change feature"
```
