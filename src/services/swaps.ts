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

  // Set respondedAt when the recipient gives a definitive response (accept or decline)
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
 * Mark a swap as complete for one party.
 *
 * The DB trigger `auto_complete_swap` (migration 027) atomically sets
 * status='completed' and completed_at when both completion flags become true,
 * eliminating the read-modify-write race that existed in the previous
 * implementation.  We still need a minimal read to determine whether the
 * caller is the proposer or recipient — proposer_id is immutable so this read
 * is safe and does not introduce a TOCTOU window.
 */
export async function markSwapComplete(
  id: string,
  userId: string
): Promise<SwapProposal> {
  // Read only the immutable proposer_id to determine the caller's role.
  const { data: role, error: roleError } = await supabase
    .from('swap_proposals')
    .select('proposer_id')
    .eq('id', id)
    .single()

  if (roleError) {
    throw new SwapsServiceError(roleError.message, roleError.code)
  }

  // Set only the caller's completion flag.  The auto_complete_swap trigger
  // will transition status → 'completed' atomically if both flags are now true.
  const updates: SwapProposalUpdate =
    role.proposer_id === userId
      ? { proposer_completed: true }
      : { recipient_completed: true }

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
 * Subscribe to swap proposal changes for a user (as proposer or recipient).
 *
 * Supabase Realtime does not support OR filters in a single .on() call, so we
 * register four separate listeners — one per (event × role) combination — each
 * with a server-side equality filter.  This moves filtering to the server and
 * avoids broadcasting all users' swap events to every connected client.
 */
export function subscribeToSwapProposals(
  userId: string,
  onInsert: (proposal: SwapProposal) => void,
  onUpdate: (proposal: SwapProposal) => void
): RealtimeChannel {
  const map = (payload: { new: unknown }) =>
    mapDbSwapProposal(payload.new as Parameters<typeof mapDbSwapProposal>[0])

  return supabase
    .channel(`user:${userId}:swaps`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'swap_proposals',
        filter: `proposer_id=eq.${userId}`,
      },
      (payload) => onInsert(map(payload))
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'swap_proposals',
        filter: `recipient_id=eq.${userId}`,
      },
      (payload) => onInsert(map(payload))
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'swap_proposals',
        filter: `proposer_id=eq.${userId}`,
      },
      (payload) => onUpdate(map(payload))
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'swap_proposals',
        filter: `recipient_id=eq.${userId}`,
      },
      (payload) => onUpdate(map(payload))
    )
    .subscribe()
}

/**
 * Unsubscribe from a swap proposals channel
 */
export function unsubscribeFromSwaps(channel: RealtimeChannel): void {
  supabase.removeChannel(channel)
}
