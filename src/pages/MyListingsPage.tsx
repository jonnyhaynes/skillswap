import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useSkills } from '@/hooks/useSkills'
import { useAuth } from '@/hooks/useAuth'
import { SkillGrid } from '@/components/skills/SkillGrid'
import { Tabs } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'

export function MyListingsPage() {
  const { getListingsByUser } = useSkills()
  const { currentUser, allUsers } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('offered')

  const myListings = useMemo(
    () => (currentUser ? getListingsByUser(currentUser.id) : []),
    [currentUser, getListingsByUser]
  )

  const offered = useMemo(() => myListings.filter((l) => l.listingType === 'offered'), [myListings])
  const wanted = useMemo(() => myListings.filter((l) => l.listingType === 'wanted'), [myListings])

  const tabs = [
    { id: 'offered', label: 'Offering', count: offered.length },
    { id: 'wanted', label: 'Wanted', count: wanted.length },
  ]

  const displayedListings = activeTab === 'offered' ? offered : wanted

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Listings</h1>
          <p className="text-slate-600 mt-1">Manage your skill listings</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/skills/new')}>
          + Post a Skill
        </Button>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <SkillGrid listings={displayedListings} users={allUsers} />
    </div>
  )
}
