import { useParams, useNavigate, Navigate } from 'react-router'
import { useSkills } from '@/hooks/useSkills'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useSeo } from '@/hooks/useSeo'
import { SkillForm } from '@/components/skills/SkillForm'
import { EmptyState } from '@/components/ui/EmptyState'
import type { SkillListing } from '@/types'

export function EditListingPage() {
  useSeo({
    title: 'Edit Listing',
    description: 'Update your SkillSwap skill listing.',
    noindex: true,
  })

  const { skillId } = useParams()
  const navigate = useNavigate()
  const { getListingById, updateListing } = useSkills()
  const { currentUser } = useAuth()
  const { addToast } = useToast()

  const listing = skillId ? getListingById(skillId) : undefined

  if (!listing) {
    return (
      <EmptyState
        title="Listing not found"
        description="The listing you're trying to edit doesn't exist."
        action={{ label: 'My Listings', onClick: () => navigate('/my-listings') }}
      />
    )
  }

  if (listing.userId !== currentUser?.id) {
    return <Navigate to={`/skills/${listing.id}`} replace />
  }

  const handleSubmit = (data: Omit<SkillListing, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    updateListing(listing.id, data)
    addToast('Listing updated!', 'success')
    navigate(`/skills/${listing.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Listing</h1>
        <p className="text-slate-600 mt-1">Update your skill listing details</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <SkillForm
          initialData={listing}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/skills/${listing.id}`)}
        />
      </div>
    </div>
  )
}
