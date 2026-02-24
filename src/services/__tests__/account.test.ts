import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/setup'
import {
  exportAccountData,
  deleteAccount,
  AccountServiceError,
} from '../account'
import { mockAccountExport } from '../../test/mocks/handlers'

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
