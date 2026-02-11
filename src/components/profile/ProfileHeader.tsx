import { Link } from 'react-router'
import type { User } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { VerifiedBadge } from './VerifiedBadge'
import { formatDate } from '@/utils/formatDate'

interface ProfileHeaderProps {
  user: User
  averageRating: number
  totalReviews: number
  totalSwapsCompleted: number
  isOwnProfile: boolean
}

export function ProfileHeader({
  user,
  averageRating,
  totalReviews,
  totalSwapsCompleted,
  isOwnProfile,
}: ProfileHeaderProps) {
  const fullName = `${user.firstName} ${user.lastName}`

  return (
    <Card className="p-8">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="self-start shrink-0 relative">
          <div className="rounded-full p-1 bg-gradient-to-br from-[#43c1a6] to-[#6366f1] shadow-lg shadow-primary-500/15">
            <div className="rounded-full p-0.5 bg-white">
              <Avatar
                src={user.avatarUrl}
                name={fullName}
                size="xl"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            {fullName}
            {user.isVerifiedNeighbour && <VerifiedBadge className="w-5 h-5" />}
          </h1>

          <p className="text-slate-500 mt-1">{user.neighbourhood}</p>
          <p className="text-sm text-slate-500 mt-1">
            Member since {formatDate(user.joinedAt)}
          </p>

          {isOwnProfile && (
            <div className="mt-4">
              <Link to="/profile/edit">
                <Button variant="outline" size="sm">
                  Edit Profile
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-100">
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-900">{totalSwapsCompleted}</p>
          <p className="text-sm text-slate-500">Swaps Completed</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl font-bold text-slate-900">
              {averageRating > 0 ? averageRating.toFixed(1) : '—'}
            </span>
            {averageRating > 0 && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 text-amber-400"
              >
                <path
                  fillRule="evenodd"
                  d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <p className="text-sm text-slate-500">Avg Rating</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-900">{totalReviews}</p>
          <p className="text-sm text-slate-500">Reviews</p>
        </div>
      </div>
    </Card>
  )
}
