import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/setup'
import { mockSwapRow } from '@/test/mocks/handlers'
import {
  getSwapsForUser,
  createProposal,
  updateSwapStatus,
  SwapsServiceError,
} from '../swaps'

describe('getSwapsForUser', () => {
  it('returns mapped swap proposals', async () => {
    const result = await getSwapsForUser('user-1')
    expect(result).toHaveLength(1)
    expect(result[0].proposerId).toBe('user-1')
    expect(result[0].status).toBe('pending')
  })

  it('throws SwapsServiceError on failure', async () => {
    server.use(
      http.get('https://test.supabase.co/rest/v1/swap_proposals', () => {
        return HttpResponse.json({ message: 'error', code: '42501' }, { status: 400 })
      })
    )
    await expect(getSwapsForUser('user-1')).rejects.toThrow(SwapsServiceError)
  })
})

describe('createProposal', () => {
  it('returns the created proposal', async () => {
    server.use(
      http.post('https://test.supabase.co/rest/v1/swap_proposals', () => {
        return HttpResponse.json(mockSwapRow, { status: 201 })
      })
    )

    const result = await createProposal({
      proposerId: 'user-1',
      recipientId: 'user-2',
      offeredSkillId: 'skill-1',
      requestedSkillId: 'skill-2',
      message: 'Want to swap?',
      conversationId: null,
    })
    expect(result.id).toBe('swap-1')
    expect(result.status).toBe('pending')
  })
})

describe('updateSwapStatus', () => {
  it('sets respondedAt when status becomes in_progress', async () => {
    const respondedRow = {
      ...mockSwapRow,
      status: 'in_progress',
      responded_at: '2025-01-02T10:00:00Z',
    }
    server.use(
      http.patch('https://test.supabase.co/rest/v1/swap_proposals', () => {
        return HttpResponse.json(respondedRow)
      })
    )
    const result = await updateSwapStatus('swap-1', 'in_progress')
    expect(result.status).toBe('in_progress')
    expect(result.respondedAt).toBe('2025-01-02T10:00:00Z')
  })

  it('sets respondedAt when status becomes declined', async () => {
    const declinedRow = {
      ...mockSwapRow,
      status: 'declined',
      responded_at: '2025-01-02T10:00:00Z',
    }
    server.use(
      http.patch('https://test.supabase.co/rest/v1/swap_proposals', () => {
        return HttpResponse.json(declinedRow)
      })
    )
    const result = await updateSwapStatus('swap-1', 'declined')
    expect(result.status).toBe('declined')
  })
})
