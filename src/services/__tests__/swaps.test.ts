import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/setup'
import { mockSwapRow } from '@/test/mocks/handlers'
import {
  getSwapsForUser,
  createProposal,
  updateSwapStatus,
  markSwapComplete,
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
      conversationId: 'conv-1',
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

describe('markSwapComplete (TOCTOU fix — security)', () => {
  it('reads only proposer_id (minimal read) and writes only proposer_completed for the proposer', async () => {
    let capturedGetUrl = ''
    let capturedPatchBody: Record<string, unknown> = {}

    server.use(
      // The function first GETs proposer_id to determine role
      http.get('https://test.supabase.co/rest/v1/swap_proposals', ({ request }) => {
        capturedGetUrl = request.url
        return HttpResponse.json({ proposer_id: 'user-1' })
      }),
      // Then PATCHes only the caller's completion flag
      http.patch('https://test.supabase.co/rest/v1/swap_proposals', async ({ request }) => {
        capturedPatchBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ ...mockSwapRow, proposer_completed: true })
      })
    )

    await markSwapComplete('swap-1', 'user-1')

    // GET must only request proposer_id — not the full row (no TOCTOU-relevant columns)
    expect(capturedGetUrl).toContain('select=proposer_id')

    // PATCH body must contain ONLY proposer_completed — the DB trigger handles
    // status and completed_at atomically, so the client must not set them
    expect(capturedPatchBody).toEqual({ proposer_completed: true })
    expect(capturedPatchBody).not.toHaveProperty('status')
    expect(capturedPatchBody).not.toHaveProperty('completed_at')
  })

  it('writes only recipient_completed for the recipient', async () => {
    let capturedPatchBody: Record<string, unknown> = {}

    server.use(
      http.get('https://test.supabase.co/rest/v1/swap_proposals', () => {
        // proposer is user-1, so user-2 is the recipient
        return HttpResponse.json({ proposer_id: 'user-1' })
      }),
      http.patch('https://test.supabase.co/rest/v1/swap_proposals', async ({ request }) => {
        capturedPatchBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ ...mockSwapRow, recipient_completed: true })
      })
    )

    await markSwapComplete('swap-1', 'user-2')

    expect(capturedPatchBody).toEqual({ recipient_completed: true })
    expect(capturedPatchBody).not.toHaveProperty('status')
    expect(capturedPatchBody).not.toHaveProperty('completed_at')
  })

  it('throws SwapsServiceError when the role lookup fails', async () => {
    server.use(
      http.get('https://test.supabase.co/rest/v1/swap_proposals', () => {
        return HttpResponse.json({ message: 'permission denied', code: '42501' }, { status: 400 })
      })
    )
    await expect(markSwapComplete('swap-1', 'user-1')).rejects.toThrow(SwapsServiceError)
  })
})
