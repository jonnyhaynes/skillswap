import { useEffect, useState } from 'react'
import type { SkillListing, User } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { SkillCard } from './SkillCard'
import { EmptyState } from '@/components/ui/EmptyState'

interface SkillGridProps {
  listings: SkillListing[]
}

export function SkillGrid({ listings }: SkillGridProps) {
  const { fetchUsersByIds } = useAuth()
  const [users, setUsers] = useState<Map<string, User>>(new Map())
  const [loading, setLoading] = useState(listings.length > 0)

  useEffect(() => {
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
  }, [listings, fetchUsersByIds])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
            <div className="h-3 bg-slate-200 rounded w-1/2 mb-2" />
            <div className="h-3 bg-slate-200 rounded w-full mb-2" />
            <div className="h-3 bg-slate-200 rounded w-2/3" />
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {listings.map((listing) => {
        const user = users.get(listing.userId)
        if (!user) return null
        return <SkillCard key={listing.id} listing={listing} user={user} />
      })}
    </div>
  )
}
