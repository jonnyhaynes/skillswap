import { useState } from 'react';
import type { SwapProposal } from '@/types';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface SwapActionsProps {
  swap: SwapProposal;
  currentUserId: string;
  onAccept: () => void;
  onDecline: () => void;
  onComplete: () => void;
  onCancel: () => void;
}

export function SwapActions({
  swap,
  currentUserId,
  onAccept,
  onDecline,
  onComplete,
  onCancel,
}: SwapActionsProps) {
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const isProposer = swap.proposerId === currentUserId;
  const isRecipient = swap.recipientId === currentUserId;

  const hasCurrentUserCompleted = isProposer
    ? swap.proposerCompleted
    : swap.recipientCompleted;

  if (swap.status === 'pending') {
    if (isRecipient) {
      return (
        <>
          <div className="flex gap-3">
            <Button variant="primary" onClick={onAccept} className="flex-1">
              Accept
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowDeclineDialog(true)}
              className="flex-1"
            >
              Decline
            </Button>
          </div>

          <ConfirmDialog
            isOpen={showDeclineDialog}
            title="Decline Proposal"
            message="Are you sure you want to decline this swap proposal? This action cannot be undone."
            confirmLabel="Decline"
            variant="danger"
            onConfirm={() => {
              onDecline();
              setShowDeclineDialog(false);
            }}
            onCancel={() => setShowDeclineDialog(false)}
          />
        </>
      );
    }

    if (isProposer) {
      return (
        <>
          <Button
            variant="outline"
            onClick={() => setShowCancelDialog(true)}
            className="w-full"
          >
            Cancel Proposal
          </Button>

          <ConfirmDialog
            isOpen={showCancelDialog}
            title="Cancel Proposal"
            message="Are you sure you want to cancel this swap proposal? This action cannot be undone."
            confirmLabel="Cancel Proposal"
            variant="danger"
            onConfirm={() => {
              onCancel();
              setShowCancelDialog(false);
            }}
            onCancel={() => setShowCancelDialog(false)}
          />
        </>
      );
    }
  }

  if (swap.status === 'in_progress') {
    return (
      <>
        <div className="space-y-3">
          <Button
            variant="primary"
            onClick={onComplete}
            disabled={hasCurrentUserCompleted}
            className="w-full"
          >
            {hasCurrentUserCompleted ? 'Your Side Completed' : 'Mark My Side Complete'}
          </Button>
          {hasCurrentUserCompleted && (
            <p className="text-xs text-slate-500 text-center">
              Waiting for the other person to complete their side.
            </p>
          )}
          <Button
            variant="outline"
            onClick={() => setShowCancelDialog(true)}
            className="w-full"
          >
            Cancel Swap
          </Button>
        </div>

        <ConfirmDialog
          isOpen={showCancelDialog}
          title="Cancel Swap"
          message="Are you sure you want to cancel this swap? Any progress will be lost. This action cannot be undone."
          confirmLabel="Cancel Swap"
          variant="danger"
          onConfirm={() => {
            onCancel();
            setShowCancelDialog(false);
          }}
          onCancel={() => setShowCancelDialog(false)}
        />
      </>
    );
  }

  // completed, declined, cancelled
  const statusText: Record<string, string> = {
    completed: 'This swap has been completed.',
    declined: 'This swap proposal was declined.',
    cancelled: 'This swap has been cancelled.',
  };

  return (
    <p className="text-sm text-slate-500 text-center py-2">
      {statusText[swap.status] ?? ''}
    </p>
  );
}
