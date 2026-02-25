import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/setup'

const AUTH_BASE = 'https://test.supabase.co/auth/v1'

describe('updateEmail auth flow (via Supabase client)', () => {
  it('signInWithPassword succeeds with correct password', async () => {
    const { supabase } = await import('../../lib/supabase')
    const { error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'correct123',
    })
    expect(error).toBeNull()
  })

  it('signInWithPassword fails with wrong password', async () => {
    const { supabase } = await import('../../lib/supabase')
    const { error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'wrongpassword',
    })
    expect(error).not.toBeNull()
  })

  it('updateUser with new email succeeds', async () => {
    const { supabase } = await import('../../lib/supabase')
    // Establish a session first so updateUser has an access token
    await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'correct123',
    })
    const { error, data } = await supabase.auth.updateUser({ email: 'new@example.com' })
    expect(error).toBeNull()
    expect(data.user?.email).toBe('new@example.com')
  })

  it('updateUser returns error when handler returns 422', async () => {
    const { supabase } = await import('../../lib/supabase')
    // Establish a session first so updateUser has an access token
    await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'correct123',
    })
    server.use(
      http.put(`${AUTH_BASE}/user`, () =>
        HttpResponse.json({ message: 'Email already in use' }, { status: 422 })
      )
    )
    const { error } = await supabase.auth.updateUser({ email: 'taken@example.com' })
    expect(error).not.toBeNull()
  })
})
