import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { useSkills } from '@/hooks/useSkills';
import { useSwaps } from '@/hooks/useSwaps';
import { useReviews } from '@/hooks/useReviews';
import { useToast } from '@/hooks/useToast';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkillBadge } from '@/components/skills/SkillBadge';
import { SwapStatusBadge } from '@/components/swaps/SwapStatusBadge';
import { SwapTimeline } from '@/components/swaps/SwapTimeline';
import { SwapActions } from '@/components/swaps/SwapActions';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewCard } from '@/components/reviews/ReviewCard';

export function SwapDetailPage() {
  const { swapId } = useParams();
  const navigate = useNavigate();
  const { currentUser, getUserById } = useAuth();
  const { getListingById } = useSkills();
  const { getSwapById, acceptProposal, declineProposal, startProgress, markComplete, cancelProposal } = useSwaps();
  const { addToast } = useToast();
  const { addReview, getReviewForSwap } = useReviews();
  const [showReviewForm, setShowReviewForm] = useState(false);

  const swap = swapId ? getSwapById(swapId) : undefined;

  if (!swap || !currentUser) {
    return (
      <EmptyState
        icon={
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
        title="Swap not found"
        description="The swap proposal you're looking for doesn't exist or has been removed."
        action={{
          label: 'Back to Swaps',
          onClick: () => navigate('/swaps'),
        }}
      />
    );
  }

  const otherUserId = swap.proposerId === currentUser.id ? swap.recipientId : swap.proposerId;
  const otherUser = getUserById(otherUserId);
  const proposer = getUserById(swap.proposerId);

  const offeredListing = getListingById(swap.offeredSkillId);
  const requestedListing = getListingById(swap.requestedSkillId);

  const existingReview = getReviewForSwap(swap.id, currentUser.id);
  const otherUserReview = otherUser ? getReviewForSwap(swap.id, otherUser.id) : undefined;

  const handleAccept = () => {
    acceptProposal(swap.id);
    addToast('Swap proposal accepted!', 'success');
  };

  const handleDecline = () => {
    declineProposal(swap.id);
    addToast('Swap proposal declined.', 'info');
  };

  const handleStartProgress = () => {
    startProgress(swap.id);
    addToast('Swap is now in progress!', 'success');
  };

  const handleComplete = () => {
    markComplete(swap.id, currentUser.id);
    addToast('Your side has been marked as complete!', 'success');
  };

  const handleCancel = () => {
    cancelProposal(swap.id);
    addToast('Swap has been cancelled.', 'info');
  };

  return (
    <div className="space-y-6">
      <Link
        to="/swaps"
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Swaps
      </Link>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Swap Details</h1>
        <SwapStatusBadge status={swap.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Timeline</h2>
            <SwapTimeline swap={swap} />
          </Card>

          {/* Skill exchange details */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Skill Exchange</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Offered skill */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Offered Skill
                </p>
                {offeredListing ? (
                  <div className="space-y-2">
                    <SkillBadge category={offeredListing.category} size="md" />
                    <p className="text-sm font-medium text-slate-900">{offeredListing.title}</p>
                    <p className="text-xs text-slate-500">{offeredListing.description}</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Skill listing not found</p>
                )}
              </div>

              {/* Requested skill */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Requested Skill
                </p>
                {requestedListing ? (
                  <div className="space-y-2">
                    <SkillBadge category={requestedListing.category} size="md" />
                    <p className="text-sm font-medium text-slate-900">{requestedListing.title}</p>
                    <p className="text-xs text-slate-500">{requestedListing.description}</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Skill listing not found</p>
                )}
              </div>
            </div>
          </Card>

          {/* Proposal message */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">Proposal Message</h2>
            {proposer && (
              <p className="text-xs text-slate-500 mb-3">
                From {proposer.firstName} {proposer.lastName}
              </p>
            )}
            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
              {swap.message}
            </p>
          </Card>
        </div>

        {/* Right section */}
        <div className="space-y-4">
          {/* Actions */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Actions</h2>
            <SwapActions
              swap={swap}
              currentUserId={currentUser.id}
              onAccept={handleAccept}
              onDecline={handleDecline}
              onComplete={handleComplete}
              onCancel={handleCancel}
              onStartProgress={handleStartProgress}
            />
          </Card>

          {/* Other user card */}
          {otherUser && (
            <Card className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar
                  src={otherUser.avatarUrl}
                  name={`${otherUser.firstName} ${otherUser.lastName}`}
                  size="lg"
                />
                <h3 className="mt-3 text-lg font-semibold text-slate-900">
                  {otherUser.firstName} {otherUser.lastName}
                </h3>
                <p className="text-sm text-slate-500">{otherUser.neighbourhood}</p>
              </div>

              <div className="mt-4">
                <Link to={`/profile/${otherUser.id}`}>
                  <button className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    View Profile
                  </button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Reviews Section - only for completed swaps */}
      {swap.status === 'completed' && (
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Reviews</h2>

          {/* Show existing review by current user */}
          {existingReview && (
            <Card className="p-4">
              <p className="text-xs font-medium text-slate-500 mb-2">Your Review</p>
              <ReviewCard review={existingReview} reviewer={currentUser} />
            </Card>
          )}

          {/* Show review from other user */}
          {otherUserReview && otherUser && (
            <Card className="p-4">
              <p className="text-xs font-medium text-slate-500 mb-2">Their Review</p>
              <ReviewCard review={otherUserReview} reviewer={otherUser} />
            </Card>
          )}

          {/* Show leave review button or form */}
          {!existingReview && (
            <Card className="p-6">
              {showReviewForm ? (
                <>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Leave a Review</h3>
                  <ReviewForm
                    swapId={swap.id}
                    revieweeId={otherUserId}
                    skillCategory={offeredListing?.category ?? 'other'}
                    onSubmit={(data) => {
                      addReview({
                        swapId: swap.id,
                        reviewerId: currentUser.id,
                        revieweeId: otherUserId,
                        rating: data.rating,
                        comment: data.comment,
                        skillCategory: offeredListing?.category ?? 'other',
                      });
                      addToast('Review submitted successfully!', 'success');
                      setShowReviewForm(false);
                    }}
                    onCancel={() => setShowReviewForm(false)}
                  />
                </>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-3">How was your swap experience?</p>
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="inline-flex items-center rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
                  >
                    Leave a Review
                  </button>
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
