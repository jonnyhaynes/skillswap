import {
  createContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import type { SwapProposal } from '@/types'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useAuth } from '@/hooks/useAuth'
import {
  getSwapsForUser as getSwapsForUserService,
  getSwapById as getSwapByIdService,
  createProposal as createProposalService,
  updateSwapStatus,
  markSwapComplete as markSwapCompleteService,
  subscribeToSwapProposals,
  unsubscribeFromSwaps,
} from '@/services/swaps'
import { getOrCreateConversation, sendMessage as sendMessageService } from '@/services/messages'

interface SwapsState {
  proposals: SwapProposal[]
  loading: boolean
  error: string | null
  initialized: boolean
}

type SwapsAction =
  | { type: 'SET_PROPOSALS'; proposals: SwapProposal[] }
  | { type: 'ADD_PROPOSAL'; proposal: SwapProposal }
  | { type: 'UPDATE_PROPOSAL'; proposal: SwapProposal }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_INITIALIZED' }

export interface SwapsContextType {
  proposals: SwapProposal[]
  loading: boolean
  error: string | null
  initialized: boolean
  fetchSwaps: () => Promise<void>
  createProposal: (data: {
    proposerId: string
    recipientId: string
    offeredSkillId: string
    requestedSkillId: string
    message: string
  }) => Promise<SwapProposal | null>
  acceptProposal: (id: string) => Promise<boolean>
  declineProposal: (id: string) => Promise<boolean>
  startProgress: (id: string) => Promise<boolean>
  markComplete: (id: string, userId: string) => Promise<boolean>
  cancelProposal: (id: string) => Promise<boolean>
  getSwapById: (id: string) => SwapProposal | undefined
  fetchSwapById: (id: string) => Promise<SwapProposal | null>
  getSwapsForUser: (userId: string) => SwapProposal[]
  getIncomingSwaps: (userId: string) => SwapProposal[]
  getOutgoingSwaps: (userId: string) => SwapProposal[]
  getActiveSwaps: (userId: string) => SwapProposal[]
  getCompletedSwaps: (userId: string) => SwapProposal[]
  clearError: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const SwapsContext = createContext<SwapsContextType | null>(null)

function swapsReducer(state: SwapsState, action: SwapsAction): SwapsState {
  switch (action.type) {
    case 'SET_PROPOSALS':
      return {
        ...state,
        proposals: action.proposals,
        loading: false,
        error: null,
      }
    case 'ADD_PROPOSAL':
      return {
        ...state,
        proposals: [action.proposal, ...state.proposals],
        loading: false,
      }
    case 'UPDATE_PROPOSAL':
      return {
        ...state,
        proposals: state.proposals.map((p) =>
          p.id === action.proposal.id ? action.proposal : p
        ),
        loading: false,
      }
    case 'SET_LOADING':
      return { ...state, loading: action.loading }
    case 'SET_ERROR':
      return { ...state, error: action.error, loading: false }
    case 'SET_INITIALIZED':
      return { ...state, initialized: true }
    default:
      return state
  }
}

export function SwapsProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth()
  const [state, dispatch] = useReducer(swapsReducer, {
    proposals: [],
    loading: false,
    error: null,
    initialized: false,
  })

  const subscriptionRef = useRef<RealtimeChannel | null>(null)

  // Fetch swaps and set up real-time subscriptions when user changes
  useEffect(() => {
    if (!currentUser) {
      dispatch({ type: 'SET_PROPOSALS', proposals: [] })
      dispatch({ type: 'SET_INITIALIZED' })
      return
    }

    const loadSwaps = async () => {
      dispatch({ type: 'SET_LOADING', loading: true })
      try {
        const swaps = await getSwapsForUserService(currentUser.id)
        dispatch({ type: 'SET_PROPOSALS', proposals: swaps })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load swaps'
        dispatch({ type: 'SET_ERROR', error: message })
      } finally {
        dispatch({ type: 'SET_INITIALIZED' })
      }
    }

    loadSwaps()

    // Set up real-time subscription for swap proposals
    subscriptionRef.current = subscribeToSwapProposals(
      currentUser.id,
      (proposal) => {
        dispatch({ type: 'ADD_PROPOSAL', proposal })
      },
      (proposal) => {
        dispatch({ type: 'UPDATE_PROPOSAL', proposal })
      }
    )

    return () => {
      if (subscriptionRef.current) {
        unsubscribeFromSwaps(subscriptionRef.current)
        subscriptionRef.current = null
      }
    }
  }, [currentUser])

  const fetchSwaps = useCallback(async () => {
    if (!currentUser) return

    dispatch({ type: 'SET_LOADING', loading: true })
    try {
      const swaps = await getSwapsForUserService(currentUser.id)
      dispatch({ type: 'SET_PROPOSALS', proposals: swaps })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load swaps'
      dispatch({ type: 'SET_ERROR', error: message })
    }
  }, [currentUser])

