export type SwapStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface SwapProposal {
  id: string;
  proposerId: string;
  recipientId: string;
  offeredSkillId: string;
  requestedSkillId: string;
  message: string;
  status: SwapStatus;
  proposedAt: string;
  respondedAt: string | null;
  completedAt: string | null;
  conversationId: string;
  proposerCompleted: boolean;
  recipientCompleted: boolean;
}
