// Swaps service - Supabase operations for swap proposals

import { supabase } from '@/lib/supabase'
import {
  mapDbSwapProposal,
  mapSwapProposalToDbInsert,
  mapSwapProposalToDbUpdate,
} from '@/lib/typeMappers'
import type { SwapProposal } from '@/types'
import type { SwapProposalUpdate } from '@/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

export class SwapsServiceError extends Error {
  code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'SwapsServiceError'
    this.code = code
  }
}

/**
 * Get all swap proposals for a user (as proposer or recipient)
 */
export async function getSwapsForUser(userId: string): Promise<SwapProposal[]> {
  const { data, error } = await supabase
    .from('swap_proposals')
    .select('*')
    .or(`proposer_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('proposed_at', { ascending: false })

  if (error) {
    throw new SwapsServiceError(error.message, error.code)
  }

  return data.map(mapDbSwapProposal)
}

/**
 * Get a single swap proposal by ID
 */
export async function getSwapById(id: string): Promise<SwapProposal | null> {
  const { data, error } = await supabase
    .from('swap_proposals')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new SwapsServiceError(error.message, error.code)
  }

  return mapDbSwapProposal(data)
}

/**
 * Create a new swap proposal
 */
export async function createProposal(
  proposal: Omit<
    SwapProposal,
    | 'id'
    | 'proposedAt'
    | 'respondedAt'
    | 'completedAt'
    | 'status'
    | 'proposerCompleted'
    | 'recipientCompleted'
  >
): Promise<SwapProposal> {
  const dbInsert = mapSwapProposalToDbInsert(proposal)

  const { data, error } = await supabase
    .from('swap_proposals')
    .insert(dbInsert)
    .select()
    .single()

  if (error) {
    throw new SwapsServiceError(error.message, error.code)
  }

  return mapDbSwapProposal(data)
}

/**
 * Update swap proposal status
 */
export async function updateSwapStatus(
  id: string,
  status: SwapProposal['status']
): Promise<SwapProposal> {
  const updates: Partial<SwapProposal> = { status }

  if (status === 'in_progress' || status === 'declined') {
    updates.respondedAt = new Date().toISOString()
  }

  if (status === 'completed') {
    updates.completedAt = new Date().toISOString()
  }

  const dbUpdates = mapSwapProposalToDbUpdate(updates)

  const { data, error } = await supabase
    .from('swap_proposals')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new SwapsServiceError(error.message, error.code)
  }

  return mapDbSwapProposal(data)
}

/**
 * Mark a swap as complete for one party
 */
export async function markSwapComplete(
  id: string,
  userId: string
): Promise<SwapProposal> {
  // First get the current swap to check who's marking complete
  const { data: current, error: fetchError } = await supabase
    .from('swap_proposals')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError) {
    throw new SwapsServiceError(fetchError.message, fetchError.code)
  }

  const isProposer = current.proposer_id === userId
  const updates: SwapProposalUpdate = {}

  if (isProposer) {
    updates.proposer_completed = true
  } else {
    updates.recipient_completed = true
  }

  // If both will be complete after this update, also set status to completed
  const willBothComplete =
    (isProposer && current.recipient_completed) ||
    (!isProposer && current.proposer_completed)

  if (willBothComplete) {
    updates.status = 'completed'
    updates.completed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('swap_proposals')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new SwapsServiceError(error.message, error.code)
  }

  return mapDbSwapProposal(data)
}

/**
 * Get swaps by status
 */
export async function getSwapsByStatus(
  userId: string,
  status: SwapProposal['status']
): Promise<SwapProposal[]> {
  const { data, error } = await supabase
    .from('swap_proposals')
    .select('*')
    .or(`proposer_id.eq.${userId},recipient_id.eq.${userId}`)
    .eq('status', status)
    .order('proposed_at', { ascending: false })

  if (error) {
    throw new SwapsServiceError(error.message, error.code)
  }

  return data.map(mapDbSwapProposal)
}

/**
 * Get incoming proposals for a user (they are the recipient)
 */
export async function getIncomingProposals(
  userId: string
): Promise<SwapProposal[]> {
  const { data, error } = await supabase
    .from('swap_proposals')
    .select('*')
    .eq('recipient_id', userId)
    .eq('status', 'pending')
    .order('proposed_at', { ascending: false })

  if (error) {
    throw new SwapsServiceError(error.message, error.code)
  }

  return data.map(mapDbSwapProposal)
}

/**
 * Get outgoing proposals for a user (they are the proposer)
 */
export async function getOutgoingProposals(
  userId: string
): Promise<SwapProposal[]> {
  const { data, error } = await supabase
    .from('swap_proposals')
    .select('*')
    .eq('proposer_id', userId)
    .eq('status', 'pending')
    .order('proposed_at', { ascending: false })

  if (error) {
    throw new SwapsServiceError(error.message, error.code)
  }

  return data.map(mapDbSwapProposal)
}

/**
 * Subscribe to swap proposal changes for a user (as proposer or recipient)
 */
export function subscribeToSwapProposals(
  userId: string,
  onInsert: (proposal: SwapProposal) => void,
  onUpdate: (proposal: SwapProposal) => void
): RealtimeChannel {
  return supabase
    .channel(`user:${userId}:swaps`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'swap_proposals',
      },
      (payload) => {
        const proposal = mapDbSwapProposal(
          payload.new as Parameters<typeof mapDbSwapProposal>[0]
        )
        // Only process if the user is involved
        if (proposal.proposerId === userId || proposal.recipientId === userId) {
          onInsert(proposal)
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'swap_proposals',
      },
      (payload) => {
        const proposal = mapDbSwapProposal(
          payload.new as Parameters<typeof mapDbSwapProposal>[0]
        )
        // Only process if the user is involved
        if (proposal.proposerId === userId || proposal.recipientId === userId) {
          onUpdate(proposal)
        }
      }
    )
    .subscribe()
}

/**
 * Unsubscribe from a swap proposals channel
 */
export function unsubscribeFromSwaps(channel: RealtimeChannel): void {
  supabase.removeChannel(channel)
}
