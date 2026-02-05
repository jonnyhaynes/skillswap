import { createContext, useReducer, useCallback, type ReactNode } from 'react';
import type { SwapProposal } from '@/types';
import { swaps as mockSwaps } from '@/data/swaps';
import { generateId } from '@/utils/generateId';

interface SwapsState {
  proposals: SwapProposal[];
}

type SwapsAction =
  | { type: 'CREATE_PROPOSAL'; proposal: SwapProposal }
  | { type: 'ACCEPT_PROPOSAL'; id: string }
  | { type: 'DECLINE_PROPOSAL'; id: string }
  | { type: 'START_PROGRESS'; id: string }
  | { type: 'MARK_COMPLETE'; id: string; userId: string }
  | { type: 'CANCEL_PROPOSAL'; id: string };

export interface SwapsContextType {
  proposals: SwapProposal[];
  createProposal: (data: {
    proposerId: string;
    recipientId: string;
    offeredSkillId: string;
    requestedSkillId: string;
    message: string;
    conversationId: string;
  }) => void;
  acceptProposal: (id: string) => void;
  declineProposal: (id: string) => void;
  startProgress: (id: string) => void;
  markComplete: (id: string, userId: string) => void;
  cancelProposal: (id: string) => void;
  getSwapById: (id: string) => SwapProposal | undefined;
  getSwapsForUser: (userId: string) => SwapProposal[];
  getIncomingSwaps: (userId: string) => SwapProposal[];
  getOutgoingSwaps: (userId: string) => SwapProposal[];
  getActiveSwaps: (userId: string) => SwapProposal[];
  getCompletedSwaps: (userId: string) => SwapProposal[];
}

export const SwapsContext = createContext<SwapsContextType | null>(null);

function swapsReducer(state: SwapsState, action: SwapsAction): SwapsState {
  switch (action.type) {
    case 'CREATE_PROPOSAL':
      return { ...state, proposals: [action.proposal, ...state.proposals] };

    case 'ACCEPT_PROPOSAL':
      return {
        ...state,
        proposals: state.proposals.map((p) =>
          p.id === action.id
            ? { ...p, status: 'accepted' as const, respondedAt: new Date().toISOString() }
            : p
        ),
      };

    case 'DECLINE_PROPOSAL':
      return {
        ...state,
        proposals: state.proposals.map((p) =>
          p.id === action.id
            ? { ...p, status: 'declined' as const, respondedAt: new Date().toISOString() }
            : p
        ),
      };

    case 'START_PROGRESS':
      return {
        ...state,
        proposals: state.proposals.map((p) =>
          p.id === action.id ? { ...p, status: 'in_progress' as const } : p
        ),
      };

    case 'MARK_COMPLETE': {
      return {
        ...state,
        proposals: state.proposals.map((p) => {
          if (p.id !== action.id) return p;

          const isProposer = action.userId === p.proposerId;
          const proposerCompleted = isProposer ? true : p.proposerCompleted;
          const recipientCompleted = isProposer ? p.recipientCompleted : true;
          const bothComplete = proposerCompleted && recipientCompleted;

          return {
            ...p,
            proposerCompleted,
            recipientCompleted,
            ...(bothComplete
              ? { status: 'completed' as const, completedAt: new Date().toISOString() }
              : {}),
          };
        }),
      };
    }

    case 'CANCEL_PROPOSAL':
      return {
        ...state,
        proposals: state.proposals.map((p) =>
          p.id === action.id ? { ...p, status: 'cancelled' as const } : p
        ),
      };

    default:
      return state;
  }
}

export function SwapsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(swapsReducer, {
    proposals: [...mockSwaps],
  });

  const createProposal = useCallback(
    (data: {
      proposerId: string;
      recipientId: string;
      offeredSkillId: string;
      requestedSkillId: string;
      message: string;
      conversationId: string;
    }) => {
      const proposal: SwapProposal = {
        id: generateId(),
        proposerId: data.proposerId,
        recipientId: data.recipientId,
        offeredSkillId: data.offeredSkillId,
        requestedSkillId: data.requestedSkillId,
        message: data.message,
        status: 'pending',
        proposedAt: new Date().toISOString(),
        respondedAt: null,
        completedAt: null,
        conversationId: data.conversationId,
        proposerCompleted: false,
        recipientCompleted: false,
      };
      dispatch({ type: 'CREATE_PROPOSAL', proposal });
    },
    []
  );

  const acceptProposal = useCallback((id: string) => {
    dispatch({ type: 'ACCEPT_PROPOSAL', id });
  }, []);

  const declineProposal = useCallback((id: string) => {
    dispatch({ type: 'DECLINE_PROPOSAL', id });
  }, []);

  const startProgress = useCallback((id: string) => {
    dispatch({ type: 'START_PROGRESS', id });
  }, []);

  const markComplete = useCallback((id: string, userId: string) => {
    dispatch({ type: 'MARK_COMPLETE', id, userId });
  }, []);

  const cancelProposal = useCallback((id: string) => {
    dispatch({ type: 'CANCEL_PROPOSAL', id });
  }, []);

  const getSwapById = useCallback(
    (id: string) => state.proposals.find((p) => p.id === id),
    [state.proposals]
  );

  const getSwapsForUser = useCallback(
    (userId: string) =>
      state.proposals.filter(
        (p) => p.proposerId === userId || p.recipientId === userId
      ),
    [state.proposals]
  );

  const getIncomingSwaps = useCallback(
    (userId: string) =>
      state.proposals.filter(
        (p) => p.recipientId === userId && p.status === 'pending'
      ),
    [state.proposals]
  );

  const getOutgoingSwaps = useCallback(
    (userId: string) =>
      state.proposals.filter(
        (p) => p.proposerId === userId && p.status === 'pending'
      ),
    [state.proposals]
  );

  const getActiveSwaps = useCallback(
    (userId: string) =>
      state.proposals.filter(
        (p) =>
          (p.proposerId === userId || p.recipientId === userId) &&
          (p.status === 'accepted' || p.status === 'in_progress')
      ),
    [state.proposals]
  );

  const getCompletedSwaps = useCallback(
    (userId: string) =>
      state.proposals.filter(
        (p) =>
          (p.proposerId === userId || p.recipientId === userId) &&
          (p.status === 'completed' || p.status === 'declined' || p.status === 'cancelled')
      ),
    [state.proposals]
  );

  return (
    <SwapsContext.Provider
      value={{
        proposals: state.proposals,
        createProposal,
        acceptProposal,
        declineProposal,
        startProgress,
        markComplete,
        cancelProposal,
        getSwapById,
        getSwapsForUser,
        getIncomingSwaps,
        getOutgoingSwaps,
        getActiveSwaps,
        getCompletedSwaps,
      }}
    >
      {children}
    </SwapsContext.Provider>
  );
}