  const createProposal = useCallback(
    async (data: {
      proposerId: string
      recipientId: string
      offeredSkillId: string
      requestedSkillId: string
      message: string
    }): Promise<SwapProposal | null> => {
      dispatch({ type: 'SET_LOADING', loading: true })
      dispatch({ type: 'SET_ERROR', error: null })
      try {
        const conversation = await getOrCreateConversation(data.proposerId, data.recipientId)
        const proposal = await createProposalService({
          proposerId: data.proposerId,
          recipientId: data.recipientId,
          offeredSkillId: data.offeredSkillId,
          requestedSkillId: data.requestedSkillId,
          message: data.message,
          conversationId: conversation.id,
        })
        // Send the proposal message as the first message in the conversation
        if (data.message) {
          await sendMessageService(conversation.id, data.proposerId, data.message)
        }
        dispatch({ type: 'ADD_PROPOSAL', proposal })
        return proposal
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create proposal'
        dispatch({ type: 'SET_ERROR', error: message })
        return null
      }
    },
    []
  )

  const acceptProposal = useCallback(async (id: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', loading: true })
    dispatch({ type: 'SET_ERROR', error: null })
    try {
      const updated = await updateSwapStatus(id, 'in_progress')
      dispatch({ type: 'UPDATE_PROPOSAL', proposal: updated })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to accept proposal'
      dispatch({ type: 'SET_ERROR', error: message })
      return false
    }
  }, [])

  const declineProposal = useCallback(async (id: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', loading: true })
    dispatch({ type: 'SET_ERROR', error: null })
    try {
      const updated = await updateSwapStatus(id, 'declined')
      dispatch({ type: 'UPDATE_PROPOSAL', proposal: updated })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to decline proposal'
      dispatch({ type: 'SET_ERROR', error: message })
      return false
    }
  }, [])

  const startProgress = useCallback(async (id: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', loading: true })
    dispatch({ type: 'SET_ERROR', error: null })
    try {
      const updated = await updateSwapStatus(id, 'in_progress')
      dispatch({ type: 'UPDATE_PROPOSAL', proposal: updated })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start swap'
      dispatch({ type: 'SET_ERROR', error: message })
      return false
    }
  }, [])

  const markComplete = useCallback(
    async (id: string, userId: string): Promise<boolean> => {
      dispatch({ type: 'SET_LOADING', loading: true })
      dispatch({ type: 'SET_ERROR', error: null })
      try {
        const updated = await markSwapCompleteService(id, userId)
        dispatch({ type: 'UPDATE_PROPOSAL', proposal: updated })
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to mark complete'
        dispatch({ type: 'SET_ERROR', error: message })
        return false
      }
    },
    []
  )

  const cancelProposal = useCallback(async (id: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', loading: true })
    dispatch({ type: 'SET_ERROR', error: null })
    try {
      const updated = await updateSwapStatus(id, 'cancelled')
      dispatch({ type: 'UPDATE_PROPOSAL', proposal: updated })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel proposal'
      dispatch({ type: 'SET_ERROR', error: message })
      return false
    }
  }, [])

  const getSwapById = useCallback(
    (id: string) => state.proposals.find((p) => p.id === id),
    [state.proposals]
  )

  const fetchSwapById = useCallback(
    async (id: string): Promise<SwapProposal | null> => {
      const cached = state.proposals.find((p) => p.id === id)
      if (cached) return cached

      try {
        return await getSwapByIdService(id)
      } catch {
        return null
      }
    },
    [state.proposals]
  )

  const getSwapsForUser = useCallback(
    (userId: string) =>
      state.proposals.filter(
        (p) => p.proposerId === userId || p.recipientId === userId
      ),
    [state.proposals]
  )

  const getIncomingSwaps = useCallback(
    (userId: string) =>
      state.proposals.filter(
        (p) => p.recipientId === userId && p.status === 'pending'
      ),
    [state.proposals]
  )

  const getOutgoingSwaps = useCallback(
    (userId: string) =>
      state.proposals.filter(
        (p) => p.proposerId === userId && p.status === 'pending'
      ),
    [state.proposals]
  )

  const getActiveSwaps = useCallback(
    (userId: string) =>
      state.proposals.filter(
        (p) =>
          (p.proposerId === userId || p.recipientId === userId) &&
          p.status === 'in_progress'
      ),
    [state.proposals]
  )

  const getCompletedSwaps = useCallback(
    (userId: string) =>
      state.proposals.filter(
        (p) =>
          (p.proposerId === userId || p.recipientId === userId) &&
          (p.status === 'completed' || p.status === 'declined' || p.status === 'cancelled')
      ),
    [state.proposals]
  )

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', error: null })
  }, [])

  return (
    <SwapsContext.Provider
      value={{
        proposals: state.proposals,
        loading: state.loading,
        error: state.error,
        initialized: state.initialized,
        fetchSwaps,
        createProposal,
        acceptProposal,
        declineProposal,
        startProgress,
        markComplete,
        cancelProposal,
        getSwapById,
        fetchSwapById,
        getSwapsForUser,
        getIncomingSwaps,
        getOutgoingSwaps,
        getActiveSwaps,
        getCompletedSwaps,
        clearError,
      }}
    >
      {children}
    </SwapsContext.Provider>
  )
}
