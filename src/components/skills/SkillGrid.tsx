import { useEffect, useState } from 'react'
import type { SkillListing, User } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { SkillCard } from './SkillCard'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

interface SkillGridProps {
  listings: SkillListing[]
  /** When true, each card animates in with a stagger. Used on the homepage. */
  staggerReveal?: boolean
  /** Pre-fetched user map. When provided, SkillGrid skips its own user fetch. */
  preloadedUsers?: Map<string, User>
  /** Called when "Load more" is clicked. If omitted, no button is shown. */
  onLoadMore?: () => void
  /** Number of results not yet visible. Shown in the button label. */
  remainingCount?: number
}

export function SkillGrid({ listings, staggerReveal, preloadedUsers, onLoadMore, remainingCount }: SkillGridProps) {
  const { fetchUsersByIds } = useAuth()
  const [users, setUsers] = useState<Map<string, User>>(preloadedUsers ?? new Map())
  const [loading, setLoading] = useState(!preloadedUsers && listings.length > 0)

  useEffect(() => {
    // Skip fetching if users were preloaded
    if (preloadedUsers) {
      setUsers(preloadedUsers)
      setLoading(false)
      return
    }

    if (listings.length === 0) {
      return
    }

    let cancelled = false
    const userIds = [...new Set(listings.map((l) => l.userId))]

    fetchUsersByIds(userIds).then((fetchedUsers) => {
      if (cancelled) return
      const userMap = new Map<string, User>()
      fetchedUsers.forEach((user) => userMap.set(user.id, user))
      setUsers(userMap)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [listings, fetchUsersByIds, preloadedUsers])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
            <div className="h-1.5 bg-slate-200" />
            <div className="p-6">
              <div className="h-3 bg-slate-200 rounded w-20 mb-4" />
              <div className="h-6 bg-slate-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-slate-200 rounded w-full mb-2" />
              <div className="h-4 bg-slate-200 rounded w-2/3 mb-6" />
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-slate-200 rounded-full" />
                <div className="h-3 bg-slate-200 rounded w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        }
        title="No skills found"
        description="Try adjusting your search or filters"
      />
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing, index) => {
          const user = users.get(listing.userId)
          if (!user) return null
          return (
            <div
              key={listing.id}
              className={staggerReveal ? 'scroll-reveal revealed' : undefined}
              style={staggerReveal ? { animationDelay: `${0.08 + index * 0.08}s` } : undefined}
            >
              <SkillCard listing={listing} user={user} />
            </div>
          )
        })}
      </div>

      {onLoadMore && remainingCount !== undefined && remainingCount > 0 && (
        <div className="mt-8 flex justify-center">
          <Button variant="outline" onClick={onLoadMore}>
            Load more ({remainingCount} remaining)
          </Button>
        </div>
      )}
    </div>
  )
}
