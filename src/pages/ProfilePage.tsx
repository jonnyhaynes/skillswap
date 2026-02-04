import { useParams } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

export function ProfilePage() {
  const { userId } = useParams()
  const { getUserById, currentUser } = useAuth()

  const user = userId ? getUserById(userId) : undefined

  if (!user) {
    return (
      <EmptyState
        title="User not found"
        description="The user you're looking for doesn't exist or may have been removed."
      />
    )
  }

  const isOwnProfile = currentUser?.id === user.id

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <ProfileHeader
        user={user}
        averageRating={0}
        totalReviews={0}
        totalSwapsCompleted={0}
        isOwnProfile={isOwnProfile}
      />

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">About</h2>
        {user.bio ? (
          <p className="text-slate-600 leading-relaxed">{user.bio}</p>
        ) : (
          <p className="text-slate-400 italic">No bio yet.</p>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Skills Offered</h2>
          {user.skillsOffered.length > 0 ? (
            <ul className="space-y-2">
              {user.skillsOffered.map((skillId) => (
                <li
                  key={skillId}
                  className="text-sm text-slate-600 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                  {skillId}
                </li>
              ))}
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
          {user.skillsWanted.length > 0 ? (
            <ul className="space-y-2">
              {user.skillsWanted.map((skillId) => (
                <li
                  key={skillId}
                  className="text-sm text-slate-600 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  {skillId}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No skills wanted"
              description="This user hasn't listed any skills they're looking for yet."
            />
          )}
        </Card>
      </div>
    </div>
  )
}
