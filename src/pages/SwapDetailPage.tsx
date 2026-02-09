import { useState, useEffect } from 'react';
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
  const { addReview, getReviewForSwap, fetchReviewForSwap } = useReviews();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);

  const swap = swapId ? getSwapById(swapId) : undefined;

  // Fetch reviews for completed swaps so we know if a review already exists
  useEffect(() => {
    if (swap?.status === 'completed' && currentUser) {
      setReviewsLoaded(false)
      const otherUserId = swap.proposerId === currentUser.id ? swap.recipientId : swap.proposerId
      Promise.all([
        fetchReviewForSwap(swap.id, currentUser.id),
        fetchReviewForSwap(swap.id, otherUserId),
      ]).finally(() => setReviewsLoaded(true))
    }
  }, [swap?.id, swap?.status, currentUser?.id, swap?.proposerId, swap?.recipientId, fetchReviewForSwap])

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
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Swaps
      </Link>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">Swap Details</h1>
        <SwapStatusBadge status={swap.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skill exchange details */}
          <Card className="p-6 overflow-hidden">
            <h2 className="text-base font-bold text-slate-900 font-display mb-5">Skill Exchange</h2>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-start">
              {/* Offered skill */}
              <div className="rounded-xl bg-primary-50/60 p-4 space-y-2.5">
                <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
                  Offered
                </p>
                {offeredListing ? (
                  <div className="space-y-2">
                    <SkillBadge category={offeredListing.category} size="md" />
                    <p className="text-sm font-bold text-slate-900">{offeredListing.title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{offeredListing.description}</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Skill listing not found</p>
                )}
              </div>

              {/* Swap arrow */}
              <div className="hidden sm:flex items-center justify-center self-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#43c1a6] to-[#6366f1] flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
              </div>

              {/* Mobile swap arrow */}
              <div className="flex sm:hidden items-center justify-center py-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#43c1a6] to-[#6366f1] flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-white rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
              </div>

              {/* Requested skill */}
              <div className="rounded-xl bg-amber-50/60 p-4 space-y-2.5">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                  Requested
                </p>
                {requestedListing ? (
                  <div className="space-y-2">
                    <SkillBadge category={requestedListing.category} size="md" />
                    <p className="text-sm font-bold text-slate-900">{requestedListing.title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{requestedListing.description}</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Skill listing not found</p>
                )}
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <h2 className="text-base font-bold text-slate-900 font-display mb-4">Timeline</h2>
            <SwapTimeline swap={swap} />
          </Card>

          {/* Proposal message */}
          <Card className="p-6">
            <h2 className="text-base font-bold text-slate-900 font-display mb-2">Proposal Message</h2>
            {proposer && (
              <div className="flex items-center gap-2 mb-3">
                <div className="shrink-0 rounded-full p-0.5 bg-gradient-to-br from-[#43c1a6] to-[#6366f1]">
                  <div className="rounded-full p-0.5 bg-white">
                    <Avatar
                      src={proposer.avatarUrl}
                      name={`${proposer.firstName} ${proposer.lastName}`}
                      size="sm"
                    />
                  </div>
                </div>
                <span className="text-sm text-slate-500">
                  {proposer.firstName} {proposer.lastName}
                </span>
              </div>
            )}
            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 rounded-xl p-4">
              {swap.message}
            </p>
          </Card>
        </div>

        {/* Right section */}
        <div className="space-y-4">
          {/* Actions */}
          <Card className="p-6">
            <h2 className="text-base font-bold text-slate-900 font-display mb-4">Actions</h2>
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
                <div className="rounded-full p-0.5 bg-gradient-to-br from-[#43c1a6] to-[#6366f1]">
                  <div className="rounded-full p-0.5 bg-white">
                    <Avatar
                      src={otherUser.avatarUrl}
                      name={`${otherUser.firstName} ${otherUser.lastName}`}
                      size="lg"
                    />
                  </div>
                </div>
                <h3 className="mt-3 text-lg font-bold text-slate-900 font-display">
                  {otherUser.firstName} {otherUser.lastName}
                </h3>
                <p className="text-sm text-slate-500">{otherUser.neighbourhood}</p>
              </div>

              <div className="mt-4">
                <Link to={`/profile/${otherUser.id}`}>
                  <button className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all duration-200">
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
        <div className="space-y-4 pt-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">Reviews</h2>

          {/* Show existing review by current user */}
          {existingReview && (
            <Card className="p-5">
              <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-3">Your Review</p>
              <ReviewCard review={existingReview} reviewer={currentUser} />
            </Card>
          )}

          {/* Show review from other user */}
          {otherUserReview && otherUser && (
            <Card className="p-5">
              <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-3">Their Review</p>
              <ReviewCard review={otherUserReview} reviewer={otherUser} />
            </Card>
          )}

          {/* Show leave review button or form */}
          {!existingReview && reviewsLoaded && (
            <Card className="p-6">
              {showReviewForm ? (
                <>
                  <h3 className="text-base font-bold text-slate-900 font-display mb-4">Leave a Review</h3>
                  <ReviewForm
                    swapId={swap.id}
                    revieweeId={otherUserId}
                    skillCategory={offeredListing?.category ?? 'other'}
                    onSubmit={async (data) => {
                      try {
                        const review = await addReview({
                          swapId: swap.id,
                          reviewerId: currentUser.id,
                          revieweeId: otherUserId,
                          rating: data.rating,
                          comment: data.comment,
                          skillCategory: offeredListing?.category ?? 'other',
                        });
                        if (review) {
                          addToast('Review submitted successfully!', 'success');
                          setShowReviewForm(false);
                        } else {
                          addToast('Failed to submit review. Please try again.', 'error');
                        }
                      } catch (err) {
                        const message = err instanceof Error ? err.message : 'Failed to submit review';
                        addToast(message, 'error');
                      }
                    }}
                    onCancel={() => setShowReviewForm(false)}
                  />
                </>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-slate-600 mb-4">How was your swap experience?</p>
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="inline-flex items-center rounded-xl bg-gradient-to-r from-[#43c1a6] to-[#6366f1] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-all duration-200"
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
