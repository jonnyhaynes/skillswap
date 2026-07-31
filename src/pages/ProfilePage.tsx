import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { useSkills } from '@/hooks/useSkills'
import { useReviews } from '@/hooks/useReviews'
import { useSwaps } from '@/hooks/useSwaps'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ReviewSummary } from '@/components/reviews/ReviewSummary'
import { ReviewList } from '@/components/reviews/ReviewList'
import { getCategoryInfo } from '@/data/categories'
import { useSeo } from '@/hooks/useSeo'
import { truncateDescription } from '@/lib/seo'
import { graph, personSchema } from '@/lib/structuredData'
import { shortName } from '@/utils/displayName'

export function ProfilePage() {
  const { userId } = useParams()
  const { getUserById, fetchUserById, currentUser } = useAuth()
  const { getListingsByUser } = useSkills()
  const { getReviewsForUser, getAverageRating, getTotalReviews, fetchReviewsForUser } = useReviews()
  const { proposals } = useSwaps()
  const [loading, setLoading] = useState(false)
  const [fetchAttempted, setFetchAttempted] = useState(false)

  const user = userId ? getUserById(userId) : undefined

  useEffect(() => {
    if (userId && !user && !fetchAttempted) {
      setLoading(true)
      fetchUserById(userId).finally(() => {
        setLoading(false)
        setFetchAttempted(true)
      })
    }
  }, [userId, user, fetchAttempted, fetchUserById])

  useEffect(() => {
    if (userId) {
      fetchReviewsForUser(userId)
    }
  }, [userId, fetchReviewsForUser])

  const publicName = user ? shortName(user) : ''
  const profileRating = user ? getAverageRating(user.id) : 0
  const profileReviews = user ? getTotalReviews(user.id) : 0

  useSeo(
    user
      ? {
          title: `${publicName} — ${user.neighbourhood ?? 'SkillSwap member'}`,
          description: truncateDescription(
            user.bio ||
              `${publicName} is a SkillSwap member${user.neighbourhood ? ` in ${user.neighbourhood}` : ''}. See the skills they offer and are looking for.`
          ),
          canonical: `/profile/${user.id}`,
          type: 'profile',
          jsonLd: graph(
            personSchema({
              id: user.id,
              name: publicName,
              bio: user.bio,
              avatarUrl: user.avatarUrl,
              neighbourhood: user.neighbourhood,
              averageRating: profileRating,
              totalReviews: profileReviews,
            })
          ),
        }
      : {
          title: fetchAttempted ? 'Member Not Found' : 'Member Profile',
          canonical: userId ? `/profile/${userId}` : '/browse',
          noindex: fetchAttempted,
        }
  )

  if (loading || (!user && !fetchAttempted)) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return (
      <EmptyState
        title="User not found"
        description="The user you're looking for doesn't exist or may have been removed."
      />
    )
  }

  const isOwnProfile = currentUser?.id === user.id
  const averageRating = getAverageRating(user.id)
  const totalReviews = getTotalReviews(user.id)
  const userReviews = getReviewsForUser(user.id)
  const userListings = getListingsByUser(user.id)

  const completedSwapsCount = proposals.filter(
    (p) => p.status === 'completed' && (p.proposerId === user.id || p.recipientId === user.id)
  ).length

  const offeredListings = userListings.filter((l) => l.listingType === 'offered')
  const wantedListings = userListings.filter((l) => l.listingType === 'wanted')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <ProfileHeader
        user={user}
        averageRating={averageRating}
        totalReviews={totalReviews}
        totalSwapsCompleted={completedSwapsCount}
        isOwnProfile={isOwnProfile}
      />

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">About</h2>
        {user.bio ? (
          <p className="text-slate-600 leading-relaxed">{user.bio}</p>
        ) : (
          <p className="text-slate-500 italic">No bio yet.</p>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Skills Offered</h2>
          {offeredListings.length > 0 ? (
            <ul className="space-y-2">
              {offeredListings.map((listing) => {
                const categoryInfo = getCategoryInfo(listing.category)
                return (
                  <li
                    key={listing.id}
                    className="text-sm text-slate-600 flex items-center gap-2"
                  >
                    <Badge className={`${categoryInfo.bgColor} ${categoryInfo.textColor}`}>
                      {categoryInfo.emoji} {categoryInfo.label}
                    </Badge>
                    <span>{listing.title}</span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <EmptyState
              title="No skills offered"
              description="This user hasn't listed any skills to offer yet."
            />
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Skills Wanted</h2>
          {wantedListings.length > 0 ? (
            <ul className="space-y-2">
              {wantedListings.map((listing) => {
                const categoryInfo = getCategoryInfo(listing.category)
                return (
                  <li
                    key={listing.id}
                    className="text-sm text-slate-600 flex items-center gap-2"
                  >
                    <Badge className={`${categoryInfo.bgColor} ${categoryInfo.textColor}`}>
                      {categoryInfo.emoji} {categoryInfo.label}
                    </Badge>
                    <span>{listing.title}</span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <EmptyState
              title="No skills wanted"
              description="This user hasn't listed any skills they're looking for yet."
            />
          )}
        </Card>
      </div>

      {/* Reviews Section */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Reviews</h2>
        <ReviewSummary reviews={userReviews} />
        <div className="mt-6 pt-6 border-t border-slate-200">
          <ReviewList reviews={userReviews} />
        </div>
      </Card>
    </div>
  )
}
