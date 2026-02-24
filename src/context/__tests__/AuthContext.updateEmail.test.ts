import { describe, it, expect, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/setup'

// We test the Supabase auth client calls directly.
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
          return HttpResponse.json({
            access_token: 'tok',
            refresh_token: 'refresh-tok',
            expires_in: 3600,
            token_type: 'bearer',
            user: { id: 'user-1', email: 'test@example.com' },
          })
        }
        return HttpResponse.json({}, { status: 400 })
      }),
      http.put(`${AUTH_BASE}/user`, async () => {
        updateSpy()
        return HttpResponse.json({ id: 'user-1', email: 'new@example.com' })
      })
    )

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
